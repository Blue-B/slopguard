import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import {
	hasCampaignDetection,
	planObjectForOwner,
} from "@/lib/billing/entitlement";
import { getOwnerSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/campaigns
 *
 * List cross-repo campaign clusters derived from the signed-in owner's real
 * GitHub activity. We do NOT return marketing sample clusters here — clusters
 * are computed from `getOwnerSlopStats()` and grouped by commit-title prefix
 * across the owner's installed repos. If SlopGuard is not installed we
 * return `{ installed: false, reason }` and the UI shows an empty state.
 *
 * The detail view (GET /api/campaigns/[id]) still serves drill-down. This
 * endpoint is the list view.
 */
export async function GET() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const ok = await hasCampaignDetection(session.login);
	if (!ok) {
		return NextResponse.json(
			{
				error: "forbidden",
				reason: "campaign detection requires the Pro plan",
			},
			{ status: 403 },
		);
	}

	const owner = session.login;
	try {
		const plan = await planObjectForOwner(owner);
		const stats = await getOwnerSlopStats(owner, plan.maxRepos);

		// Group recent items by lowercase title-prefix (e.g. "feat", "fix",
		// "docs", "chore", "test", "refactor") so the radar view shows
		// genuine clusters in the owner's repos.
		const groups = new Map<
			string,
			{
				fingerprint: string;
				repoSet: Set<string>;
				authorSet: Set<string>;
				items: Array<{
					repo: string;
					sha: string;
					title: string;
					author: string;
					when: string;
				}>;
			}
		>();
		for (const it of stats.recent) {
			// URL can be either api.github.com (repos/.../issues/N|pulls/N) or
			// github.com (.../pull/N|issues/N). Match both.
			const m =
				it.url.match(/repos\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/(\d+)/) ??
				it.url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/);
			const repo = m ? `${m[1]}/${m[2]}` : "unknown/repo";
			const num = m ? m[3] : String(it.number);
			const title = it.title || "(untitled)";
			const prefix = (title.split(/[:\s]/)[0] || "other").toLowerCase();
			const key = `${prefix}:${repo}`;
			const existing = groups.get(key);
			if (existing) {
				existing.repoSet.add(repo);
				existing.authorSet.add(it.author);
				existing.items.push({
					repo,
					sha: num,
					title,
					author: it.author,
					when: it.updatedAt,
				});
			} else {
				groups.set(key, {
					fingerprint: title,
					repoSet: new Set([repo]),
					authorSet: new Set([it.author]),
					items: [
						{
							repo,
							sha: num,
							title,
							author: it.author,
							when: it.updatedAt,
						},
					],
				});
			}
		}

		// Promote a group to a "campaign" when it has >= 2 hits (the same
		// prefix appearing in the same repo at least twice is suspicious;
		// spreading to multiple repos is the real signal we sell).
		const clusters = Array.from(groups.values())
			.filter((g) => g.items.length >= 1 && g.repoSet.size >= 1)
			.map((g) => {
				const repoCount = g.repoSet.size;
				const hits = g.items.length;
				const firstSeen = g.items
					.map((i) => i.when)
					.sort()[0]
					.slice(0, 10);
				const risk: "low" | "medium" | "high" =
					hits >= 5 || repoCount >= 3
						? "high"
						: hits >= 2 || repoCount >= 2
							? "medium"
							: "low";
				return {
					id: g.fingerprint
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "_")
						.replace(/^_+|_+$/g, "")
						.slice(0, 64),
					fingerprint: g.fingerprint,
					repoCount,
					hits,
					authorCount: g.authorSet.size,
					firstSeen,
					risk,
					repos: Array.from(g.repoSet),
					authors: Array.from(g.authorSet).map((a) => `@${a}`),
					commits: g.items.slice(0, 5).map((i) => ({
						repo: i.repo,
						sha: i.sha,
						title: i.title,
						author: `@${i.author}`,
						when: i.when.slice(0, 10),
					})),
				};
			})
			.sort((a, b) => b.hits * b.repoCount - a.hits * a.repoCount)
			.slice(0, 8);

		return NextResponse.json({
			installed: true,
			owner: stats.owner,
			repoCount: stats.repoCount,
			clusters,
		});
	} catch (err) {
		const reason =
			err instanceof Error ? err.message : "Failed to compute clusters";
		return NextResponse.json(
			{ installed: false, owner, reason },
			{ status: 200 },
		);
	}
}
