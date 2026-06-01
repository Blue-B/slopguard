// SlopGuard plans. Open-source + hosted model: the code is free to self-host;
// paid tiers cover the managed convenience (we pay the LLM bill, priority
// support, org features). Free tier is fully functional (heuristics-only).

export type PlanId = "free" | "pro" | "team";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD; 0 = free
  tagline: string;
  features: string[];
  /** LLM judging provided by us (we pay the API bill) */
  managedLlm: boolean;
  /** private repositories allowed */
  privateRepos: boolean;
  /** org-wide features (SSO, audit log, alerts) */
  orgFeatures: boolean;
  /** Stripe Payment Link or price id — set via env; null disables checkout */
  stripeEnvKey?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "For individuals and public repos. Forever free.",
    features: [
      "Heuristic slop detection (precision 100% on the golden set)",
      "Provenance tagging + quarantine label",
      "Human-in-the-loop /slop commands",
      ".github/SLOP_POLICY.yml policy-as-code",
      "Public repositories, 1 organization",
      "Self-host the whole thing (MIT licensed)",
    ],
    managedLlm: false,
    privateRepos: false,
    orgFeatures: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    tagline: "For maintainers who want the LLM judge without the API bill.",
    features: [
      "Everything in Free",
      "Managed LLM detection (we pay the API bill) — higher recall",
      "Private repositories",
      "Cross-repo bot-campaign detection (shared provenance fingerprints)",
      "Email support",
    ],
    managedLlm: true,
    privateRepos: true,
    orgFeatures: false,
    stripeEnvKey: "STRIPE_PRICE_PRO",
  },
  team: {
    id: "team",
    name: "Team",
    priceMonthly: 99,
    tagline: "For organizations that need controls and visibility.",
    features: [
      "Everything in Pro",
      "Org-wide dashboard across all repos",
      "Slack / Discord / email alerts",
      "SSO + audit log",
      "Priority support",
    ],
    managedLlm: true,
    privateRepos: true,
    orgFeatures: true,
    stripeEnvKey: "STRIPE_PRICE_TEAM",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "team"];
