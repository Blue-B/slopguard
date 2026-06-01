import { PLANS, type PlanId } from "./plans.js";
import { getEntitlementMap, isPolarConfigured } from "./polar.js";

// Entitlement = which plan a repo owner (GitHub login) is on.
//
// Resolution order:
//   1. Env allowlist override — PRO_OWNERS / TEAM_OWNERS (comma-separated
//      GitHub logins). Handy for comps, the maintainer's own org, or manual
//      grants. Always wins.
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
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean),
	);
}

function planFromEnv(login: string): PlanId | undefined {
	if (parseList("TEAM_OWNERS").has(login)) return "team";
	if (parseList("PRO_OWNERS").has(login)) return "pro";
	return undefined;
}

/** Resolve the plan for a repo owner (GitHub login). Defaults to free. */
export async function planForOwner(owner: string): Promise<PlanId> {
	const login = owner.toLowerCase();
	const fromEnv = planFromEnv(login);
	if (fromEnv) return fromEnv;
	if (!isPolarConfigured()) return "free";
	const map = await getEntitlementMap();
	return map.get(login) ?? "free";
}

/** Is managed LLM detection available for this owner? */
export async function hasManagedLlm(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].managedLlm;
}

/** Are private repos covered for this owner? */
export async function hasPrivateRepos(owner: string): Promise<boolean> {
	return PLANS[await planForOwner(owner)].privateRepos;
}
