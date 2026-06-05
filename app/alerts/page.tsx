import MarketingNav from "@/app/components/MarketingNav";
import AlertsConsole, {
	type AlertsConsoleCopy,
} from "@/app/components/AlertsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Alerts & Notifications — Team",
	description:
		"Team plan alert console: configure Slack, Discord, and webhook channels, route by repo + pattern, and watch live delivery.",
};

const copy: AlertsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team workspace",
	user: "blue-b",
	entitlement: "Team plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/org" },
		{ label: "Queue", href: "/org/queue", external: true },
		{ label: "Repos", href: "/org/repos", external: true },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts" },
		{ label: "Policy", href: "/org/policy", external: true },
	],
	loading: "Loading…",
	backToOrg: "Back to org",
	orgHref: "/org",
	campaignsHref: "/campaigns",
	accountHref: "/account",
	heroEyebrow: "ALERTS · TEAM PLAN",
	heroTitle: "One channel per audience, with rules that actually route.",
	heroBody:
		"Add Slack, Discord, or a custom webhook. Then bind a repo + pattern to a channel with a slop-score threshold. The log below shows live delivery.",
	heroCta: "Open campaigns",
	heroCtaHref: "/campaigns",
	channelsTitle: "Channels",
	channelsSubtitle:
		"Targets are stored per-owner. Add a channel, then create a routing rule that points at it.",
	channelsEmpty:
		"No channels yet. Add one below — pick Slack, Discord, or a generic webhook target.",
	addChannelTitle: "Add a channel",
	addChannelBody: "",
	addChannelKindLabel: "Channel kind",
	addChannelLabelLabel: "Label",
	addChannelTargetLabel: "Target URL",
	addChannelCta: "Add channel",
	addChannelBusy: "Adding…",
	removeChannel: "Remove",
	channelsRemovedFlash: "Channel removed",
	rulesTitle: "Routing rules",
	rulesSubtitle: "Match by repo + pattern; only fire when score ≥ threshold.",
	rulesEmpty:
		"No routing rules yet. Add a channel first, then create a rule that points at it.",
	rulesColumns: {
		repo: "Repo",
		pattern: "Pattern",
		channel: "Channel",
		threshold: "Threshold",
	},
	addRuleTitle: "Add a routing rule",
	addRuleBody: "",
	addRuleRepoLabel: "Repository",
	addRulePatternLabel: "Pattern",
	addRuleChannelLabel: "Channel",
	addRuleThresholdLabel: "Score ≥",
	addRuleCta: "Add rule",
	removeRule: "Remove",
	logTitle: "Sent alert log",
	logSubtitle: "Most recent deliveries, failures, and retries.",
	logEmpty:
		"No alerts sent yet. Trigger a test send from a channel to see entries here.",
	logColumns: {
		when: "When",
		item: "Item",
		score: "Score",
		dest: "Dest",
		status: "Status",
		latency: "Latency",
	},
};

export default function AlertsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/alerts" koHref="/ko/alerts" />
			<PlanGate lang="en" required="team">
				<AlertsConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
