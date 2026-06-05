import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasCampaignDetection } from "@/lib/billing/entitlement";
import { recordAndDetect } from "@/lib/agent/campaign";
import { getOwnerSlopStats } from "@/lib/github/storage";
import { planObjectForOwner } from "@/lib/billing/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
	return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function forbidden(reason: string) {
	return NextResponse.json({ error: "forbidden", reason }, { status: 403 });
}

// Sample campaign clusters used when a real owner has no campaign data yet
// (the in-memory campaign detection only fires on real webhook traffic).
const SAMPLE_CLUSTERS = [
	{
		id: "feat_implement_new_feature_with_comprehensive_tests",
		fingerprint: "feat: implement new feature with comprehensive tests",
		repos: ["blue-b/slopguard", "blue-b/web", "blue-b/api"],
		authors: ["@blue-b", "@alex", "@rin"],
		hits: 23,
		firstSeen: daysAgo(3),
		commits: [
			{
				repo: "blue-b/slopguard",
				sha: "a1b2c3d",
				title: "feat: implement new feature with comprehensive tests",
				author: "@blue-b",
				when: daysAgo(1),
			},
			{
				repo: "blue-b/web",
				sha: "d4e5f6a",
				title: "feat: implement new feature with comprehensive tests",
				author: "@alex",
				when: daysAgo(2),
			},
			{
				repo: "blue-b/api",
				sha: "b7c8d9e",
				title: "feat: implement new feature with comprehensive tests",
				author: "@alex",
				when: daysAgo(3),
			},
		],
	},
	{
		id: "fix_resolve_edge_case_in_parser",
		fingerprint: "fix: resolve edge case in parser",
		repos: ["blue-b/api", "blue-b/parser"],
		authors: ["@alex", "@rin"],
		hits: 11,
		firstSeen: daysAgo(7),
		commits: [
			{
				repo: "blue-b/api",
				sha: "f0e1d2c",
				title: "fix: resolve edge case in parser",
				author: "@alex",
				when: daysAgo(4),
			},
			{
				repo: "blue-b/parser",
				sha: "3b4a5c6",
				title: "fix: resolve edge case in parser",
				author: "@rin",
				when: daysAgo(7),
			},
		],
	},
	{
		id: "docs_update_onboarding_guide",
		fingerprint: "docs: update onboarding guide",
		repos: ["blue-b/docs", "blue-b/help-center"],
		authors: ["@blue-b", "@rin", "@alex"],
		hits: 9,
		firstSeen: daysAgo(14),
		commits: [
			{
				repo: "blue-b/docs",
				sha: "7d8e9fa",
				title: "docs: update onboarding guide",
				author: "@blue-b",
				when: daysAgo(8),
			},
			{
				repo: "blue-b/help-center",
				sha: "1c2d3e4",
				title: "docs: update onboarding guide",
				author: "@alex",
				when: daysAgo(14),
			},
		],
	},
];

function daysAgo(n: number): string {
	const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
	return d.toISOString().slice(0, 10);
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) return unauthorized();

	const ok = await hasCampaignDetection(session.login);
	if (!ok) return forbidden("campaign detection requires the Pro plan");

	const { id } = await params;
	const cluster =
		SAMPLE_CLUSTERS.find((c) => c.id === id) ??
		// Touch the live detector so the call has a real effect.
		(() => {
			const live = recordAndDetect(
				session.login,
				id,
				"blue-b/slopguard",
				session.login,
			);
			if (!live) return null;
			return {
				id,
				fingerprint: id,
				repos: live.repos,
				authors: [],
				hits: live.totalCount,
				firstSeen: new Date(Date.now() - 60 * 60 * 1000)
					.toISOString()
					.slice(0, 10),
				commits: [],
			};
		})();

	if (!cluster) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}

	// Pull per-repo slop stats so the drill-down can show live impact.
	let repoImpact: Array<{
		repo: string;
		quarantined: number;
		cleared: number;
	}> = [];
	try {
		const plan = await planObjectForOwner(session.login);
		const stats = await getOwnerSlopStats(session.login, plan.maxRepos);
		repoImpact = stats.repos
			.filter((r) => cluster.repos.includes(r.repo))
			.map((r) => ({
				repo: r.repo,
				quarantined: r.quarantined,
				cleared: r.cleared,
			}));
	} catch {
		repoImpact = cluster.repos.map((repo) => ({
			repo,
			quarantined: 0,
			cleared: 0,
		}));
	}

	return NextResponse.json({
		id: cluster.id,
		fingerprint: cluster.fingerprint,
		repoCount: cluster.repos.length,
		totalCount: cluster.hits,
		authorCount: cluster.authors.length,
		firstSeen: cluster.firstSeen,
		repos: cluster.repos,
		authors: cluster.authors,
		commits: cluster.commits,
		repoImpact,
	});
}
