import { PLAN_RANK, PLANS, type Plan, type PlanId } from "./plans.js";
import { getEntitlementMap, isPolarConfigured } from "./polar.js";
import { marketplacePlanForOwner } from "./marketplace.js";
import { ensureStoresReady } from "../storage/persist.js";

// Entitlement = which plan a repo owner (GitHub login) is on.
//
// Resolution order:
//   1. Env allowlist override — ENTERPRISE_OWNERS / TEAM_OWNERS / PRO_OWNERS
//      (comma-separated GitHub logins). Handy for comps, the maintainer's own
//      org, sales-closed Enterprise deals, or manual grants. Always wins.
//   2. Polar (source of truth) — active subscriptions whose `github_login`
//      custom field matches the owner. Resolved via lib/billing/polar.ts
//      (cached, no database). Requires POLAR_API_TOKEN.
//   3. Default: free.
//
// All lookups are async because the Polar path hits the network (cached).

function parseList(envKey: string): Set<string> {
	return new Set(
		(process.env[envKey] ?? "")
			.split(",")
			.map((s) => s.trim().toLowerCase().replace(/^@/, ""))
			.filter(Boolean),
	);
}

function planFromEnv(login: string): PlanId | undefined {
	if (parseList("ENTERPRISE_OWNERS").has(login)) return "enterprise";
	if (parseList("TEAM_OWNERS").has(login)) return "team";
	if (parseList("PRO_OWNERS").has(login)) return "pro";
	return undefined;
}

// Comp / own-org grants are configured via the *_OWNERS env allowlists
// (ENTERPRISE_OWNERS / TEAM_OWNERS / PRO_OWNERS) so no specific login is
// hardcoded in this public repo. See planFromEnv above.

/** Resolve the plan for a repo owner (GitHub login). Defaults to free. */
export async function planForOwner(owner: string): Promise<PlanId> {
	const login = owner.toLowerCase().replace(/^@/, "");
	const fromEnv = planFromEnv(login);
	if (fromEnv) return fromEnv;
	// Hydrate the persistent mirror (no-op unless Redis cold start) so the
	// Marketplace entitlement is correct on the first request after a redeploy.
	await ensureStoresReady();
	// Billing sources coexist (Polar + GitHub Marketplace). A customer buys
	// through ONE channel; if somehow both, the HIGHEST plan wins — never the
	// sum, so there is no double-charge entitlement. Both key by GitHub login.
	let best: PlanId = "free";
	const fromMarketplace = marketplacePlanForOwner(login);
	if (fromMarketplace && PLAN_RANK[fromMarketplace] > PLAN_RANK[best]) {
		best = fromMarketplace;
	}
	if (isPolarConfigured()) {
		const map = await getEntitlementMap();
		const fromPolar = map.get(login);
		if (fromPolar && PLAN_RANK[fromPolar] > PLAN_RANK[best]) best = fromPolar;
	}
	return best;
}

/** Resolve the full plan object for an owner. */
export async function planObjectForOwner(owner: string): Promise<Plan> {
	return PLANS[await planForOwner(owner)];
}

/** Are private repos covered for this owner? */
export async function hasPrivateRepos(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].privateRepos;
}

/** Does this owner get a dedicated (un-throttled) LLM quota? */
export async function hasManagedLlm(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].managedLlm;
}

/** Cross-repo bot-campaign detection enabled for this owner? */
export async function hasCampaignDetection(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].campaignDetection;
}

/** Slack/Discord/webhook alerts enabled for this owner? */
export async function hasAlerts(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].alerts;
}

/** Org-wide dashboard + activity log enabled for this owner? */
export async function hasOrgDashboard(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].orgDashboard;
}

/** SAML SSO / Enterprise features (audit export, SLA) enabled for this owner? */
export async function hasSso(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].sso;
}
