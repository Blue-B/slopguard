import { cookies } from "next/headers";
import MarketingNav from "@/app/components/MarketingNav";
import AlertsConsole, { type AlertsConsoleCopy } from "@/app/components/AlertsConsole";
import AlertsConsoleClient from "@/app/components/AlertsConsoleClient";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts, planForOwner } from "@/lib/billing/entitlement";
import { getState } from "@/lib/billing/console-store";

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
	logTitle: "Sent alert log (sample)",
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

async function loadLiveData() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) return null;
	const plan = await planForOwner(session.login);
	if (!(await hasAlerts(session.login))) return null;
	const state = getState(session.login);
	return {
		login: session.login,
		plan,
		channels: state.channels,
		sentAlerts: state.sentAlerts.slice(0, 20),
	};
}

export default async function AlertsPage() {
	const live = await loadLiveData();
	return (
		<>
			<MarketingNav lang="en" enHref="/alerts" koHref="/ko/alerts" />
			<PlanGate lang="en" required="team">
				<AlertsConsole copy={copy} />
				{live ? (
					<div style={{ maxWidth: 1200, margin: "0 auto 56px", padding: "0 20px" }}>
						<AlertsConsoleClient
							channels={live.channels}
							sentAlerts={live.sentAlerts}
							addChannelLabel="Add a real channel"
							channelKindLabel="Kind"
							targetLabel="Webhook URL"
							kindSlack="Slack"
							kindDiscord="Discord"
							kindWebhook="Generic webhook"
							submitLabel="Add channel"
							testSendLabel="Send test alert"
							sendingLabel="Sending…"
							successLabel="Sent"
							failedLabel="Failed"
							emptyChannelsLabel="No channels configured yet."
						/>
					</div>
				) : null}
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
