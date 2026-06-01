import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getAppBaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
	const lang = req.headers.get("cookie")?.match(/sg_lang=ko/) ? "/ko" : "";
	const res = NextResponse.redirect(`${getAppBaseUrl()}${lang}`);
	res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
	res.cookies.set("sg_lang", "", { path: "/", maxAge: 0 });
	return res;
}
