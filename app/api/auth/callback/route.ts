import { NextResponse } from "next/server";
import { exchangeCode, fetchUser } from "@/lib/auth/github";
import {
	SESSION_COOKIE,
	cookieOptions,
	encodeSession,
	verifyOAuthState,
} from "@/lib/auth/session";
import { getAppBaseUrl } from "@/lib/env";
import { getState, ensureConsoleReady } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	await ensureConsoleReady();
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieState = req.headers
		.get("cookie")
		?.match(/sg_oauth_state=([^;]+)/)?.[1];

	const lang = req.headers.get("cookie")?.match(/sg_lang=ko/) ? "/ko" : "";
	const base = getAppBaseUrl();
	const fail = (reason: string) =>
		NextResponse.redirect(`${base}${lang}/account?error=${reason}`);

	const validCookieState = Boolean(cookieState && state === cookieState);
	const validSignedState = verifyOAuthState(state ?? undefined);
	if (!code || !state || (!validCookieState && !validSignedState)) {
		return fail("state");
	}

	const token = await exchangeCode(code);
	if (!token) return fail("exchange");

	const user = await fetchUser(token);
	if (!user) return fail("profile");

	// Enterprise SSO enforcement: if this owner has mandated SSO (config active +
	// enforced), GitHub password login is bounced to the SAML login so identity
	// is governed by their IdP.
	//
	// Break-glass: SSO_ENFORCE_BYPASS (comma-separated logins, operator-set on the
	// host) lets a locked-out customer GitHub-login normally — e.g. if their IdP
	// metadata breaks while enforcement is on — so support can recover them. This
	// is the standard escape hatch for self-enforced SSO lockouts.
	const bypass = new Set(
		(process.env.SSO_ENFORCE_BYPASS ?? "")
			.split(",")
			.map((s) => s.trim().toLowerCase().replace(/^@/, ""))
			.filter(Boolean),
	);
	const sso = getState(user.login).ssoConfig;
	if (
		!bypass.has(user.login.toLowerCase().replace(/^@/, "")) &&
		sso.enforced &&
		sso.status === "active" &&
		sso.idpMetadataUrl
	) {
		const owner = user.login.toLowerCase().replace(/^@/, "");
		const ssoRes = NextResponse.redirect(
			`${base}/api/enterprise/sso/login?owner=${encodeURIComponent(owner)}`,
		);
		ssoRes.cookies.set("sg_oauth_state", "", { path: "/", maxAge: 0 });
		return ssoRes;
	}

	const res = NextResponse.redirect(`${base}${lang}/account`);
	res.cookies.set(SESSION_COOKIE, encodeSession(user), cookieOptions);
	res.cookies.set("sg_oauth_state", "", { path: "/", maxAge: 0 });
	return res;
}
