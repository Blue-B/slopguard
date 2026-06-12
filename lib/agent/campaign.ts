import { LRUCache } from "lru-cache";

// Cross-repo bot-campaign detection (a Pro/Team feature).
//
// Bot/AI-slop floods often reuse the same prompt across many repos: the same
// near-identical PR/issue body shows up under different owners' projects. A
// single-repo scan can't see that pattern; this module remembers prompt
// fingerprints per OWNER over a sliding window (in-memory, no DB) and flags
// when one fingerprint lands across multiple repos or many times in a row.
//
// Scope is per-owner so one customer's traffic never leaks into another's
// signal. The window resets on process restart, which is acceptable for an
// MVP heuristic, campaigns are bursty and happen within minutes/hours.

interface Sighting {
	repos: Set<string>;
	authors: Set<string>;
	count: number;
	firstSeen: number;
	lastSeen: number;
}

export interface CampaignInfo {
	/** the same prompt fingerprint hit this many distinct repos */
	repoCount: number;
	/** total times this fingerprint was seen in the window */
	totalCount: number;
	/** distinct authors pushing it */
	authorCount: number;
	/** repos touched (capped sample) */
	repos: string[];
}

// owner -> (fingerprint -> sighting). Bounded; entries expire after the window.
const WINDOW_MS = Number(process.env.CAMPAIGN_WINDOW_MS ?? 1000 * 60 * 60 * 6); // 6h
const store = new LRUCache<string, Map<string, Sighting>>({
	max: 2000,
	ttl: WINDOW_MS,
	updateAgeOnGet: true,
});

/** Distinct-repo threshold that promotes a fingerprint to "campaign". */
const REPO_THRESHOLD = Number(process.env.CAMPAIGN_REPO_THRESHOLD ?? 2);
/** OR: same fingerprint seen this many times total (even in one repo). */
const COUNT_THRESHOLD = Number(process.env.CAMPAIGN_COUNT_THRESHOLD ?? 4);

/**
 * Record a sighting of `fingerprint` for `owner` from `repo`/`author`, then
 * report whether it now constitutes a cross-repo / high-frequency campaign.
 * Returns null when below threshold (or fingerprint is empty).
 */
export function recordAndDetect(
	owner: string,
	fingerprint: string,
	repo: string,
	author: string,
): CampaignInfo | null {
	if (!fingerprint) return null;
	const key = owner.toLowerCase();
	let byFp = store.get(key);
	if (!byFp) {
		byFp = new Map();
		store.set(key, byFp);
	}

	const now = Date.now();
	let s = byFp.get(fingerprint);
	if (!s || now - s.lastSeen > WINDOW_MS) {
		s = {
			repos: new Set(),
			authors: new Set(),
			count: 0,
			firstSeen: now,
			lastSeen: now,
		};
		byFp.set(fingerprint, s);
	}
	s.repos.add(repo);
	if (author) s.authors.add(author);
	s.count += 1;
	s.lastSeen = now;

	const isCampaign =
		s.repos.size >= REPO_THRESHOLD || s.count >= COUNT_THRESHOLD;
	if (!isCampaign) return null;

	return {
		repoCount: s.repos.size,
		totalCount: s.count,
		authorCount: s.authors.size,
		repos: Array.from(s.repos).slice(0, 8),
	};
}

/** Score bump applied when a campaign is detected (capped, configurable). */
export const CAMPAIGN_SCORE_BUMP = Number(
	process.env.CAMPAIGN_SCORE_BUMP ?? 25,
);
