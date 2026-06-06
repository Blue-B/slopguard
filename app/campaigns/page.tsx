import MarketingNav from "@/app/components/MarketingNav";
import CampaignsConsole, {
	type CampaignsConsoleCopy,
} from "@/app/components/CampaignsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Campaign Detection - Pro",
	description:
		"Pro plan cross-repo fingerprint clustering: group repeated AI-style commit patterns across your installed repos.",
};

const copy: CampaignsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Pro workspace",
	user: "blue-b",
	entitlement: "Pro plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Campaigns", href: "/campaigns" },
		{ label: "Alerts", href: "/alerts" },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading…",
	emptyTitle: "No campaign data yet",
	emptyBody:
		"SlopGuard needs at least one installed repo with activity to start clustering. Once a repo has items labeled by the detector, related commit prefixes show up here as clusters.",
	emptyCta: "Install on GitHub",
	emptyCtaHref: "/setup",
	investigate: "Investigate",
	backToOrg: "Back to org",
	orgHref: "/org",
	accountHref: "/account",
	heroEyebrow: "CAMPAIGNS / PRO PLAN",
	heroTitle: "Catch the same prompt being used across repos.",
	heroBody:
		"SlopGuard groups PRs by commit-title prefix and surfaces the ones spreading across your installed repos. Each cluster links to its drill-down view.",
	heroCta: "Open alerts",
	heroCtaHref: "/alerts",
	clustersTitle: "Active clusters",
	clustersSubtitle:
		"Clustered by commit-title prefix across your installed repos",
	clustersEmpty: "No clusters yet - once a prefix repeats, it shows up here.",
	scoreBoostTitle: "Score boost tiers",
	scoreBoostBody: "How plan tier affects confidence on cross-repo matches",
};

export default function CampaignsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/campaigns" koHref="/ko/campaigns" />
			<PlanGate lang="en" required="pro">
				<CampaignsConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
