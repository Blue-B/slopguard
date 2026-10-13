import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ authenticated: false });
	}
	// Display login strips the internal `sso:<owner>:` prefix.
	const displayLogin = session.sso
		? session.login.replace(/^sso:[^:]+:/, "")
		: session.login;
	return NextResponse.json({
		authenticated: true,
		login: displayLogin,
		name: session.name,
		avatar: session.avatar,
	});
}
