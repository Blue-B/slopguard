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
import { PLAN_RANK, type PlanId } from "./plans.js";

function unique(values: (string | undefined)[]): string[] {
	return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

function customFieldKeys(): string[] {
	return unique([
		process.env.POLAR_GITHUB_FIELD_KEY,
		"github-login",
		"github_login",
		"github-username",
		"github_username",
		"github",
	]);
}

/** Normalize buyer input into a GitHub owner login (user/org). */
export function normalizeGitHubOwner(value: string): string {
	let s = value.trim().toLowerCase();
	s = s.replace(/^https?:\/\/(www\.)?github\.com\//, "");
	s = s.replace(/^github\.com\//, "");
	s = s.replace(/^[@/]+/, "");
	s = s.split(/[\s/?#]+/, 1)[0] ?? "";
	s = s.replace(/\.git$/, "");
	return /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/.test(s) ? s : "";
}

function githubOwnerFromCustomFields(
	data: Record<string, unknown> | null | undefined,
): string | undefined {
	if (!data) return undefined;

	for (const key of customFieldKeys()) {
		const raw = data[key];
		if (typeof raw !== "string") continue;
		const owner = normalizeGitHubOwner(raw);
		if (owner) return owner;
	}

	// Dashboard slugs can drift. As a last safe fallback, accept any string field
	// whose key clearly names GitHub, e.g. `githubAccount` or `github_org`.
	for (const [key, raw] of Object.entries(data)) {
		if (!/github/i.test(key) || typeof raw !== "string") continue;
		const owner = normalizeGitHubOwner(raw);
		if (owner) return owner;
	}
	return undefined;
}

function parseIdList(envKey: string): Set<string> {
	return new Set(
		(process.env[envKey] ?? "")
			.split(",")
			.map((id) => id.trim())
			.filter(Boolean),
	);
}

function apiBase(): string {
	return (process.env.POLAR_SERVER ?? "production") === "sandbox"
		? "https://sandbox-api.polar.sh"
		: "https://api.polar.sh";
}

export function isPolarConfigured(): boolean {
	return Boolean(process.env.POLAR_API_TOKEN);
}

interface PolarProductRef {
	id?: string;
	name?: string;
	recurring_interval?: string | null;
}

interface PolarSubscription {
	id?: string;
	status: string;
	product?: PolarProductRef | null;
	custom_field_data?: Record<string, unknown> | null;
}

interface PolarListResponse<T> {
	items: T[];
	pagination?: { max_page?: number };
}

/** Map a Polar product to one of our plan tiers. */
function planFromProduct(product: PolarProductRef | undefined | null): PlanId {
	const id = product?.id ?? "";
	if (id && parseIdList("POLAR_PRODUCT_ENTERPRISE_IDS").has(id)) {
		return "enterprise";
	}
	if (id && parseIdList("POLAR_PRODUCT_TEAM_IDS").has(id)) return "team";
	if (id && parseIdList("POLAR_PRODUCT_PRO_IDS").has(id)) return "pro";

	const n = (product?.name ?? "").toLowerCase();
	if (n.includes("enterprise")) return "enterprise";
	if (n.includes("team")) return "team";
	// Any other active paid subscription (incl. annual variants) grants Pro.
	return "pro";
}

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
			const owner = githubOwnerFromCustomFields(sub.custom_field_data);
			if (!owner) continue;
			const plan = planFromProduct(sub.product);
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

// ── plan changes (upgrade / downgrade / cancel) ──────────────────────────
// Entitlement is keyed by the github-login a customer entered at checkout, so a
// plan change targets THAT subscription. We resolve it from Polar (source of
// truth), then PATCH the product with the right proration so upgrades take
// effect now and downgrades are scheduled for the next period.

export type ProrationBehavior = "invoice" | "prorate" | "next_period" | "reset";

export interface OwnerSubscription {
	id: string;
	productId: string;
	interval: "month" | "year";
	plan: PlanId;
}

function authHeaders(token: string): Record<string, string> {
	return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

/** Find the active subscription whose github-login custom field === owner. */
export async function findSubscriptionForOwner(
	owner: string,
): Promise<OwnerSubscription | null> {
	const token = process.env.POLAR_API_TOKEN;
	if (!token) return null;
	const norm = normalizeGitHubOwner(owner);
	if (!norm) return null;
	const orgId = process.env.POLAR_ORG_ID;

	for (let page = 1; page <= 50; page++) {
		const params = new URLSearchParams({
			active: "true",
			limit: "100",
			page: String(page),
		});
		if (orgId) params.set("organization_id", orgId);
		const res = await fetch(`${apiBase()}/v1/subscriptions/?${params}`, {
			headers: authHeaders(token),
			cache: "no-store",
		});
		if (!res.ok) {
			throw new Error(`Polar subscriptions ${res.status}: ${await res.text()}`);
		}
		const data = (await res.json()) as PolarListResponse<PolarSubscription>;
		const items = data.items ?? [];
		for (const sub of items) {
			if (sub.status !== "active" && sub.status !== "trialing") continue;
			if (githubOwnerFromCustomFields(sub.custom_field_data) !== norm) continue;
			if (!sub.id) continue;
			return {
				id: sub.id,
				productId: sub.product?.id ?? "",
				interval: sub.product?.recurring_interval === "year" ? "year" : "month",
				plan: planFromProduct(sub.product),
			};
		}
		const maxPage = data.pagination?.max_page ?? page;
		if (items.length === 0 || page >= maxPage) break;
	}
	return null;
}

/** Resolve the Polar product id for a target tier + billing interval. */
export async function findProductId(
	plan: PlanId,
	interval: "month" | "year",
): Promise<string | null> {
	const token = process.env.POLAR_API_TOKEN;
	if (!token) return null;
	const orgId = process.env.POLAR_ORG_ID;
	const params = new URLSearchParams({ is_archived: "false", limit: "100" });
	if (orgId) params.set("organization_id", orgId);
	const res = await fetch(`${apiBase()}/v1/products/?${params}`, {
		headers: authHeaders(token),
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error(`Polar products ${res.status}: ${await res.text()}`);
	}
	const data = (await res.json()) as PolarListResponse<PolarProductRef>;
	let fallback: string | null = null;
	for (const p of data.items ?? []) {
		if (planFromProduct(p) !== plan || !p.id) continue;
		const iv = p.recurring_interval === "year" ? "year" : "month";
		if (iv === interval) return p.id;
		fallback ??= p.id; // same tier, other cycle — last resort
	}
	return fallback;
}

async function patchSubscription(
	id: string,
	body: Record<string, unknown>,
): Promise<void> {
	const token = process.env.POLAR_API_TOKEN;
	if (!token) throw new Error("POLAR_API_TOKEN missing");
	const res = await fetch(`${apiBase()}/v1/subscriptions/${id}`, {
		method: "PATCH",
		headers: { ...authHeaders(token), "content-type": "application/json" },
		cache: "no-store",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		throw new Error(`Polar subscription update ${res.status}: ${await res.text()}`);
	}
}

/** Switch a subscription to a different product (tier/cycle) with proration. */
export async function changeSubscriptionProduct(
	id: string,
	productId: string,
	proration: ProrationBehavior,
): Promise<void> {
	await patchSubscription(id, {
		product_id: productId,
		proration_behavior: proration,
	});
}

/** Schedule cancellation at the end of the current period (downgrade to free). */
export async function cancelSubscriptionAtPeriodEnd(id: string): Promise<void> {
	await patchSubscription(id, { cancel_at_period_end: true });
}
