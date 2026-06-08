import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import QueueFullView, {
	type QueueFullViewCopy,
} from "@/app/components/QueueFullView";

export const metadata: Metadata = {
	title: "SlopGuard: Quarantine Queue - Team",
	description:
		"Every quarantined and cleared item from your protected repos, sorted by recency.",
};

const copy: QueueFullViewCopy = {
	kicker: "SlopGuard Team",
	workspace: "Org overview",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading queue…",
	empty:
		"SlopGuard is not installed on this account. Install it to see quarantine activity here.",
	queueEmpty: "No queue items need action right now. New activity appears here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	heroEyebrow: "ORG ACTION QUEUE",
	heroTitle: "Not pattern analysis - the team action queue for today.",
	heroBody:
		"/campaigns groups repeated patterns across repos. This view is the operational queue of issues and PRs your team can open, triage, and clear now.",
	openLabel: "Queue items",
	statusLabels: { quarantined: "Quarantined", cleared: "Cleared", watching: "Watching" },
	tableTitle: "Open queue",
	tableSub: "Sorted by recency. Click a row to open the GitHub issue or PR.",
	columns: { item: "Item", repo: "Repo", score: "Score", status: "Status", owner: "Owner", age: "Age" },
};

export default function OrgQueuePage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/org/queue" koHref="/ko/org/queue" />
			<PlanGate lang="en" required="team">
				<QueueFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
