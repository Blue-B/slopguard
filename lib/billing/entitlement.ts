import { PLANS, type Plan, type PlanId } from "./plans.js";
import { getEntitlementMap, isPolarConfigured } from "./polar.js";

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

/** Resolve the plan for a repo owner (GitHub login). Defaults to free. */
export async function planForOwner(owner: string): Promise<PlanId> {
	const login = owner.toLowerCase().replace(/^@/, "");
	const fromEnv = planFromEnv(login);
	if (fromEnv) return fromEnv;
	if (!isPolarConfigured()) return "free";
	const map = await getEntitlementMap();
	return map.get(login) ?? "free";
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
