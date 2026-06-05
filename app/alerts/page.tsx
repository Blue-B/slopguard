import MarketingNav from "@/app/components/MarketingNav";
import AlertsConsole, { type AlertsConsoleCopy } from "@/app/components/AlertsConsole";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Alerts & Notifications — Team",
	description:
		"Team plan console: configure Slack, Discord, and webhook channels, routing rules, and the sent alert log.",
};

const copy: AlertsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team workspace",
	user: "Blue-B",
	entitlement: "Team entitlement active",
	connected: "● Connected to GitHub",
	nav: ["Overview", "Queue", "Repos", "Campaigns", "Alerts", "Policy"],
	activeNav: "Alerts",
	eyebrow: "TEAM FEATURE",
	title: "Route quarantine alerts to the right people.",
	subtitle:
		"The Team plan includes this alerts console: manage Slack, Discord, and webhook channels, decide which repos and patterns fire on which score threshold, and review what was actually sent.",
	backToOrg: "Org dashboard",
	testSend: "Send test alert",
	accountHref: "/account",
	campaignsHref: "/campaigns",
	orgHref: "/org",
	metrics: [
		{ label: "Active channels", value: "3", detail: "Slack, Discord, webhook" },
		{ label: "Routing rules", value: "5", detail: "2 score-based, 3 pattern-based" },
		{ label: "Alerts sent (30d)", value: "47", detail: "96% delivered" },
		{ label: "Avg. latency", value: "1.4s", detail: "p95 3.1s" },
	],
	channelsTitle: "Channels",
	channelsSubtitle: "Where quarantine alerts go",
	addChannel: "Add channel",
	channels: [
		{
			kind: "slack",
			label: "Security alerts",
			target: "hooks.slack.com/services/.../security",
			status: "active",
			lastSent: "12m ago",
		},
		{
			kind: "discord",
			label: "Engineering",
			target: "discord.com/api/webhooks/.../eng",
			status: "active",
			lastSent: "1h ago",
		},
		{
			kind: "webhook",
			label: "Custom relay",
			target: "ops.internal/slopguard/inbound",
			status: "failed",
			lastSent: "4h ago · 1 retry",
		},
	],
	rulesTitle: "Routing rules",
	rulesSubtitle: "Decide which patterns fire which channel",
	addRule: "Add rule",
	columns: {
		repo: "Repo",
		pattern: "Pattern",
		channel: "Channel",
		threshold: "Score ≥",
	},
	rules: [
		{
			repo: "blue-b/slopguard",
			pattern: "auth_surface",
			channel: "Security alerts",
			threshold: 60,
		},
		{
			repo: "blue-b/api",
			pattern: "lockfile_refresh",
			channel: "Engineering",
			threshold: 75,
		},
		{
			repo: "blue-b/docs",
			pattern: "docs_only",
			channel: "Custom relay",
			threshold: 90,
		},
		{
			repo: "blue-b/*",
			pattern: "high_confidence_campaign",
			channel: "Security alerts",
			threshold: 85,
		},
	],
	logTitle: "Sent alert log",
	logSubtitle: "What was delivered, what failed, and how fast",
	logColumns: {
		when: "When",
		item: "Item",
		score: "Score",
		dest: "Destination",
		status: "Status",
		latency: "Latency",
	},
	log: [
		{
			when: "2026-06-04 14:22",
			item: "acme/web#128",
			score: 87,
			dest: "Slack #security",
			status: "delivered",
			latency: "1.1s",
		},
		{
			when: "2026-06-03 09:11",
			item: "acme/api#44",
			score: 71,
			dest: "Discord",
			status: "delivered",
			latency: "0.9s",
		},
		{
			when: "2026-06-02 18:05",
			item: "acme/docs#7",
			score: 94,
			dest: "webhook_url",
			status: "retrying",
			latency: "2.4s",
		},
		{
			when: "2026-06-02 11:48",
			item: "acme/api#39",
			score: 62,
			dest: "Slack #security",
			status: "queued",
			latency: "—",
		},
	],
	note: "Delivery is best-effort. Full history is mirrored to your Slack/Discord or webhook endpoint.",
};

export default function AlertsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/alerts" koHref="/ko/alerts" />
			<AlertsConsole copy={copy} />
			<SiteFooter lang="en" />
		</>
	);
}
