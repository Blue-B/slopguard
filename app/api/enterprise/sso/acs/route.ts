import { NextResponse } from "next/server";
import { getState, ensureConsoleReady } from "@/lib/billing/console-store";
import { parseAcs, ssoBaseUrl } from "@/lib/auth/saml";
import { SESSION_COOKIE, cookieOptions, encodeSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Assertion Consumer Service: the IdP POSTs the signed SAMLResponse here.
// We validate the signature against the tenant's IdP metadata, then mint a
// SlopGuard session scoped to the owner (so the SSO user lands in the org's
// console under the org's plan).
export async function POST(req: Request) {
	await ensureConsoleReady();
	let samlResponse = "";
	let owner = "";
	try {
		const form = await req.formData();
		samlResponse = String(form.get("SAMLResponse") || "");
		owner = String(form.get("RelayState") || "")
			.toLowerCase()
			.replace(/^@/, "");
	} catch {
		return NextResponse.json({ error: "expected form-encoded SAMLResponse" }, { status: 400 });
	}
	if (!samlResponse || !owner) {
		return NextResponse.json({ error: "missing SAMLResponse or RelayState" }, { status: 400 });
	}
	const cfg = getState(owner).ssoConfig;
	if (!cfg.idpMetadataUrl) {
		return NextResponse.json({ error: "unknown SSO tenant" }, { status: 400 });
	}
	try {
		const id = await parseAcs(
			cfg.idpMetadataUrl,
			samlResponse,
			cfg.emailAttribute,
			cfg.loginAttribute,
		);
		// The session is the asserted IdP user (a member), scoped to the tenant
		// owner for READ access only. The login is namespaced with an `sso:` prefix
		// (GitHub logins can never contain ':'), so an IdP-asserted value can never
		// collide with a real GitHub owner login. Every owner-keyed check therefore
		// resolves this principal to the free plan -> writes/admin are denied.
		const asserted = (id.login || id.email || id.nameId || "user").slice(0, 120);
		const memberLogin = `sso:${owner}:${asserted}`;
		const cookieValue = encodeSession({
			login: memberLogin,
			name: id.email || memberLogin,
			avatar: "",
			email: id.email || null,
			profileUrl: "",
			sso: { owner },
		});
		const res = NextResponse.redirect(`${ssoBaseUrl()}/org`, 303);
		res.cookies.set(SESSION_COOKIE, cookieValue, cookieOptions);
		return res;
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "SAML assertion validation failed" },
			{ status: 401 },
		);
	}
}
