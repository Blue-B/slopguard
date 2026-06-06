import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import ReposFullView, {
	type ReposFullViewCopy,
} from "@/app/components/ReposFullView";

export const metadata = {
	title: "SlopGuard: Repos - Team",
	description:
		"Every repo SlopGuard can see for your account, with live quarantine and clear counts.",
};

const copy: ReposFullViewCopy = {
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
	loading: "Loading repos…",
	empty:
		"SlopGuard is not installed on this account. Install it to enumerate your protected repos here.",
	installCta: "Install on GitHub",
	installHref: "/setup",
	backHref: "/org",
	backLabel: "Overview",
	heroEyebrow: "REPOS / ORG",
	heroTitle: "Every repo SlopGuard can see, with live activity counts.",
	heroBody:
		"Quarantined and cleared labels are aggregated per repo from your GitHub installation. Install on more repos to extend coverage.",
	columns: {
		repo: "Repository",
		quarantined: "Quarantined",
		cleared: "Cleared",
	},
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
