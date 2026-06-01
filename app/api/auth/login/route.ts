import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeUrl, oauthConfigured } from "@/lib/auth/github";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
	if (!oauthConfigured()) {
		return NextResponse.json(
			{
				error: "GitHub OAuth not configured (set GITHUB_APP_CLIENT_ID/SECRET)",
			},
			{ status: 501 },
		);
	}
	const lang =
		new URL(req.url).searchParams.get("lang") === "ko" ? "ko" : "en";
	const state = randomBytes(16).toString("hex");
	const res = NextResponse.redirect(authorizeUrl(state));
	res.cookies.set("sg_lang", lang, {
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 600,
	});
	res.cookies.set("sg_oauth_state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 600,
	});
	return res;
}
