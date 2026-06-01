import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless session: a signed cookie holds the GitHub profile we captured at
// login. No database. HMAC-SHA256 over the base64url payload with SESSION_SECRET
// (falls back to the webhook secret so the app still boots in dev).

export const SESSION_COOKIE = "sg_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
	login: string;
	name: string | null;
	avatar: string;
	email: string | null;
	profileUrl: string;
	ts: number;
}

function secret(): string {
	const s = process.env.SESSION_SECRET;
	if (s) return s;
	if (process.env.NODE_ENV === "production") {
		throw new Error("SESSION_SECRET is required in production");
	}
	return "dev-insecure-secret";
}

function b64url(buf: Buffer | string): string {
	return Buffer.from(buf)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function sign(payload: string): string {
	return b64url(createHmac("sha256", secret()).update(payload).digest());
}

/** Serialize + sign a session into a cookie value. */
export function encodeSession(user: Omit<SessionUser, "ts">): string {
	const payload = b64url(JSON.stringify({ ...user, ts: Date.now() }));
	return `${payload}.${sign(payload)}`;
}

/** Verify + parse a cookie value back into a session, or null. */
export function decodeSession(value: string | undefined): SessionUser | null {
	if (!value) return null;
	const dot = value.lastIndexOf(".");
	if (dot < 0) return null;
	const payload = value.slice(0, dot);
	const sig = value.slice(dot + 1);
	const expected = sign(payload);
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	try {
		const json = JSON.parse(
			Buffer.from(
				payload.replace(/-/g, "+").replace(/_/g, "/"),
				"base64",
			).toString("utf8"),
		) as SessionUser;
		if (Date.now() - json.ts > MAX_AGE * 1000) return null;
		return json;
	} catch {
		return null;
	}
}

export const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "lax" as const,
	path: "/",
	maxAge: MAX_AGE,
};
