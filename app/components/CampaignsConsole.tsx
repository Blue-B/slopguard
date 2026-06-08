"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";
import { riskBg, riskColor } from "./console-styles";

type Cluster = {
	id: string;
	fingerprint: string;
	repoCount: number;
	hits: number;
	authorCount: number;
	firstSeen: string;
	risk: "low" | "medium" | "high";
	repos: string[];
	authors: string[];
	commits: Array<{ repo: string; sha: string; title: string; author: string; when: string }>;
};

type ListResponse =
	| { installed: true; owner: string; repoCount: number; clusters: Cluster[] }
	| { installed: false; owner: string; reason: string };

export type CampaignsConsoleCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	detailBase: string;
	loading: string;
	emptyTitle: string;
	emptyBody: string;
	emptyCta: string;
	emptyCtaHref: string;
	investigate: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	metricLabels: { clusters: string; hits: string; authors: string; repos: string };
	clustersTitle: string;
	leadTitle: string;
	clustersSubtitle: string;
	clustersEmpty: string;
	leadSummary: string;
	firstSeen: string;
	streamCols: { fingerprint: string; scope: string; risk: string };
};

const GRID = "minmax(0,1fr) 150px 70px 116px";

export default function CampaignsConsole({ copy }: { copy: CampaignsConsoleCopy }) {
	const [data, setData] = useState<ListResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		try {
			const res = await fetch("/api/campaigns", { cache: "no-store" });
			if (!res.ok) {
				if (res.status === 401 || res.status === 403) {
					setData(null);
					setError(null);
					return;
				}
				setError(`HTTP ${res.status}`);
				return;
			}
			setData((await res.json()) as ListResponse);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load campaigns");
		}
	}

	useEffect(() => {
		load();
		const t = setInterval(load, 30_000);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isLoading = data === null && error === null;
	const notInstalled = data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;
	const highCount = live?.clusters.filter((c) => c.risk === "high").length ?? 0;
	const totalHits = live?.clusters.reduce((s, c) => s + c.hits, 0) ?? 0;
	const authorCount = live ? new Set(live.clusters.flatMap((c) => c.authors)).size : 0;
	const lead = live?.clusters[0] ?? null;
	const ml = copy.metricLabels;

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-radar.png"
				imageAlt="Campaign spread radar"
				plateLabel="pattern radar"
				connected={copy.connected}
				metrics={[
					{ label: ml.clusters, value: live ? live.clusters.length : "-", tone: highCount > 0 ? "danger" : "neutral" },
					{ label: ml.hits, value: live ? totalHits : "-", tone: "ok" },
					{ label: ml.authors, value: live ? authorCount : "-", tone: "neutral" },
					{ label: ml.repos, value: live ? live.repoCount : "-", tone: "ok" },
				]}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && !isLoading && <ConsoleStatus danger>Failed to load: {error}</ConsoleStatus>}
			{notInstalled && (
				<div className="plate console-empty">
					<h2>{copy.emptyTitle}</h2>
					<p>{copy.emptyBody}</p>
					<Link href={copy.emptyCtaHref} className="btn btn-primary btn-sm">
						{copy.emptyCta}
					</Link>
				</div>
			)}

			{live && (
				<section className="console-section console-grid">
					<div className="plate console-table">
						<ConsoleSectionHead title={copy.clustersTitle} sub={copy.clustersSubtitle} />
						<div className="console-th" style={{ gridTemplateColumns: GRID }}>
							<span>{copy.streamCols.fingerprint}</span>
							<span>{copy.streamCols.scope}</span>
							<span>{copy.streamCols.risk}</span>
							<span />
						</div>
						{live.clusters.length === 0 ? (
							<div className="console-empty-line">{copy.clustersEmpty}</div>
						) : (
							live.clusters.map((cluster) => (
								<div className="console-tr" key={cluster.id} style={{ gridTemplateColumns: GRID }}>
									<div style={{ minWidth: 0 }}>
										<b style={{ display: "block", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
											{cluster.fingerprint}
										</b>
										<small style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>{cluster.firstSeen}</small>
									</div>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
										{cluster.hits} / {cluster.repoCount}
									</span>
									<span className="console-pill" style={{ color: riskColor[cluster.risk], background: riskBg[cluster.risk] }}>
										{cluster.risk}
									</span>
									<Link href={`${copy.detailBase}/${cluster.id}`} prefetch={false} style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)", justifySelf: "end" }}>
										{copy.investigate} <span aria-hidden="true">→</span>
									</Link>
								</div>
							))
						)}
					</div>

					<aside className="console-side-stack">
						<div className="plate console-panel">
							<ConsoleSectionHead title={copy.leadTitle} />
							{lead ? (
								<article>
									<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
										<span className="console-pill" style={{ color: riskColor[lead.risk], background: riskBg[lead.risk] }}>
											{lead.risk}
										</span>
										<em style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, fontStyle: "normal" }}>
											{copy.firstSeen} {lead.firstSeen}
										</em>
									</div>
									<h3 style={{ margin: "0 0 8px", fontSize: 18, letterSpacing: "-0.03em" }}>{lead.fingerprint}</h3>
									<p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
										{copy.leadSummary
											.replace("{hits}", String(lead.hits))
											.replace("{repos}", String(lead.repoCount))
											.replace("{authors}", String(lead.authorCount))}
									</p>
									<Link href={`${copy.detailBase}/${lead.id}`} className="btn btn-primary btn-sm" prefetch={false}>
										{copy.investigate}
									</Link>
								</article>
							) : (
								<div className="console-empty-line">{copy.clustersEmpty}</div>
							)}
						</div>
					</aside>
				</section>
			)}
		</ConsoleShell>
	);
}
