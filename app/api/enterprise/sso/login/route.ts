import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getState, ensureConsoleReady } from "@/lib/billing/console-store";
import { buildLoginRedirect } from "@/lib/auth/saml";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SP-initiated SSO: /api/enterprise/sso/login?owner=<github-login>
// owner falls back to the logged-in admin (for testing from the SSO console).
export async function GET(req: Request) {
	await ensureConsoleReady();
	const url = new URL(req.url);
	let owner = (url.searchParams.get("owner") || "").toLowerCase().replace(/^@/, "");
	if (!owner) {
		const store = await cookies();
		const session = decodeSession(store.get(SESSION_COOKIE)?.value);
		owner = session?.login.toLowerCase().replace(/^@/, "") || "";
	}
	if (!owner) {
		return NextResponse.json({ error: "owner query param required" }, { status: 400 });
	}
	const cfg = getState(owner).ssoConfig;
	if (!cfg.idpMetadataUrl) {
		return NextResponse.json({ error: "SSO is not configured for this owner" }, { status: 400 });
	}
	if (cfg.status !== "active") {
		return NextResponse.json({ error: "SSO is not active for this owner" }, { status: 400 });
	}
	try {
		const redirect = await buildLoginRedirect(cfg.idpMetadataUrl, owner);
		return NextResponse.redirect(redirect, 302);
	} catch (e) {
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "SSO login init failed" },
			{ status: 502 },
		);
	}
}
