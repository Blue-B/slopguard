import { PLANS, type PlanId } from "./plans.js";

// Entitlement = which plan an installation/owner is on.
//
// MVP storage: an env allowlist (PRO_OWNERS / TEAM_OWNERS = comma-separated
// GitHub logins). This is intentionally simple — it has no per-seat metering
// and does not scale to thousands of paying customers. The production path is
// to persist Stripe subscription → installation mappings in a DB (Upstash/
// Postgres) and look them up here. See docs/SETUP.md "Scaling".

function parseList(envKey: string): Set<string> {
  return new Set(
    (process.env[envKey] ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Resolve the plan for a repo owner (GitHub login). Defaults to free. */
export function planForOwner(owner: string): PlanId {
  const login = owner.toLowerCase();
  if (parseList("TEAM_OWNERS").has(login)) return "team";
  if (parseList("PRO_OWNERS").has(login)) return "pro";
  return "free";
}

/** Is managed LLM detection available for this owner? */
export function hasManagedLlm(owner: string): boolean {
  return PLANS[planForOwner(owner)].managedLlm;
}

/** Are private repos covered for this owner? */
export function hasPrivateRepos(owner: string): boolean {
  return PLANS[planForOwner(owner)].privateRepos;
}
