import { NextResponse } from "next/server";
import { exchangeCode, fetchUser } from "@/lib/auth/github";
import {
	SESSION_COOKIE,
	cookieOptions,
	encodeSession,
} from "@/lib/auth/session";
import { getAppBaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

	if (!code || !state || !cookieState || state !== cookieState) {
		return fail("state");
	}

	const token = await exchangeCode(code);
	if (!token) return fail("exchange");

	const user = await fetchUser(token);
	if (!user) return fail("profile");

	const res = NextResponse.redirect(`${base}${lang}/account`);
	res.cookies.set(SESSION_COOKIE, encodeSession(user), cookieOptions);
	res.cookies.set("sg_oauth_state", "", { path: "/", maxAge: 0 });
	return res;
}
