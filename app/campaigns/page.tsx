import MarketingNav from "@/app/components/MarketingNav";
import CampaignsClient from "@/app/components/CampaignsClient";
import CampaignsConsole, {
	type CampaignsConsoleCopy,
} from "@/app/components/CampaignsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Cross-Repo Campaigns — Pro & Team",
	description:
		"Pro/Team console: investigate shared AI prompt fingerprints across repositories, with score-boosted quarantine and per-cluster drill-down.",
};

const copy: CampaignsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Pro · Team workspace",
	user: "Blue-B",
	entitlement: "Pro+ entitlement active",
	connected: "● Connected to GitHub",
	nav: ["Overview", "Queue", "Repos", "Campaigns", "Alerts", "Policy"],
	activeNav: "Campaigns",
	eyebrow: "PRO / TEAM FEATURE",
	title: "Catch the same AI prompt being shipped across repos.",
	subtitle:
		"The Pro and Team plans include this campaigns console: shared prompt fingerprints are grouped automatically, the score boost is applied to affected repos, and you can drill into exactly which commits and authors are involved.",
	backToOrg: "Org dashboard",
	primaryAction: "Configure alerts",
	accountHref: "/account",
	orgHref: "/org",
	alertsHref: "/alerts",
	metrics: [
		{ label: "Active clusters", value: "3", detail: "1 high-confidence" },
		{ label: "Affected repos", value: "16", detail: "across 4 owners" },
		{ label: "Score boosts", value: "+72", detail: "applied in last 7d" },
		{ label: "Authors involved", value: "11", detail: "7 with ≥3 hits" },
	],
	clustersTitle: "Campaign clusters",
	clustersSubtitle:
		"Grouped by prompt fingerprint, ranked by cross-repo impact",
	riskHigh: "High",
	riskMedium: "Medium",
	riskLow: "Low",
	repoHeader: "Repo",
	commitsHeader: "Commits",
	authorsHeader: "Authors",
	scoreHeader: "Score",
	investigate: "Investigate",
	clusters: [
		{
			campaign: {
				fingerprint: "feat: implement new feature with comprehensive tests",
				repos: 7,
				hits: 23,
				authors: 4,
				first: "3 days ago",
				risk: "High",
				boost: 25,
			},
			repos: [
				{
					repo: "blue-b/slopguard",
					commits: 6,
					authors: ["@blue-b"],
					score: 78,
				},
				{
					repo: "blue-b/web",
					commits: 4,
					authors: ["@alex", "@rin"],
					score: 71,
				},
				{ repo: "blue-b/api", commits: 3, authors: ["@alex"], score: 64 },
			],
		},
		{
			campaign: {
				fingerprint: "fix: resolve edge case in parser",
				repos: 4,
				hits: 11,
				authors: 2,
				first: "1 week ago",
				risk: "Medium",
				boost: 15,
			},
			repos: [
				{ repo: "blue-b/api", commits: 4, authors: ["@alex"], score: 58 },
				{ repo: "blue-b/parser", commits: 2, authors: ["@rin"], score: 52 },
			],
		},
		{
			campaign: {
				fingerprint: "docs: update onboarding guide",
				repos: 5,
				hits: 9,
				authors: 3,
				first: "2 weeks ago",
				risk: "Low",
				boost: 8,
			},
			repos: [
				{
					repo: "blue-b/docs",
					commits: 3,
					authors: ["@blue-b", "@rin"],
					score: 41,
				},
				{
					repo: "blue-b/help-center",
					commits: 2,
					authors: ["@alex"],
					score: 38,
				},
			],
		},
	],
	note: "Score boost is added on top of the per-item slop score for any commit that matches a campaign fingerprint. Higher boosts raise quarantine priority automatically.",
};

export default function CampaignsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/campaigns" koHref="/ko/campaigns" />
			<PlanGate lang="en" required="pro">
				<CampaignsConsole copy={copy} />
				<div style={{ maxWidth: 1200, margin: "0 auto 56px", padding: "0 20px" }}>
					<CampaignsClient
						clusters={copy.clusters.map((c) => ({
							id: c.campaign.fingerprint
								.toLowerCase()
								.replace(/[^a-z0-9]+/g, "_")
								.replace(/^_+|_+$/g, ""),
							fingerprint: c.campaign.fingerprint,
							risk: c.campaign.risk,
						}))}
						investigateLabel="Investigate"
						loadingLabel="Loading…"
						closeLabel="Close"
						emptyCommitsLabel="No commits in this cluster yet."
					/>
				</div>
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
