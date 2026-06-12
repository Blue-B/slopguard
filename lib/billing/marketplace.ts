// GitHub Marketplace billing source. SlopGuard already bills via Polar; this
// lets the SAME app ALSO be sold through GitHub Marketplace without double
// charging: both sources resolve to the same GitHub login and entitlement is
// the HIGHEST plan across sources (see lib/billing/entitlement.ts).
//
// GitHub sends `marketplace_purchase` events to the GitHub App webhook
// (/api/webhook). We map account.login -> PlanId here.
//
// Persistence: when DATA_DIR is set the map is mirrored to disk so it survives
// a redeploy. Without DATA_DIR it is process-local and re-populated by the next
// `marketplace_purchase` event (or reconcile via the GitHub Marketplace API).
import { PLAN_RANK, type PlanId } from "./plans.js";
import { PersistentMap, flushStores, ensureStoresReady } from "../storage/persist.js";

const map = new PersistentMap<PlanId>("marketplace");

function normalize(login: string): string {
	return login.trim().toLowerCase().replace(/^@/, "");
}

/** Map a GitHub Marketplace plan (id or name) to our PlanId. */
function toPlanId(plan: { id?: number; name?: string } | undefined): PlanId {
	if (!plan) return "free";
	// Prefer explicit plan-id → tier mapping from env (most robust).
	const byId: Record<string, PlanId> = {
		[process.env.GH_MP_PLAN_PRO ?? ""]: "pro",
		[process.env.GH_MP_PLAN_TEAM ?? ""]: "team",
		[process.env.GH_MP_PLAN_ENTERPRISE ?? ""]: "enterprise",
	};
	if (plan.id != null && byId[String(plan.id)]) return byId[String(plan.id)];
	// Fallback: match by plan name.
	const n = (plan.name ?? "").toLowerCase();
	if (n.includes("enterprise")) return "enterprise";
	if (n.includes("team")) return "team";
	if (n.includes("pro")) return "pro";
	return "free";
}

type MarketplacePayload = {
	action?: string;
	marketplace_purchase?: {
		account?: { login?: string };
		plan?: { id?: number; name?: string };
	};
};

/** Apply a `marketplace_purchase` webhook event to the entitlement map. */
export async function applyMarketplaceEvent(payload: unknown): Promise<void> {
	const p = payload as MarketplacePayload;
	const login = p.marketplace_purchase?.account?.login;
	if (!login) return;
	// Hydrate first so delete()/set() act on a warm mirror after a redeploy
	// (otherwise a cold-start cancel could no-op against an empty mirror).
	await ensureStoresReady();
	const key = normalize(login);
	const action = p.action ?? "";
	if (action === "cancelled") {
		map.delete(key);
		await flushStores();
		return;
	}
	// `pending_change` / `pending_change_cancelled` are future-effective (next
	// billing cycle, esp. downgrades), ignore them so we never revoke paid
	// access early or grant an upgrade before payment. Only act on the events
	// that are effective now.
	if (action === "purchased" || action === "changed") {
		map.set(key, toPlanId(p.marketplace_purchase?.plan));
		await flushStores();
	}
}

/** Highest plan this owner holds via GitHub Marketplace, if any. */
export function marketplacePlanForOwner(owner: string): PlanId | undefined {
	return map.get(normalize(owner));
}

/** Test/debug helper. */
export function _seedMarketplace(login: string, plan: PlanId): void {
	if (PLAN_RANK[plan] != null) map.set(normalize(login), plan);
}
