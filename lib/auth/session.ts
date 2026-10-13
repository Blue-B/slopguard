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
	/**
	 * Present only for sessions minted via Enterprise SAML SSO. `login` is the
	 * asserted IdP identity (NOT the org owner); `sso.owner` is the tenant whose
	 * console data this member may READ. Write/admin endpoints stay keyed
	 * to `login`, so an SSO member can use the console but cannot mutate
	 * alerts, integrations, or SSO config (those require the owner).
	 */
	sso?: { owner: string };
}

/**
 * The account whose entitlement + data a session is scoped to. For normal
 * (GitHub) logins this is the login itself; for SSO members it is the tenant
 * owner so they inherit the org's plan for read access.
 */
export function effectiveOwner(session: SessionUser): string {
	return session.sso?.owner ?? session.login;
}

function secret(): string {
	const s =
		process.env.SESSION_SECRET ||
		process.env.GITHUB_WEBHOOK_SECRET ||
		process.env.GITHUB_APP_CLIENT_SECRET;
	if (s) return s;
	if (process.env.NODE_ENV === "production") {
		throw new Error(
			"SESSION_SECRET or a GitHub secret is required in production",
		);
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

function fromB64url(value: string): string {
	return Buffer.from(
		value.replace(/-/g, "+").replace(/_/g, "/"),
		"base64",
	).toString("utf8");
}

function sign(payload: string): string {
	return b64url(createHmac("sha256", secret()).update(payload).digest());
}

export function encodeOAuthState(nonce: string): string {
	const payload = b64url(JSON.stringify({ nonce, ts: Date.now() }));
	return `${payload}.${sign(payload)}`;
}

export function verifyOAuthState(value: string | undefined): boolean {
	if (!value) return false;
	const dot = value.lastIndexOf(".");
	if (dot < 0) return false;
	const payload = value.slice(0, dot);
	const sig = value.slice(dot + 1);
	const expected = sign(payload);
	const a = Buffer.from(sig);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
	try {
		const json = JSON.parse(fromB64url(payload)) as { ts?: number };
		return (
			typeof json.ts === "number" && Date.now() - json.ts <= 10 * 60 * 1000
		);
	} catch {
		return false;
	}
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
		const json = JSON.parse(fromB64url(payload)) as SessionUser;
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
