import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import PolicyFullView, {
	type PolicyFullViewCopy,
} from "@/app/components/PolicyFullView";

export const metadata = {
	title: "SlopGuard: Policy Coverage - Team",
	description:
		"How many of your installed repos are actively protected by SlopGuard's quarantine policy.",
};

const copy: PolicyFullViewCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team workspace",
	user: "blue-b",
	entitlement: "Team plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading policy state…",
	empty:
		"SlopGuard is not installed on this account. Install it to see policy coverage here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	backHref: "/org",
	backLabel: "Overview",
	heroEyebrow: "POLICY / ORG",
	heroTitle: "How many of your installed repos are actively protected.",
	heroBody:
		"Coverage is the share of installed repos that have at least one quarantine or clear label applied. Repos with no activity are not yet exercising the policy.",
	policyFileTitle: "Policy file",
	policyFileBody:
		"Add .github/SLOP_POLICY.yml to a repo to customize thresholds, label names, and auto-merge rules.",
	docsHref: "/docs#policy",
};

export default function OrgPolicyPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/org/policy" koHref="/ko/org/policy" />
			<PlanGate lang="en" required="team">
				<PolicyFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
