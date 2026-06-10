// SlopGuard plans. Source-available + hosted model: the source is free to read
// and self-host for your own use (MIT + Commons Clause; you may not resell or
// host it as a service). Paid tiers cover the managed convenience and features
// that only make sense hosted (cross-repo intelligence, org dashboard, alerting,
// support).
//
// IMPORTANT: every flag below is actually ENFORCED in code. Nothing here is a
// marketing-only promise:
//   - privateRepos     -> lib/github/handlers.ts (skips private repos on free)
//   - managedLlm       -> lib/github/handlers.ts (free tier shares a throttled
//                          LLM budget; paid bypasses it = "dedicated quota")
//   - campaignDetection -> lib/agent/campaign.ts (cross-repo fingerprint window)
//   - alerts           -> lib/notify.ts (Slack/Discord/webhook on quarantine)
//   - orgDashboard     -> app/dashboard (org-wide aggregation + activity log)
//   - sso              -> Enterprise only; handled as a contact-sales tier.

export type PlanId = "free" | "pro" | "team" | "enterprise";

export interface Plan {
	id: PlanId;
	name: string;
	/** USD per month; 0 = free; null = contact sales (Enterprise) */
	priceMonthly: number | null;
	/** USD per year (≈ 2 months free); null when not applicable */
	priceYearly: number | null;
	/** "from" anchor price for contact-sales tiers (USD/mo); null when n/a */
	tagline: string;
	features: string[];

	// ── Enforced capability flags ──────────────────────────────────────────
	/** private repositories are reviewed */
	privateRepos: boolean;
	/** dedicated LLM quota (free tier is throttled to a shared budget) */
	managedLlm: boolean;
	/** cross-repo bot-campaign detection (shared prompt fingerprints) */
	campaignDetection: boolean;
	/** Network intelligence: cross-customer slop signal (hosted-only moat). */
	networkIntel: boolean;
	/** org-wide dashboard + activity/audit log across all repos */
	orgDashboard: boolean;
	/** Slack / Discord / webhook alerts on quarantine */
	alerts: boolean;
	/** SAML SSO, audit export, SLA — Enterprise (contact sales) */
	sso: boolean;
	/** how many installed repos the org dashboard aggregates */
	maxRepos: number;

	// ── Polar checkout link env var names (set on the host) ─────────────────
	/** monthly Polar Checkout Link env var; null disables monthly checkout */
	polarEnvKey?: string;
	/** yearly Polar Checkout Link env var; null disables yearly checkout */
	polarEnvKeyYearly?: string;
	/** true = no self-serve checkout, route to contact-sales instead */
}

export const PLANS: Record<PlanId, Plan> = {
	free: {
		id: "free",
		name: "Free",
		priceMonthly: 0,
		priceYearly: 0,
		tagline: "For individuals and public repos. Free forever.",
		features: [
			"Public repositories",
			"Fast heuristic slop detection (precision 100% on our eval set)",
			"Provenance tagging + quarantine label",
			"Human-in-the-loop /slop commands",
			".github/SLOP_POLICY.yml policy-as-code",
			"Self-host the whole thing (source-available)",
		],
		privateRepos: false,
		managedLlm: false,
		campaignDetection: false,
		networkIntel: false,
		orgDashboard: false,
		alerts: false,
		sso: false,
		maxRepos: 0,
	},
	pro: {
		id: "pro",
		name: "Pro",
		priceMonthly: 19,
		priceYearly: 190, // ~2 months free
		tagline: "For maintainers with private repos and serious bot traffic.",
		features: [
			"Everything in Free",
			"AI judge: LLM-deepened detection we pay for, catches the subtle cases heuristics miss",
			"Private repositories",
			"Cross-repo bot-pattern detection",
			"Network slop intelligence (cross-customer, hosted-only)",
			"Higher rate limits",
		],
		privateRepos: true,
		managedLlm: true,
		campaignDetection: true,
		networkIntel: true,
		orgDashboard: false,
		alerts: false,
		sso: false,
		// Pro has no org dashboard, but cross-repo campaign detection still needs a
		// real scan window across the owner's repos — otherwise it collapses to a
		// single repo and the advertised "cross-repo" feature is a no-op.
		maxRepos: 10,
		polarEnvKey: "POLAR_LINK_PRO",
		polarEnvKeyYearly: "POLAR_LINK_PRO_ANNUAL",
	},
	team: {
		id: "team",
		name: "Team",
		priceMonthly: 99,
		priceYearly: 990,
		tagline: "For orgs that need visibility, alerting, and controls.",
		features: [
			"Everything in Pro",
			"Org-wide dashboard across all repos",
			"Activity / audit log (who cleared what, when)",
			"Slack / Discord / webhook alerts on quarantine",
			"Higher rate limits",
			"Priority support",
		],
		privateRepos: true,
		managedLlm: true,
		campaignDetection: true,
		networkIntel: true,
		orgDashboard: true,
		alerts: true,
		sso: false,
		maxRepos: 50,
		polarEnvKey: "POLAR_LINK_TEAM",
		polarEnvKeyYearly: "POLAR_LINK_TEAM_ANNUAL",
	},
	enterprise: {
		id: "enterprise",
		name: "Enterprise",
		priceMonthly: 299,
		priceYearly: null,
		tagline: "For companies that need SSO, audit export, and priority support.",
		features: [
			"Everything in Team",
			"SAML / SSO sign-in",
			"Audit log export + retention",
			"Priority support & onboarding",
			"Custom integrations on request",
		],
		privateRepos: true,
		managedLlm: true,
		campaignDetection: true,
		networkIntel: true,
		orgDashboard: true,
		alerts: true,
		sso: true,
		maxRepos: 1000,
		polarEnvKey: "POLAR_LINK_ENTERPRISE",
	},
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "team", "enterprise"];

/** Tiers that have a real monthly price (excludes free + contact-sales). */
export const PAID_PLAN_ORDER: PlanId[] = ["pro", "team"];

export const PLAN_RANK: Record<PlanId, number> = {
	free: 0,
	pro: 1,
	team: 2,
	enterprise: 3,
};

/** USD saved per year by paying annually instead of 12× monthly. */
export function yearlySavings(plan: Plan): number {
	if (plan.priceMonthly == null || plan.priceYearly == null) return 0;
	return plan.priceMonthly * 12 - plan.priceYearly;
}
