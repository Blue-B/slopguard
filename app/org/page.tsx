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
	loading: "Loading…",
	emptyTitle: "SlopGuard is not installed on this account yet",
	emptyBody:
		"This console is a live view of your GitHub activity. Install SlopGuard on your repos and the dashboard will populate as soon as SlopGuard detects and labels your first item.",
	emptyCta: "Install SlopGuard on GitHub",
	emptyCtaHref: "/setup",
	metrics: [
		{ label: "Open reviews", value: "—", detail: "loading", tone: "neutral" },
		{ label: "Protected repos", value: "—", detail: "loading", tone: "neutral" },
		{ label: "Avg. slop score", value: "—", detail: "loading", tone: "neutral" },
		{ label: "Active clusters", value: "—", detail: "loading", tone: "neutral" },
	],
	queueTitle: "Quarantine queue",
	queueSubtitle: "Recent items across every protected repo",
	updated: "Updated",
	columns: {
		item: "Item",
		repo: "Repo",
		score: "Score",
		status: "Status",
		owner: "Owner",
		age: "Age",
	},
	queue: [],
	reposTitle: "Repos",
	reposSubtitle: "Installed repos that have quarantine or cleared activity",
	reposEmpty: "No repos with activity yet — install SlopGuard on your repos to start.",
	reposColumns: {
		repo: "Repository",
		quarantined: "Quarantined",
		cleared: "Cleared",
	},
	repos: [],
	campaignTitle: "Campaign radar",
	campaignSubtitle: "Clusters grouped by commit prefix across your repos",
	campaigns: [],
	campaignsEmpty: "No campaign clusters yet — once you have 3+ similar items, they show up here.",
	policyTitle: "Policy coverage",
	policyBody:
		"Coverage reflects how many of your installed repos have quarantine/cleared activity (i.e. are actually being protected).",
	coverageLabel: "Enforcing Team quarantine policy",
	coveragePercent: 0,
	coverageRepos: "0 installed repos",
	coverageMissing: "Install SlopGuard on more repos to extend coverage.",
	installHref: "/setup",
	alerts: "Configure alerts",
	alertsHref: "/alerts",
	heroEyebrow: "ORG · TEAM PLAN",
	heroTitle: "One pane for quarantine, campaigns, and policy coverage.",
	heroBody:
		"Live view of every repo SlopGuard protects. Quarantine items, group repeated patterns, and verify policy coverage — all from the same console.",
	heroCta: "Open campaigns",
	heroCtaHref: "/campaigns",
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
