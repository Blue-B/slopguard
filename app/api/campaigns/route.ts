import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
	SESSION_COOKIE,
	decodeSession,
	effectiveOwner,
} from "@/lib/auth/session";
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
	try {
		const { owner: resolvedOwner, repoCount, clusters } =
			await computeOwnerClusters(owner);
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
