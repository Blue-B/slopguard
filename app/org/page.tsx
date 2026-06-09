import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Org Dashboard - Team",
	description:
		"Team plan console for org-wide quarantine queues, pattern clusters, and policy coverage.",
};

const copy: OrgDashboardConsoleCopy = {
	kicker: "SlopGuard Team",
	workspace: "Org overview",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading…",
	emptyTitle: "SlopGuard is not installed on this account yet",
	emptyBody:
		"This console is a live view of your GitHub activity. Install SlopGuard on your repos and the dashboard will populate as soon as SlopGuard detects and labels your first item.",
	emptyCta: "Install SlopGuard on GitHub",
	emptyCtaHref: "/setup",
	heroEyebrow: "ORG / TEAM PLAN",
	heroTitle: "One pane for quarantine, patterns, and policy coverage.",
	heroBody:
		"Live view of every repo SlopGuard protects. Quarantine items, group repeated patterns, and verify policy coverage - all from the same console.",
	heroCta: "Open patterns",
	heroCtaHref: "/campaigns",
	queueTitle: "Quarantine queue",
	queueSubtitle: "Recent 5 across every protected repo",
	queueViewAll: "View all",
	queueViewAllHref: "/org/queue",
	queueColumns: { item: "Item", repo: "Repo", score: "Score", status: "Status", age: "Age" },
	reposTitle: "Repos",
	reposSubtitle: "Installed repos with quarantine or clear activity",
	reposViewAll: "View all",
	reposViewAllHref: "/org/repos",
	campaignTitle: "Pattern radar",
	campaignSubtitle: "Top clusters by commit prefix",
	campaignsEmpty:
		"No pattern clusters yet - once 3+ items share a prefix they show up here.",
	campaignHref: "/campaigns",
	campaignCta: "Open console",
	alertsTitle: "Alerts",
	alertsBody: "Slack/Discord/webhook delivery on quarantine. Configure repo + pattern routing rules.",
	alertsHref: "/alerts",
	alertsCta: "Open settings",
	policyTitle: "Policy coverage",
	policyBody: "Share of installed repos that are actively protected",
	policyViewAll: "Open policy",
	policyViewAllHref: "/org/policy",
	metricLabels: { open: "Open reviews", repos: "Protected repos", score: "Avg score", policy: "Policy" },
	statusLabels: { quarantined: "Quarantined", cleared: "Cleared", watching: "Watching" },
	emptyQueue: "No items in the last 30 days.",
	emptyRepos: "No repos with activity yet.",
	policyReadout: "Share of installed repos with active policy signals",
	trendTitle: "Last 14 days",
	trendEmpty: "No trend data yet. Quarantines will chart here as they accrue.",
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
