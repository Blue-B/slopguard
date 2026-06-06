import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import CampaignDetailConsole, {
	type CampaignDetailCopy,
} from "@/app/components/CampaignDetailConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Campaign Detail - Pro",
	description:
		"Drill into one cross-repo campaign cluster with live repo impact and commit evidence.",
};

const copy: CampaignDetailCopy = {
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
	backHref: "/campaigns",
	backLabel: "Campaigns",
	loading: "Loading campaign evidence…",
	error: "Failed to load campaign",
	heading: "CAMPAIGN EVIDENCE",
	subhead:
		"Live drill-down built from the campaign API. Repo impact stays tied to installed GitHub data.",
	metrics: {
		repos: "Repos",
		hits: "Hits",
		authors: "Authors",
		firstSeen: "First seen",
	},
	commitsTitle: "Commit evidence",
	impactTitle: "Repo impact",
};

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<>
			<MarketingNav
				lang="en"
				enHref={`/campaigns/${id}`}
				koHref={`/ko/campaigns/${id}`}
			/>
			<PlanGate lang="en" required="pro">
				<CampaignDetailConsole id={id} copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
