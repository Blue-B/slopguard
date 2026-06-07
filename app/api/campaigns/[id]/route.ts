import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
	SESSION_COOKIE,
	decodeSession,
	effectiveOwner,
} from "@/lib/auth/session";
import {
	hasCampaignDetection,
	planObjectForOwner,
} from "@/lib/billing/entitlement";
import { computeOwnerClusters } from "@/lib/agent/clusters";
import { getOwnerSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Drill-down for a single campaign cluster. Reads the SAME real-activity
// computation as the list (no sample/marketing data); if the id is not among
// the owner's current clusters we return an empty cluster rather than fabricate
// repos/authors.
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}
	const owner = effectiveOwner(session);

	const ok = await hasCampaignDetection(owner);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "campaign detection requires the Pro plan" },
			{ status: 403 },
		);
	}

	const { id } = await params;
	const plan = await planObjectForOwner(owner);

	let cluster: Awaited<
		ReturnType<typeof computeOwnerClusters>
	>["clusters"][number] | null = null;
	try {
		const { clusters } = await computeOwnerClusters(owner, plan.maxRepos);
		cluster = clusters.find((c) => c.id === id) ?? null;
	} catch {
		cluster = null;
	}

	if (!cluster) {
		// Unknown / stale id: return an empty cluster, never fabricated data.
		return NextResponse.json({
			id,
			fingerprint: id.replaceAll("_", " "),
			repoCount: 0,
			totalCount: 0,
			authorCount: 0,
			firstSeen: null,
			repos: [],
			authors: [],
			commits: [],
			repoImpact: [],
		});
	}

	// Per-repo slop impact for the repos in this cluster (live stats).
	let repoImpact: Array<{ repo: string; quarantined: number; cleared: number }> =
		[];
	try {
		const stats = await getOwnerSlopStats(owner, plan.maxRepos);
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
		repoCount: cluster.repoCount,
		totalCount: cluster.hits,
		authorCount: cluster.authorCount,
		firstSeen: cluster.firstSeen,
		repos: cluster.repos,
		authors: cluster.authors,
		commits: cluster.commits,
		repoImpact,
	});
}
