import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Org Dashboard - Team",
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
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading…",
	emptyTitle: "SlopGuard is not installed on this account yet",
	emptyBody:
		"This console is a live view of your GitHub activity. Install SlopGuard on your repos and the dashboard will populate as soon as SlopGuard detects and labels your first item.",
	emptyCta: "Install SlopGuard on GitHub",
	emptyCtaHref: "/setup",
	heroEyebrow: "ORG / TEAM PLAN",
	heroTitle: "One pane for quarantine, campaigns, and policy coverage.",
	heroBody:
		"Live view of every repo SlopGuard protects. Quarantine items, group repeated patterns, and verify policy coverage - all from the same console.",
	heroCta: "Open campaigns",
	heroCtaHref: "/campaigns",
	queueTitle: "Quarantine queue",
	queueSubtitle: "Recent 5 across every protected repo",
	queueViewAll: "View all",
	queueViewAllHref: "/org/queue",
	queueColumns: {
		item: "Item",
		repo: "Repo",
		score: "Score",
		status: "Status",
		age: "Age",
	},
	reposTitle: "Repos",
	reposSubtitle: "Installed repos with quarantine or clear activity",
	reposViewAll: "View all",
	reposViewAllHref: "/org/repos",
	reposColumns: {
		repo: "Repository",
		quarantined: "Quarantined",
		cleared: "Cleared",
	},
	campaignTitle: "Campaign radar",
	campaignSubtitle: "Top clusters by commit prefix",
	campaignsEmpty:
		"No campaign clusters yet - once 3+ items share a prefix they show up here.",
	policyTitle: "Policy coverage",
	policyBody: "Share of installed repos that are actively protected",
	policyViewAll: "Open policy",
	policyViewAllHref: "/org/policy",
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
