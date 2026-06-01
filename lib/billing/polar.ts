// Polar (Merchant of Record) API client — used to resolve entitlements at
// runtime WITHOUT a database. We treat Polar as the source of truth: list the
// organization's active subscriptions, read the `github_login` custom field
// each customer filled at checkout, and map it to a plan. Results are cached
// in-process (short TTL) and invalidated by the Polar webhook on any
// subscription/order change, so grants and revocations propagate quickly.
//
// Requires POLAR_API_TOKEN (an Organization Access Token with read access to
// subscriptions). POLAR_SERVER selects production (default) or "sandbox".

import { LRUCache } from "lru-cache";
import type { PlanId } from "./plans.js";

const CUSTOM_FIELD_KEY = process.env.POLAR_GITHUB_FIELD_KEY ?? "github-login";

function apiBase(): string {
	return (process.env.POLAR_SERVER ?? "production") === "sandbox"
		? "https://sandbox-api.polar.sh"
		: "https://api.polar.sh";
}

export function isPolarConfigured(): boolean {
	return Boolean(process.env.POLAR_API_TOKEN);
}

interface PolarSubscription {
	status: string;
	product?: { id?: string; name?: string } | null;
	custom_field_data?: Record<string, unknown> | null;
}

interface PolarListResponse<T> {
	items: T[];
	pagination?: { max_page?: number };
}

/** Map a Polar product (by name) to one of our plan tiers. */
function planFromProduct(name: string | undefined | null): PlanId {
	const n = (name ?? "").toLowerCase();
	if (n.includes("team")) return "team";
	// Any other active paid subscription grants at least Pro.
	return "pro";
}

const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, team: 2 };

// One cache entry holds the full owner→plan map. Short TTL bounds staleness
// even if a webhook is missed; the webhook invalidates it for instant updates.
const mapCache = new LRUCache<string, Map<string, PlanId>>({
	max: 1,
	ttl: 1000 * 60 * 5, // 5 min
});
const MAP_KEY = "entitlements";

let inflight: Promise<Map<string, PlanId>> | null = null;

/** Drop the cached entitlement map (called by the Polar webhook). */
export function invalidateEntitlements(): void {
	mapCache.delete(MAP_KEY);
}

async function fetchEntitlementMap(): Promise<Map<string, PlanId>> {
	const token = process.env.POLAR_API_TOKEN;
	const map = new Map<string, PlanId>();
	if (!token) return map;

	const orgId = process.env.POLAR_ORG_ID;

	// Page through every active subscription so customers beyond the first 100
	// are not silently dropped to the free tier.
	for (let page = 1; page <= 50; page++) {
		const params = new URLSearchParams({
			active: "true",
			limit: "100",
			page: String(page),
		});
		if (orgId) params.set("organization_id", orgId);

		// Trailing slash avoids Polar's 307 redirect to the canonical path.
		const res = await fetch(`${apiBase()}/v1/subscriptions/?${params}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
			cache: "no-store",
		});
		if (!res.ok) {
			throw new Error(`Polar subscriptions ${res.status}: ${await res.text()}`);
		}
		const data = (await res.json()) as PolarListResponse<PolarSubscription>;
		const items = data.items ?? [];

		for (const sub of items) {
			if (sub.status !== "active" && sub.status !== "trialing") continue;
			const login = sub.custom_field_data?.[CUSTOM_FIELD_KEY];
			if (typeof login !== "string" || !login.trim()) continue;
			const owner = login.trim().toLowerCase().replace(/^@/, "");
			const plan = planFromProduct(sub.product?.name);
			// Keep the highest tier if a customer has multiple subscriptions.
			const existing = map.get(owner);
			if (!existing || PLAN_RANK[plan] > PLAN_RANK[existing]) {
				map.set(owner, plan);
			}
		}

		const maxPage = data.pagination?.max_page ?? page;
		if (items.length === 0 || page >= maxPage) break;
	}
	return map;
}

/**
 * Resolve the owner→plan map from Polar, cached. Returns an empty map (and
 * logs) on any error so a Polar outage degrades to the free tier rather than
 * breaking webhook processing.
 */
export async function getEntitlementMap(): Promise<Map<string, PlanId>> {
	if (!isPolarConfigured()) return new Map();
	const cached = mapCache.get(MAP_KEY);
	if (cached) return cached;
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const map = await fetchEntitlementMap();
			mapCache.set(MAP_KEY, map);
			return map;
		} catch (err) {
			console.error("[slopguard] Polar entitlement fetch failed:", err);
			return new Map<string, PlanId>();
		} finally {
			inflight = null;
		}
	})();
	return inflight;
}
