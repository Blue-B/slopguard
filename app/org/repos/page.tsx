import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import ReposFullView, {
	type ReposFullViewCopy,
} from "@/app/components/ReposFullView";

export const metadata: Metadata = {
	title: "SlopGuard: Repos - Team",
	description:
		"Every repo SlopGuard can see for your account, with live quarantine and clear counts.",
};

const copy: ReposFullViewCopy = {
	kicker: "SlopGuard Team",
	workspace: "Org overview",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue" },
		{ label: "Repos", href: "/org/repos" },
		{ label: "Policy", href: "/org/policy" },
	],
	loading: "Loading repos…",
	empty:
		"SlopGuard is not installed on this account. Install it to enumerate your protected repos here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	heroEyebrow: "ORG / REPOS",
	heroTitle: "The repository scope for team operations, in one place.",
	heroBody:
		"Overview is the summary, Queue is what needs action, and Repos is the protection scope. Quarantine and cleared counts come from your GitHub installation.",
	labels: {
		installed: "Installed repos",
		coverage: "Coverage",
		quarantined: "Quarantined",
		cleared: "Cleared",
		coverageNote: "This is the team operations scope: which repos are protected and where quarantine/cleared activity happened.",
	},
	columns: { repo: "Repository", quarantined: "Quarantined", cleared: "Cleared" },
};

export default function OrgReposPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/org/repos" koHref="/ko/org/repos" />
			<PlanGate lang="en" required="team">
				<ReposFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
