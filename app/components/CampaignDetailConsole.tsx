"use client";

import { useEffect, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";

type Detail = {
	id: string;
	fingerprint: string;
	repoCount: number;
	totalCount: number;
	authorCount: number;
	firstSeen: string;
	repos: string[];
	authors: string[];
	commits: Array<{ repo: string; sha: string; title: string; author: string; when: string }>;
	repoImpact: Array<{ repo: string; quarantined: number; cleared: number }>;
};

export type CampaignDetailCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	error: string;
	heading: string;
	subhead: string;
	metrics: { repos: string; hits: string; authors: string; firstSeen: string };
	commitsTitle: string;
	impactTitle: string;
	commitMeta: string;
	emptyCommits: string;
	impactSubhead: string;
	authorsLabel: string;
};

const CGRID = "minmax(0,1fr) 120px 74px 100px";

export default function CampaignDetailConsole({ id, copy }: { id: string; copy: CampaignDetailCopy }) {
	const [data, setData] = useState<Detail | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`, { cache: "no-store" });
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as Detail);
				setError(null);
			} catch (e) {
				setError(e instanceof Error ? e.message : copy.error);
			}
		})();
	}, [copy.error, id]);

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={data?.fingerprint ?? id.replaceAll("_", " ")}
				eyebrow={copy.heading}
				body={copy.subhead}
				image="/console-radar.png"
				imageAlt="Pattern investigation"
				plateLabel="pattern investigation"
				connected={copy.connected}
				metrics={[
					{ label: copy.metrics.repos, value: data?.repoCount ?? "-", tone: "ok" },
					{ label: copy.metrics.hits, value: data?.totalCount ?? "-", tone: "danger" },
					{ label: copy.metrics.authors, value: data?.authorCount ?? "-", tone: "neutral" },
					{ label: copy.metrics.firstSeen, value: data?.firstSeen ?? "-", tone: "neutral" },
				]}
			/>

			{!data && !error && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && (
				<ConsoleStatus danger>
					{copy.error}: {error}
				</ConsoleStatus>
			)}

			{data && (
				<section className="console-section console-grid">
					<div className="plate console-table">
						<ConsoleSectionHead
							title={copy.commitsTitle}
							sub={copy.commitMeta.replace("{count}", String(data.commits.length))}
						/>
						{data.commits.length === 0 ? (
							<div className="console-empty-line">{copy.emptyCommits}</div>
						) : (
							data.commits.map((commit) => (
								<div className="console-tr" key={`${commit.repo}-${commit.sha}`} style={{ gridTemplateColumns: CGRID }}>
									<div style={{ minWidth: 0 }}>
										<b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{commit.title}</b>
										<small style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>{commit.repo}</small>
									</div>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{commit.author}</span>
									<span className="console-pill" style={{ color: "var(--green)", background: "rgba(63,185,80,0.1)" }}>{commit.sha.slice(0, 7)}</span>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{commit.when}</span>
								</div>
							))
						)}
					</div>

					<aside className="console-side-stack">
						<div className="plate console-panel">
							<ConsoleSectionHead title={copy.impactTitle} sub={copy.impactSubhead} />
							{data.repoImpact.map((repo) => (
								<div key={repo.repo} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "12px 0", borderTop: "1px solid var(--border-muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
									<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repo.repo}</span>
									<b style={{ color: "var(--danger)" }}>{repo.quarantined}</b>
									<em style={{ color: "var(--green)", fontStyle: "normal" }}>{repo.cleared}</em>
								</div>
							))}
							<div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
								<span>{copy.authorsLabel}</span>
								<strong style={{ display: "block", marginTop: 6, color: "var(--fg)", fontWeight: 600, wordBreak: "break-word" }}>
									{data.authors.length ? data.authors.join(", ") : "-"}
								</strong>
							</div>
						</div>
					</aside>
				</section>
			)}
		</ConsoleShell>
	);
}
