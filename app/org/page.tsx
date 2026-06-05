import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Org Dashboard — Team",
	description:
		"Team plan console for org-wide quarantine queues, campaign clusters, and policy coverage.",
};

const copy: OrgDashboardConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team workspace",
	user: "Blue-B",
	entitlement: "Team entitlement active",
	connected: "● Connected to GitHub",
	nav: ["Overview", "Queue", "Repos", "Campaigns", "Alerts", "Policy"],
	activeNav: "Overview",
	eyebrow: "TEAM FEATURE",
	title: "Review activity across every protected repo.",
	subtitle:
		"The Team plan includes this org-level console: one place to triage quarantine queues, see repeated campaign patterns, and check policy coverage across repositories.",
	account: "Account",
	alerts: "Configure alerts",
	accountHref: "/account",
	alertsHref: "/alerts",
	metrics: [
		{ label: "Open reviews", value: "18", detail: "6 require owner action" },
		{ label: "Protected repos", value: "17", detail: "3 added this week" },
		{ label: "Avg. slop score", value: "42", detail: "−11 from last week" },
		{ label: "Campaign clusters", value: "3", detail: "1 high confidence" },
	],
	queueTitle: "Quarantine queue",
	queueSubtitle: "Prioritized by score and policy impact",
	updated: "Updated just now",
	columns: {
		item: "Item",
		repo: "Repo",
		score: "Score",
		status: "Status",
		owner: "Owner",
		age: "Age",
	},
	queue: [
		{
			item: "feat: harden GitHub OAuth callback",
			repo: "blue-b/slopguard",
			score: 78,
			status: "Quarantined",
			owner: "Security review",
			age: "12m",
		},
		{
			item: "docs: setup page copy refresh",
			repo: "blue-b/docs",
			score: 31,
			status: "Cleared",
			owner: "@blue-b",
			age: "1h",
		},
		{
			item: "chore: dependency wave",
			repo: "blue-b/api",
			score: 64,
			status: "Watching",
			owner: "Policy bot",
			age: "4h",
		},
	],
	campaignTitle: "Campaign radar",
	campaignSubtitle: "Grouped by repeated AI-like patterns",
	campaigns: [
		{ name: "Auth surface changes", repos: "7 repos", risk: "High risk" },
		{ name: "Docs-only churn", repos: "3 repos", risk: "Low risk" },
		{ name: "Lockfile refresh", repos: "5 repos", risk: "Medium risk" },
	],
	policyTitle: "Policy coverage",
	policyBody:
		"14 repos enforce quarantine, 3 repos observe only. Alerts route to the Team webhook policy.",
	coverageLabel: "82% of protected repos enforce Team policy",
};

export default function OrgDashboard() {
	return (
		<>
			<MarketingNav lang="en" enHref="/org" koHref="/ko/org" />
			<PlanGate lang="en" required="team">
				<OrgDashboardConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
