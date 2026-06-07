// Shared cross-repo "campaign" cluster computation, derived ONLY from the
// owner's real GitHub activity (no sample/marketing data). Used by both the
// campaigns list and the drill-down detail so they always agree.
import { getOwnerSlopStats } from "@/lib/github/storage";

export interface ClusterCommit {
	repo: string;
	sha: string;
	title: string;
	author: string;
	when: string;
}

export interface Cluster {
	id: string;
	fingerprint: string;
	repoCount: number;
	hits: number;
	authorCount: number;
	firstSeen: string;
	risk: "low" | "medium" | "high";
	repos: string[];
	authors: string[];
	commits: ClusterCommit[];
}

export interface OwnerClusters {
	owner: string;
	repoCount: number;
	clusters: Cluster[];
}

/** Stable slug id for a cluster, derived from its fingerprint (commit title). */
export function clusterId(fingerprint: string): string {
	return fingerprint
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 64);
}

/** Compute campaign clusters from the owner's real slop activity. */
export async function computeOwnerClusters(
	owner: string,
	maxRepos: number,
): Promise<OwnerClusters> {
	const stats = await getOwnerSlopStats(owner, maxRepos);

	const groups = new Map<
		string,
		{
			fingerprint: string;
			repoSet: Set<string>;
			authorSet: Set<string>;
			items: ClusterCommit[];
		}
	>();

	for (const it of stats.recent) {
		const m =
			it.url.match(/repos\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/(\d+)/) ??
			it.url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/);
		const repo = m ? `${m[1]}/${m[2]}` : "unknown/repo";
		const num = m ? m[3] : String(it.number);
		const title = it.title || "(untitled)";
		const prefix = (title.split(/[:\s]/)[0] || "other").toLowerCase();
		const key = `${prefix}:${repo}`;
		const commit: ClusterCommit = {
			repo,
			sha: num,
			title,
			author: it.author,
			when: it.updatedAt,
		};
		const existing = groups.get(key);
		if (existing) {
			existing.repoSet.add(repo);
			existing.authorSet.add(it.author);
			existing.items.push(commit);
		} else {
			groups.set(key, {
				fingerprint: title,
				repoSet: new Set([repo]),
				authorSet: new Set([it.author]),
				items: [commit],
			});
		}
	}

	const clusters: Cluster[] = Array.from(groups.values())
		.filter((g) => g.items.length >= 1 && g.repoSet.size >= 1)
		.map((g) => {
			const repoCount = g.repoSet.size;
			const hits = g.items.length;
			const firstSeen = g.items
				.map((i) => i.when)
				.sort()[0]
				.slice(0, 10);
			const risk: "low" | "medium" | "high" =
				hits >= 5 || repoCount >= 3
					? "high"
					: hits >= 2 || repoCount >= 2
						? "medium"
						: "low";
			return {
				id: clusterId(g.fingerprint),
				fingerprint: g.fingerprint,
				repoCount,
				hits,
				authorCount: g.authorSet.size,
				firstSeen,
				risk,
				repos: Array.from(g.repoSet),
				authors: Array.from(g.authorSet).map((a) => `@${a}`),
				commits: g.items.slice(0, 5).map((i) => ({
					repo: i.repo,
					sha: i.sha,
					title: i.title,
					author: `@${i.author}`,
					when: i.when.slice(0, 10),
				})),
			};
		})
		.sort((a, b) => b.hits * b.repoCount - a.hits * a.repoCount)
		.slice(0, 8);

	return { owner: stats.owner, repoCount: stats.repoCount, clusters };
}
