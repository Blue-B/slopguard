import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasOrgDashboard } from "@/lib/billing/entitlement";
import { getOwnerSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/team/dashboard
 *
 * Org-wide quarantine + activity feed for the Team plan org console.
 *
 * Returns the real GitHub-side aggregation for the signed-in owner. We do
 * NOT return marketing sample data here — if SlopGuard is not installed on
 * the owner's account we return `{ installed: false, reason }` and the UI
 * renders a "install on more repos" CTA. The page itself gates on
 * `hasOrgDashboard`, so direct API calls from non-Team users are blocked.
 */
export async function GET() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const ok = await hasOrgDashboard(session.login);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "org dashboard requires the Team plan" },
			{ status: 403 },
		);
	}

	const owner = session.login;
	try {
		const stats = await getOwnerSlopStats(owner);

		// Group recent activity into coarse campaign clusters by repo for the
		// "radar" view. This is a quick fingerprint-by-prefix; the dedicated
		// /api/campaigns/[id] route does the heavier cross-repo detection.
		const byRepo = new Map<
			string,
			{ repos: number; commits: number; authors: Set<string>; sample: string }
		>();
		for (const it of stats.recent) {
			const key = it.title.split(":")[0]?.trim().toLowerCase() ?? "other";
			const existing = byRepo.get(key);
			if (existing) {
				existing.commits += 1;
				existing.authors.add(it.author);
			} else {
				byRepo.set(key, {
					repos: 1,
					commits: 1,
					authors: new Set([it.author]),
					sample: it.title,
				});
			}
		}
		const radar = Array.from(byRepo.entries())
			.map(([name, v]) => ({
				name,
				fingerprint: v.sample,
				repos: v.repos,
				risk:
					v.commits >= 10 ? "high" : v.commits >= 4 ? "medium" : ("low" as const),
				commits: v.commits,
				authors: v.authors.size,
				// bar width 0-100, scaled by commit volume
				delta: Math.min(100, Math.round((v.commits / 20) * 100)),
			}))
			.sort((a, b) => b.commits - a.commits)
			.slice(0, 6);

		return NextResponse.json({
			installed: true,
			owner: stats.owner,
			repoCount: stats.repoCount,
			quarantined: stats.quarantined,
			cleared: stats.cleared,
			open: stats.open,
			closed: stats.closed,
			recent: stats.recent.slice(0, 12),
			repos: stats.repos,
			radar,
		});
	} catch (err) {
		const reason =
			err instanceof Error ? err.message : "Failed to aggregate owner stats";
		return NextResponse.json(
			{ installed: false, owner, reason },
			{ status: 200 },
		);
	}
}
