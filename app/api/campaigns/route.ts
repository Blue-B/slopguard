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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/campaigns
 *
 * List cross-repo campaign clusters derived from the signed-in owner's REAL
 * GitHub activity (no marketing/sample data). If SlopGuard is not installed we
 * return `{ installed: false, reason }` and the UI shows an empty state. The
 * drill-down (GET /api/campaigns/[id]) reads the same computation.
 */
export async function GET() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const owner = effectiveOwner(session);
	const ok = await hasCampaignDetection(owner);
	if (!ok) {
		return NextResponse.json(
			{
				error: "forbidden",
				reason: "campaign detection requires the Pro plan",
			},
			{ status: 403 },
		);
	}

	try {
		const plan = await planObjectForOwner(owner);
		const { owner: resolvedOwner, repoCount, clusters } =
			await computeOwnerClusters(owner, plan.maxRepos);
		return NextResponse.json({
			installed: true,
			owner: resolvedOwner,
			repoCount,
			clusters,
		});
	} catch (err) {
		const reason =
			err instanceof Error ? err.message : "Failed to compute clusters";
		return NextResponse.json({ installed: false, owner, reason }, { status: 200 });
	}
}
