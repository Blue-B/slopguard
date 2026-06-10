import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { getRepoSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Read-only slop stats for a repo where SlopGuard is installed. Powers the
// inline "look up a public repo" widget on the account page. PUBLIC repos only
// for anonymous viewers; a private repo's stats are returned only to its
// authenticated owner (the installation token could read them, so visibility
// is enforced here and inside getRepoSlopStats).
export async function GET(req: Request) {
	const url = new URL(req.url);
	const owner = (url.searchParams.get("owner") ?? "").trim();
	const repo = (url.searchParams.get("repo") ?? "").trim();
	if (!owner || !repo || /[^\w.-]/.test(owner) || /[^\w.-]/.test(repo)) {
		return NextResponse.json({ error: "invalid owner/repo" }, { status: 400 });
	}
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const allowPrivate =
		Boolean(session) && session!.login.toLowerCase() === owner.toLowerCase();
	try {
		const s = await getRepoSlopStats(owner, repo, undefined, undefined, allowPrivate);
		return NextResponse.json({
			repo: s.repo,
			quarantined: s.quarantined,
			cleared: s.cleared,
			open: s.open,
			closed: s.closed,
			items: s.items.slice(0, 12),
		});
	} catch {
		// One generic answer for "not installed", "does not exist", and "private":
		// an anonymous caller must not be able to distinguish them.
		return NextResponse.json(
			{ error: "repository not found or SlopGuard is not installed on it" },
			{ status: 404 },
		);
	}
}
