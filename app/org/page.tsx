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
	user: "blue-b",
	entitlement: "Team plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org#queue" },
		{ label: "Repos", href: "/org#repos" },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "Policy", href: "/org#policy" },
	],
	activeNav: "Overview",
	eyebrow: "TEAM FEATURE",
	title: "Review activity across every protected repo.",
	subtitle:
		"The Team plan includes this org-level console: one place to triage quarantine queues, see repeated campaign patterns, and check policy coverage across repositories.",
	account: "Account",
	alerts: "Configure alerts",
	accountHref: "/account",
	alertsHref: "/alerts",
	campaignsHref: "/campaigns",
	policyHref: "/docs#policy",
	heroEyebrow: "ORG · TEAM PLAN",
	heroTitle: "One pane for quarantine, campaigns, and policy coverage.",
	heroBody:
		"Group repeated AI-style patterns across repos, see exactly which owners have the highest impact, and route alerts to the right channel before maintainers get spammed.",
	heroCta: "View campaign radar",
	heroCtaHref: "/campaigns",
	metrics: [
		{ label: "Open reviews", value: "18", detail: "6 need owner action", tone: "warn" },
		{ label: "Protected repos", value: "17", detail: "+3 this week", tone: "ok" },
		{ label: "Avg. slop score", value: "42", detail: "−11 from last week", tone: "ok" },
		{ label: "Active clusters", value: "3", detail: "1 high-confidence", tone: "danger" },
	],
	queueTitle: "Quarantine queue",
	queueSubtitle: "Prioritized by score, then by repo impact",
	updated: "Updated 12s ago",
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
			owner: "@blue-b",
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
			owner: "policy bot",
			age: "4h",
		},
		{
			item: "test: extend lockfile_refresh fixtures",
			repo: "blue-b/api",
			score: 56,
			status: "Watching",
			owner: "@alex",
			age: "7h",
		},
	],
	campaignTitle: "Campaign radar",
	campaignSubtitle: "Cross-repo clusters grouped by repeated AI-style patterns",
	campaigns: [
		{
			name: "auth_surface",
			fingerprint: "feat: harden GitHub OAuth callback",
			repos: 7,
			risk: "high",
			commits: 23,
			authors: 4,
			delta: 85,
		},
		{
			name: "lockfile_refresh",
			fingerprint: "chore: dependency wave",
			repos: 5,
			risk: "medium",
			commits: 11,
			authors: 3,
			delta: 55,
		},
		{
			name: "docs_only",
			fingerprint: "docs: setup page copy refresh",
			repos: 3,
			risk: "low",
			commits: 9,
			authors: 2,
			delta: 25,
		},
	],
	policyTitle: "Policy coverage",
	policyBody:
		"Quarantine policy is enforced on most of your protected repos. The few without coverage will fall back to the global default.",
	coverageLabel: "Enforcing Team quarantine policy",
	coveragePercent: 82,
	coverageRepos: "17 protected repos",
	coverageMissing: "3 repos observe only — add .github/SLOP_POLICY.yml to enforce.",
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
