import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import CampaignsConsole, {
	type CampaignsConsoleCopy,
} from "@/app/components/CampaignsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Pattern Tracking - Pro",
	description:
		"Pro plan cross-repo fingerprint clustering: group repeated AI-style commit patterns across your installed repos.",
};

const copy: CampaignsConsoleCopy = {
	kicker: "SlopGuard Pro",
	workspace: "Patterns",
	connected: "Connected to GitHub",
	nav: [],
	detailBase: "/campaigns",
	loading: "Loading…",
	emptyTitle: "No campaign data yet",
	emptyBody:
		"SlopGuard needs at least one installed repo with activity to start clustering. Once a repo has items labeled by the detector, related commit prefixes show up here as clusters.",
	emptyCta: "Install on GitHub",
	emptyCtaHref: "/setup",
	investigate: "Investigate",
	heroEyebrow: "PATTERNS / PRO PLAN",
	heroTitle: "Catch the same prompt being used across repos.",
	heroBody:
		"SlopGuard groups PRs by commit-title prefix and surfaces the ones spreading across your installed repos. Each cluster links to its drill-down view.",
	metricLabels: { clusters: "Active clusters", hits: "Total hits", authors: "Authors", repos: "Repos" },
	clustersTitle: "Active clusters",
	leadTitle: "Top cluster",
	clustersSubtitle: "Clustered by commit-title prefix across your installed repos",
	clustersEmpty: "No clusters yet - once a prefix repeats, it shows up here.",
	leadSummary: "{hits} repeated hits across {repos} repos with {authors} authors involved.",
	firstSeen: "first seen",
	streamCols: { fingerprint: "fingerprint", scope: "scope (hits/repos)", risk: "risk" },
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
