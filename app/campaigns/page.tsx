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
	user: "blue-b",
	entitlement: "Pro+ plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org#queue" },
		{ label: "Repos", href: "/org#repos" },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "Policy", href: "/org#policy" },
	],
	activeNav: "Campaigns",
	eyebrow: "PRO / TEAM FEATURE",
	title: "Catch the same AI prompt being shipped across repos.",
	subtitle:
		"The Pro and Team plans include this campaigns console: shared prompt fingerprints are grouped automatically, the score boost is applied to affected repos, and you can drill into exactly which commits and authors are involved.",
	investigate: "Investigate",
	backToOrg: "Org dashboard",
	accountHref: "/account",
	orgHref: "/org",
	heroEyebrow: "CAMPAIGNS · PRO+",
	heroTitle: "Catch the same prompt being shipped to five repos at once.",
	heroBody:
		"Cross-repo fingerprinting groups commits that share a near-identical body. Each cluster gets a risk tier, a score boost, and a per-repo drill-down so you can quarantine the campaign instead of chasing each PR.",
	heroCta: "Open cluster",
	heroCtaHref: "#clusters",
	metrics: [
		{
			label: "Active clusters",
			value: "3",
			detail: "1 high-confidence",
			tone: "danger",
		},
		{
			label: "Affected repos",
			value: "16",
			detail: "across 4 owners",
			tone: "warn",
		},
		{
			label: "Score boosts",
			value: "+72",
			detail: "applied in last 7d",
			tone: "ok",
		},
		{
			label: "Authors involved",
			value: "11",
			detail: "7 with ≥3 hits",
			tone: "neutral",
		},
	],
	clustersTitle: "Campaign clusters",
	clustersSubtitle:
		"Grouped by prompt fingerprint, ranked by cross-repo impact",
	clusters: [
		{
			fingerprint: "feat: implement new feature with comprehensive tests",
			repoCount: 7,
			hits: 23,
			firstSeen: "3 days ago",
			risk: "high",
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
			fingerprint: "fix: resolve edge case in parser",
			repoCount: 4,
			hits: 11,
			firstSeen: "1 week ago",
			risk: "medium",
			repos: [
				{ repo: "blue-b/api", commits: 4, authors: ["@alex"], score: 58 },
				{ repo: "blue-b/parser", commits: 2, authors: ["@rin"], score: 52 },
			],
		},
		{
			fingerprint: "docs: update onboarding guide",
			repoCount: 5,
			hits: 9,
			firstSeen: "2 weeks ago",
			risk: "low",
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
	scoreBoostTitle: "Score boost by plan",
	scoreBoostBody: "Bumps applied to commits that match a campaign fingerprint",
};

export default function CampaignsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/campaigns" koHref="/ko/campaigns" />
			<PlanGate lang="en" required="pro">
				<CampaignsConsole copy={copy} />
				<div
					style={{ maxWidth: 1200, margin: "0 auto 56px", padding: "0 20px" }}
				>
					<CampaignsClient
						clusters={copy.clusters.map((c) => ({
							id: c.fingerprint
								.toLowerCase()
								.replace(/[^a-z0-9]+/g, "_")
								.replace(/^_+|_+$/g, ""),
							fingerprint: c.fingerprint,
							risk: c.risk,
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
