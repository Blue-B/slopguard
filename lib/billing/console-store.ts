import {
	PersistentMap,
	ensureStoresReady,
	flushStores,
} from "../storage/persist.js";

/** Hydrate the persistent console mirror (no-op unless Redis cold start). Await
 *  this before reading owner console state in an async route so the data is
 *  correct on the first request after a redeploy. */
export const ensureConsoleReady = ensureStoresReady;

/** Await durable persistence of pending console writes. Call after a mutation
 *  and before sending the HTTP response so the write is guaranteed saved. */
export const flushConsole = flushStores;

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

export type SsoProvider =
	| "okta"
	| "azure-ad"
	| "google"
	| "onelogin"
	| "generic";
export type SsoStatus = "active" | "pending" | "unconfigured";

export interface SsoConfig {
	provider: SsoProvider;
	status: SsoStatus;
	entityId: string;
	acsUrl: string;
	idpMetadataUrl: string;
	emailAttribute: string;
	loginAttribute: string;
	enforced: boolean;
	lastSync?: string;
}

export interface OwnerConsoleState {
	owner: string;
	channels: Channel[];
	rules: RoutingRule[];
	sentAlerts: SentAlert[];
	audit: AuditEntry[];
	integrations: Integration[];
	ssoConfig: SsoConfig;
}

// Persisted to ${DATA_DIR}/console-state.json when DATA_DIR is set; otherwise
// kept purely in memory (survives the process, not a redeploy).
const store = new PersistentMap<OwnerConsoleState>("console-state");

function emptyState(owner: string): OwnerConsoleState {
	// Real production data only. The owner must explicitly add channels,
	// rules, integrations, and the audit log records the actions they take.
	// The previous seed data made the consoles look "populated" without
	// representing anything the user actually did, which the product team
	// flagged as marketing-dummy behavior in 2026-06.
	return {
		owner: owner.toLowerCase(),
		channels: [],
		rules: [],
		sentAlerts: [],
		audit: [],
		integrations: [],
		ssoConfig: defaultSsoConfig(owner),
	};
}

function defaultSsoConfig(owner: string): SsoConfig {
	return {
		provider: "okta",
		status: "unconfigured",
		entityId: `urn:slopguard:enterprise:${owner.toLowerCase()}`,
		acsUrl: `https://slopguard.app/api/enterprise/sso/acs?owner=${encodeURIComponent(owner.toLowerCase())}`,
		idpMetadataUrl: "",
		emailAttribute: "email",
		loginAttribute: "login",
		enforced: false,
	};
}

export function getState(owner: string): OwnerConsoleState {
	const key = owner.toLowerCase();
	const s = store.get(key);
	// A read must never persist. Returning a fresh empty state WITHOUT writing it
	// avoids clobbering the owner's real Redis data on a cold-start/un-hydrated
	// miss; mutateState persists only after the caller actually changes something.
	return s ?? emptyState(owner);
}

export function mutateState(
	owner: string,
	fn: (s: OwnerConsoleState) => void,
): OwnerConsoleState {
	const s = getState(owner);
	fn(s);
	store.set(s.owner.toLowerCase(), s);
	return s;
}

export function pushAudit(
	owner: string,
	entry: Omit<AuditEntry, "id" | "owner" | "when">,
): AuditEntry {
	const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	const e: AuditEntry = {
		id,
		owner: owner.toLowerCase(),
		when: new Date().toISOString(),
		...entry,
	};
	mutateState(owner, (s) => {
		s.audit = [e, ...s.audit].slice(0, 200);
	});
	return e;
}
