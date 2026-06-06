import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import QueueFullView, {
	type QueueFullViewCopy,
} from "@/app/components/QueueFullView";

export const metadata = {
	title: "SlopGuard: Quarantine Queue - Team",
	description:
		"Every quarantined and cleared item from your protected repos, sorted by recency.",
};

const copy: QueueFullViewCopy = {
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
	loading: "Loading queue…",
	empty:
		"SlopGuard is not installed on this account. Install it to see quarantine activity here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	backHref: "/org",
	backLabel: "Overview",
	heroEyebrow: "QUEUE / ORG",
	heroTitle: "Every quarantined and cleared item from your protected repos.",
	heroBody:
		"Sorted by recency. Click any row to open the underlying issue or PR on GitHub. Items here come from the labels SlopGuard applies to issues and pull requests.",
	columns: {
		item: "Item",
		repo: "Repo",
		score: "Score",
		status: "Status",
		owner: "Owner",
		age: "Age",
	},
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
