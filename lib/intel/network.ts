// SlopGuard Network Intelligence — a hosting-only moat.
//
// The hosted service sees quarantine events across EVERY installation. A
// self-hosted instance only ever sees its own repos, so this cross-customer
// signal is impossible to replicate by self-hosting (which is exactly why it is
// a paid, hosted-only feature and not part of the source-available core).
//
// What it does:
//   1. Global slop intelligence: a prompt fingerprint or author seen as slop
//      across MANY owners' repos is more likely slop on yours too. We boost the
//      score the first time such a fingerprint hits your repo (collective herd
//      immunity).
//   2. Collective feedback: when maintainers run /slop approve|reject, that
//      outcome updates the fingerprint's network reputation, so a pattern that
//      keeps getting cleared as a false positive is suppressed network-wide.
//
// Privacy: we store a one-way SHA-256 hash of the (already non-reversible)
// prompt fingerprint, the public GitHub author handle, and counters only. No PR
// or issue content is ever stored. Owners can opt out with `share_intel: false`
// in .github/SLOP_POLICY.yml.

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";
const TIMEOUT_MS = 3000;
// Counters live for 90 days from last touch so the network reflects current
// slop campaigns, not ancient history.
const TTL_S = 60 * 60 * 24 * 90;
const ITEM_TTL_S = 60 * 60 * 24 * 45;

// Distinct-owner count at/above which a fingerprint is "seen across the network".
const NETWORK_REPO_THRESHOLD = 2;
// Score nudge applied when the network has strong signal. Bounded and modest so
// the local heuristic + LLM stay primary.
const NETWORK_BOOST = Number(process.env.NETWORK_BOOST ?? 18);
const NETWORK_SUPPRESS = Number(process.env.NETWORK_SUPPRESS ?? 20);

let client: Redis | null = null;
function redis(): Redis | null {
	if (!REDIS_URL || !REDIS_TOKEN) return null;
	if (!client)
		client = new Redis({
			url: REDIS_URL,
			token: REDIS_TOKEN,
			retry: { retries: 1, backoff: () => 150 },
		});
	return client;
}

function guard<T>(op: Promise<T>): Promise<T> {
	let timer: ReturnType<typeof setTimeout>;
	const t = new Promise<T>((_, rej) => {
		timer = setTimeout(() => rej(new Error("redis timeout")), TIMEOUT_MS);
	});
	return Promise.race([op, t]).finally(() => clearTimeout(timer)) as Promise<T>;
}

function fpHash(fingerprint: string): string {
	return createHash("sha256").update(fingerprint).digest("hex").slice(0, 24);
}
function ownerHash(owner: string): string {
	return createHash("sha256")
		.update(owner.toLowerCase())
		.digest("hex")
		.slice(0, 16);
}

export type NetworkSignal = {
	/** distinct owners (repos' orgs) where this fingerprint was seen as slop */
	networkRepos: number;
	/** confirmed-slop vs cleared outcomes recorded by maintainers network-wide */
	confirmed: number;
	cleared: number;
	/** score delta to apply (positive = boost toward slop, negative = suppress) */
	delta: number;
	/** human-readable reason, or null if no actionable signal */
	reason: string | null;
};

const EMPTY: NetworkSignal = {
	networkRepos: 0,
	confirmed: 0,
	cleared: 0,
	delta: 0,
	reason: null,
};

/**
 * Read the network's view of this fingerprint/author BEFORE recording the
 * current sighting, so the counts reflect OTHER installations, not this one.
 * Best-effort: any error returns a no-op signal so scoring never breaks.
 */
export async function getNetworkSignal(
	fingerprint: string,
	author: string,
): Promise<NetworkSignal> {
	const r = redis();
	if (!r || !fingerprint) return EMPTY;
	try {
		const fp = fpHash(fingerprint);
		const [repos, meta] = await guard(
			Promise.all([
				r.pfcount(`ni:fpo:${fp}`),
				r.hgetall<Record<string, string>>(`ni:fp:${fp}`),
			]),
		);
		const networkRepos = Number(repos ?? 0);
		const confirmed = Number(meta?.confirmed ?? 0);
		const cleared = Number(meta?.cleared ?? 0);

		// Suppress: maintainers keep clearing this pattern as a false positive
		// across the network. Pull the score down to avoid repeating their work.
		if (cleared >= 3 && cleared > confirmed * 2) {
			return {
				networkRepos,
				confirmed,
				cleared,
				delta: -NETWORK_SUPPRESS,
				reason: `Network: maintainers cleared this pattern ${cleared}x as a false positive; score reduced`,
			};
		}

		// Boost: same fingerprint flagged across several distinct owners.
		if (networkRepos >= NETWORK_REPO_THRESHOLD) {
			return {
				networkRepos,
				confirmed,
				cleared,
				delta: NETWORK_BOOST,
				reason: `Network: this prompt fingerprint was flagged across ${networkRepos} other repositories in the SlopGuard network`,
			};
		}
		return { networkRepos, confirmed, cleared, delta: 0, reason: null };
	} catch {
		return EMPTY;
	}
}

/**
 * Record that `owner` saw `fingerprint` from `author` as slop. Adds the owner to
 * the fingerprint's distinct-owner HyperLogLog and stores a short item->fp map
 * so a later /slop command can attribute the maintainer's outcome. Best-effort.
 */
export async function recordSighting(
	owner: string,
	repo: string,
	itemNumber: number,
	fingerprint: string,
	author: string,
): Promise<void> {
	const r = redis();
	if (!r || !fingerprint) return;
	try {
		const fp = fpHash(fingerprint);
		const oh = ownerHash(owner);
		const now = Date.now();
		await guard(
			Promise.all([
				r.pfadd(`ni:fpo:${fp}`, oh),
				r.hincrby(`ni:fp:${fp}`, "sightings", 1),
				r.hset(`ni:fp:${fp}`, { ts: now, author: author || "" }),
				r.expire(`ni:fp:${fp}`, TTL_S),
				r.expire(`ni:fpo:${fp}`, TTL_S),
				// item -> fingerprint, so /slop approve|reject can find it later
				r.set(`ni:item:${owner.toLowerCase()}/${repo.toLowerCase()}#${itemNumber}`, fp, {
					ex: ITEM_TTL_S,
				}),
			]),
		);
	} catch {
		/* best-effort */
	}
}

/**
 * Record a maintainer outcome for a previously-quarantined item. `outcome` is
 * "confirmed" (/slop reject) or "cleared" (/slop approve | false-positive).
 * Looks up the item's fingerprint and updates its network reputation.
 */
export async function recordOutcome(
	owner: string,
	repo: string,
	itemNumber: number,
	outcome: "confirmed" | "cleared",
): Promise<void> {
	const r = redis();
	if (!r) return;
	try {
		const itemKey = `ni:item:${owner.toLowerCase()}/${repo.toLowerCase()}#${itemNumber}`;
		const fp = await guard(r.get<string>(itemKey));
		if (!fp) return;
		await guard(
			Promise.all([
				r.hincrby(`ni:fp:${fp}`, outcome, 1),
				r.expire(`ni:fp:${fp}`, TTL_S),
			]),
		);
	} catch {
		/* best-effort */
	}
}

/** True when the hosted network store is configured (always false on a bare
 *  self-host without Upstash, which is the point). */
export function isNetworkEnabled(): boolean {
	return Boolean(REDIS_URL && REDIS_TOKEN);
}

// Long-term trends (hosting-only). The source-available core reads slop history
// live from GitHub and keeps no database, so it cannot show trends over time.
// The hosted service persists a small daily counter per owner.
const TREND_TTL_S = 60 * 60 * 24 * 400;

function dayKey(d = new Date()): string {
	return d.toISOString().slice(0, 10);
}

export type TrendDay = { date: string; quarantined: number; cleared: number };

/** Increment today's per-owner counter for a quarantine or clear event. */
export async function recordTrendEvent(
	owner: string,
	kind: "quarantined" | "cleared",
): Promise<void> {
	const r = redis();
	if (!r) return;
	try {
		const key = `trend:${owner.toLowerCase()}:${dayKey()}`;
		await guard(
			Promise.all([r.hincrby(key, kind, 1), r.expire(key, TREND_TTL_S)]),
		);
	} catch {
		/* best-effort */
	}
}

/** Read the last `days` days of per-owner slop trend (oldest first). */
export async function getTrend(owner: string, days = 30): Promise<TrendDay[]> {
	const r = redis();
	if (!r) return [];
	const dates: string[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date();
		d.setUTCDate(d.getUTCDate() - i);
		dates.push(dayKey(d));
	}
	try {
		const o = owner.toLowerCase();
		const rows = await guard(
			Promise.all(
				dates.map((date) =>
					r.hgetall<Record<string, string>>(`trend:${o}:${date}`),
				),
			),
		);
		return dates.map((date, i) => ({
			date,
			quarantined: Number(rows[i]?.quarantined ?? 0),
			cleared: Number(rows[i]?.cleared ?? 0),
		}));
	} catch {
		return [];
	}
}
