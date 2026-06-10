import { LRUCache } from "lru-cache";
import { getApp, type InstallationClient } from "./app.js";

// Short cache so dashboard refreshes don't burn the repo's REST rate limit.
const statsCache = new LRUCache<string, RepoSlopStats>({
	max: 500,
	ttl: 1000 * 30,
});

export interface SlopHistoryItem {
	number: number;
	title: string;
	url: string;
	kind: "pull_request" | "issue";
	state: string;
	author: string;
	labels: string[];
	createdAt: string;
	updatedAt: string;
}

export interface RepoSlopStats {
	repo: string;
	/** GitHub repo visibility; callers must not show private data to anonymous viewers. */
	private: boolean;
	quarantined: number;
	cleared: number;
	open: number;
	closed: number;
	items: SlopHistoryItem[];
}

/** Thrown when a private repo's stats are requested without authorization. */
export class PrivateRepoError extends Error {
	constructor() {
		super("repository is private");
		this.name = "PrivateRepoError";
	}
}

/** Resolve an installation-scoped client for a specific repo (GitHub-as-storage). */
export async function getRepoInstallationClient(
	owner: string,
	repo: string,
): Promise<InstallationClient> {
	const app = getApp();
	const { data } = await app.octokit.request(
		"GET /repos/{owner}/{repo}/installation",
		{ owner, repo },
	);
	return (await app.getInstallationOctokit(data.id)) as InstallationClient;
}

/**
 * Read slop history straight from GitHub (no DB): issues/PRs carrying the
 * quarantine or cleared labels. MVP storage = the repo itself.
 */
export async function getRepoSlopStats(
	owner: string,
	repo: string,
	quarantineLabel = process.env.DEFAULT_QUARANTINE_LABEL ?? "slop-quarantine",
	clearedLabel = "slop-cleared",
	/** Pass true ONLY when the viewer is the authenticated repo owner. */
	allowPrivate = false,
): Promise<RepoSlopStats> {
	const cacheKey = `${owner}/${repo}`;
	const cached = statsCache.get(cacheKey);
	if (cached) {
		// Visibility is enforced on every read, including cache hits, so an
		// authorized owner's earlier request can never warm the cache for an
		// anonymous viewer of a private repo.
		if (cached.private && !allowPrivate) throw new PrivateRepoError();
		return cached;
	}

	const octokit = await getRepoInstallationClient(owner, repo);
	// The installation token can read private repos the app is installed on, so
	// gate on actual repo visibility before returning anything.
	const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
	if (repoInfo.private && !allowPrivate) throw new PrivateRepoError();

	const collected = new Map<number, SlopHistoryItem>();
	for (const label of [quarantineLabel, clearedLabel]) {
		const res = await octokit.rest.issues.listForRepo({
			owner,
			repo,
			labels: label,
			state: "all",
			per_page: 100,
			sort: "updated",
			direction: "desc",
		});
		for (const it of res.data) {
			collected.set(it.number, {
				number: it.number,
				title: it.title,
				url: it.html_url,
				kind: it.pull_request ? "pull_request" : "issue",
				state: it.state,
				author: it.user?.login ?? "unknown",
				labels: it.labels.map((l) =>
					typeof l === "string" ? l : (l.name ?? ""),
				),
				createdAt: it.created_at,
				updatedAt: it.updated_at,
			});
		}
	}

	const items = Array.from(collected.values()).sort(
		(a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
	);

	const stats: RepoSlopStats = {
		repo: `${owner}/${repo}`,
		private: Boolean(repoInfo.private),
		quarantined: items.filter((i) => i.labels.includes(quarantineLabel)).length,
		cleared: items.filter((i) => i.labels.includes(clearedLabel)).length,
		open: items.filter((i) => i.state === "open").length,
		closed: items.filter((i) => i.state === "closed").length,
		items,
	};
	statsCache.set(cacheKey, stats);
	return stats;
}


// ── Org-wide aggregation (Team plan: dashboard + activity/audit log) ───────
export interface OwnerRepoStat {
	repo: string; // owner/repo
	quarantined: number;
	cleared: number;
}

export interface OwnerSlopStats {
	owner: string;
	/** installed repos actually scanned for this view */
	repoCount: number;
	quarantined: number;
	cleared: number;
	open: number;
	closed: number;
	/** per-repo breakdown, repos with activity first */
	repos: OwnerRepoStat[];
	/** recent activity across all repos (the audit/activity log) */
	recent: SlopHistoryItem[];
}

const ownerStatsCache = new LRUCache<string, OwnerSlopStats>({
	max: 200,
	ttl: 1000 * 30,
});

/** Resolve the installation client for an owner (user or org) by matching the
 * installation account login. Throws if SlopGuard is not installed there. */
async function getOwnerInstallationClient(
	owner: string,
): Promise<InstallationClient> {
	const app = getApp();
	// App-authenticated base client exposes .request (not .rest/.paginate).
	const res = await app.octokit.request("GET /app/installations", {
		per_page: 100,
	});
	const installs = res.data as Array<{
		id: number;
		account: { login?: string } | null;
	}>;
	const match = installs.find(
		(i) => (i.account?.login ?? "").toLowerCase() === owner.toLowerCase(),
	);
	if (!match) throw new Error(`SlopGuard is not installed on @${owner}`);
	return (await app.getInstallationOctokit(match.id)) as InstallationClient;
}

/**
 * Aggregate slop activity across every repo SlopGuard can see for an owner.
 * GitHub-as-storage (no DB): we list the installation's repos and tally the
 * quarantine/cleared labels. Bounded by `maxRepos` (the plan limit) and cached.
 */
export async function getOwnerSlopStats(
	owner: string,
	maxRepos = 50,
	quarantineLabel = process.env.DEFAULT_QUARANTINE_LABEL ?? "slop-quarantine",
	clearedLabel = "slop-cleared",
): Promise<OwnerSlopStats> {
	const key = owner.toLowerCase();
	const cached = ownerStatsCache.get(key);
	if (cached) return cached;

	const octokit = await getOwnerInstallationClient(owner);
	const repos = (await octokit.paginate(
		octokit.rest.apps.listReposAccessibleToInstallation,
		{ per_page: 100 },
	)) as Array<{ name: string; owner: { login?: string } | null }>;
	const limited = repos.slice(0, Math.max(1, maxRepos));

	const perRepo: OwnerRepoStat[] = [];
	const recent: SlopHistoryItem[] = [];
	let quarantined = 0;
	let cleared = 0;
	let open = 0;
	let closed = 0;

	for (const r of limited) {
		const rOwner = r.owner?.login ?? owner;
		const collected = new Map<number, SlopHistoryItem>();
		for (const label of [quarantineLabel, clearedLabel]) {
			try {
				const res = await octokit.rest.issues.listForRepo({
					owner: rOwner,
					repo: r.name,
					labels: label,
					state: "all",
					per_page: 100,
					sort: "updated",
					direction: "desc",
				});
				for (const it of res.data) {
					collected.set(it.number, {
						number: it.number,
						title: it.title,
						url: it.html_url,
						kind: it.pull_request ? "pull_request" : "issue",
						state: it.state,
						author: it.user?.login ?? "unknown",
						labels: it.labels.map((l) =>
							typeof l === "string" ? l : (l.name ?? ""),
						),
						createdAt: it.created_at,
						updatedAt: it.updated_at,
					});
				}
			} catch {
				// skip repos we cannot read; keep aggregating the rest
			}
		}
		const items = Array.from(collected.values());
		const q = items.filter((i) => i.labels.includes(quarantineLabel)).length;
		const c = items.filter((i) => i.labels.includes(clearedLabel)).length;
		if (q + c > 0) perRepo.push({ repo: `${rOwner}/${r.name}`, quarantined: q, cleared: c });
		quarantined += q;
		cleared += c;
		open += items.filter((i) => i.state === "open").length;
		closed += items.filter((i) => i.state === "closed").length;
		for (const it of items) recent.push(it);
	}

	perRepo.sort((a, b) => b.quarantined - a.quarantined);
	recent.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

	const stats: OwnerSlopStats = {
		owner,
		repoCount: limited.length,
		quarantined,
		cleared,
		open,
		closed,
		repos: perRepo,
		recent: recent.slice(0, 40),
	};
	ownerStatsCache.set(key, stats);
	return stats;
}

// ── Light repo list for the account "your repositories" view ──────────────
export interface OwnerRepo {
	fullName: string; // owner/repo
	name: string;
	private: boolean;
	htmlUrl: string;
}

/**
 * List every repo SlopGuard can see for an owner (names only, one paginated
 * call, no per-repo label tallies). Used by the account page so a signed-in
 * user can see their watched repos without going to GitHub. Throws if the app
 * is not installed for that owner.
 */
export async function listOwnerRepos(owner: string): Promise<OwnerRepo[]> {
	const octokit = await getOwnerInstallationClient(owner);
	const repos = (await octokit.paginate(
		octokit.rest.apps.listReposAccessibleToInstallation,
		{ per_page: 100 },
	)) as Array<{
		name: string;
		full_name?: string;
		private?: boolean;
		html_url?: string;
		owner: { login?: string } | null;
	}>;
	return repos.slice(0, 200).map((r) => {
		const full = r.full_name ?? `${r.owner?.login ?? owner}/${r.name}`;
		return {
			fullName: full,
			name: r.name,
			private: Boolean(r.private),
			htmlUrl: r.html_url ?? `https://github.com/${full}`,
		};
	});
}
