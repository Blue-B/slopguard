import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import PolicyFullView, {
	type PolicyFullViewCopy,
} from "@/app/components/PolicyFullView";

export const metadata: Metadata = {
	title: "SlopGuard: Policy Coverage - Team",
	description:
		"How many of your installed repos are actively protected by SlopGuard's quarantine policy.",
};

const copy: PolicyFullViewCopy = {
	kicker: "SlopGuard Team",
	workspace: "Organization console",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading policy state…",
	empty:
		"SlopGuard is not installed on this account. Install it to see policy coverage here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	heroEyebrow: "ORG / POLICY",
	heroTitle: "The applied policy scope for team operations.",
	heroBody:
		"Overview is status, Queue is work, Repos is scope, and Policy is coverage. Coverage is based on installed repos with quarantine or cleared signals.",
	policyFileTitle: "Policy file",
	policyFileBody:
		"Add .github/SLOP_POLICY.yml to a repo to customize thresholds, label names, and auto-merge rules.",
	docsHref: "/docs#policy",
	labels: {
		installed: "Installed repos",
		applied: "Policy applied",
		quarantined: "Quarantined",
		cleared: "Cleared",
		docs: "Open docs",
		coverage: "repos currently covered by Team policy signals.",
		gap: "Repos without quarantine activity are included automatically when their first protected activity appears.",
	},
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
