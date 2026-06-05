import { LRUCache } from "lru-cache";

// Per-user state for paid feature consoles (channels, routing rules, audit
// log). In-memory only — the live production app uses GitHub as the source of
// truth for slop data, and these console-level settings are an MVP until we
// wire them to a real DB. Bounded; restarts clear entries (documented
// behavior for the free/team demo).

export type ChannelKind = "slack" | "discord" | "webhook";
export interface Channel {
	id: string;
	kind: ChannelKind;
	label: string;
	target: string;
	status: "active" | "paused" | "failed";
	lastSent?: string;
	lastLatencyMs?: number;
}

export interface RoutingRule {
	id: string;
	repo: string;
	pattern: string;
	channelId: string;
	threshold: number;
}

export interface SentAlert {
	id: string;
	owner: string;
	when: string;
	item: string;
	score: number;
	dest: string;
	channelId: string;
	channelKind: ChannelKind;
	status: "delivered" | "failed" | "queued" | "retrying";
	latency: string;
	latencyMs: number;
}

export interface AuditEntry {
	id: string;
	owner: string;
	when: string;
	actor: string;
	action: string;
	target: string;
	source: "SSO" | "API" | "Admin";
}

export interface Integration {
	name: string;
	status: "connected" | "pending" | "available";
	scope: string;
}

export interface OwnerConsoleState {
	owner: string;
	channels: Channel[];
	rules: RoutingRule[];
	sentAlerts: SentAlert[];
	audit: AuditEntry[];
	integrations: Integration[];
}

const store = new LRUCache<string, OwnerConsoleState>({
	max: 5000,
	ttl: 1000 * 60 * 60 * 24 * 7,
});

function emptyState(owner: string): OwnerConsoleState {
	return {
		owner: owner.toLowerCase(),
		channels: seedChannels(owner),
		rules: seedRules(owner),
		sentAlerts: seedAlerts(owner),
		audit: seedAudit(owner),
		integrations: seedIntegrations(),
	};
}

export function getState(owner: string): OwnerConsoleState {
	const key = owner.toLowerCase();
	let s = store.get(key);
	if (!s) {
		s = emptyState(owner);
		store.set(key, s);
	}
	return s;
}

export function mutateState(
	owner: string,
	fn: (s: OwnerConsoleState) => void,
): OwnerConsoleState {
	const s = getState(owner);
	fn(s);
	store.set(s.owner, s);
	return s;
}

function id(): string {
	return Math.random().toString(36).slice(2, 10);
}

// ── Seeds (sample data so first-time visitors see real-looking state) ─────
function seedChannels(owner: string): Channel[] {
	return [
		{
			id: "ch_slack_security",
			kind: "slack",
			label: "Security alerts",
			target: "hooks.slack.com/services/.../security",
			status: "active",
			lastSent: "12m ago",
			lastLatencyMs: 1100,
		},
		{
			id: "ch_discord_eng",
			kind: "discord",
			label: "Engineering",
			target: "discord.com/api/webhooks/.../eng",
			status: "active",
			lastSent: "1h ago",
			lastLatencyMs: 900,
		},
		{
			id: "ch_webhook_relay",
			kind: "webhook",
			label: "Custom relay",
			target: "ops.internal/slopguard/inbound",
			status: "failed",
			lastSent: "4h ago",
			lastLatencyMs: 2400,
		},
	];
}

function seedRules(_owner: string): RoutingRule[] {
	return [
		{
			id: id(),
			repo: "blue-b/slopguard",
			pattern: "auth_surface",
			channelId: "ch_slack_security",
			threshold: 60,
		},
		{
			id: id(),
			repo: "blue-b/api",
			pattern: "lockfile_refresh",
			channelId: "ch_discord_eng",
			threshold: 75,
		},
		{
			id: id(),
			repo: "blue-b/docs",
			pattern: "docs_only",
			channelId: "ch_webhook_relay",
			threshold: 90,
		},
	];
}

function seedAlerts(owner: string): SentAlert[] {
	return [
		{
			id: id(),
			owner: owner.toLowerCase(),
			when: "2026-06-04 14:22",
			item: "acme/web#128",
			score: 87,
			dest: "Slack #security",
			channelId: "ch_slack_security",
			channelKind: "slack",
			status: "delivered",
			latency: "1.1s",
			latencyMs: 1100,
		},
		{
			id: id(),
			owner: owner.toLowerCase(),
			when: "2026-06-03 09:11",
			item: "acme/api#44",
			score: 71,
			dest: "Discord",
			channelId: "ch_discord_eng",
			channelKind: "discord",
			status: "delivered",
			latency: "0.9s",
			latencyMs: 900,
		},
		{
			id: id(),
			owner: owner.toLowerCase(),
			when: "2026-06-02 18:05",
			item: "acme/docs#7",
			score: 94,
			dest: "Custom relay",
			channelId: "ch_webhook_relay",
			channelKind: "webhook",
			status: "retrying",
			latency: "2.4s",
			latencyMs: 2400,
		},
	];
}

function seedAudit(owner: string): AuditEntry[] {
	const handle = owner.toLowerCase();
	return [
		{
			id: id(),
			owner: handle,
			when: "2026-06-04 14:22",
			actor: `${handle}@acme.com`,
			action: "cleared quarantine",
			target: "acme/web#128",
			source: "SSO",
		},
		{
			id: id(),
			owner: handle,
			when: "2026-06-04 11:08",
			actor: "ops-bot",
			action: "rotated webhook secret",
			target: "org settings",
			source: "API",
		},
		{
			id: id(),
			owner: handle,
			when: "2026-06-03 18:44",
			actor: "bob@acme.com",
			action: "added repository",
			target: "acme/api",
			source: "Admin",
		},
	];
}

function seedIntegrations(): Integration[] {
	return [
		{
			name: "Jira",
			status: "connected",
			scope: "Create tickets for quarantined PRs",
		},
		{
			name: "PagerDuty",
			status: "pending",
			scope: "Page on-call on High-risk campaign",
		},
		{
			name: "Datadog",
			status: "available",
			scope: "Forward audit events as logs",
		},
	];
}
