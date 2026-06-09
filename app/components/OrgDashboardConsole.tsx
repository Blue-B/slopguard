"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import { riskBg, riskColor, toneColor } from "./console-styles";
import type { SidebarItem } from "./ConsoleSidebar";

type DashboardResponse =
	| {
			installed: true;
			owner: string;
			repoCount: number;
			quarantined: number;
			cleared: number;
			open: number;
			closed: number;
			recent: Array<{
				number: number;
				title: string;
				url: string;
				kind: "issue" | "pull_request";
				state: "open" | "closed";
				author: string;
				labels: string[];
				createdAt: string;
				updatedAt: string;
			}>;
			repos: Array<{ repo: string; quarantined: number; cleared: number }>;
			radar: Array<{
				name: string;
				fingerprint: string;
				repos: number;
				risk: "low" | "medium" | "high";
				commits: number;
				authors: number;
				delta: number;
			}>;
			trend?: Array<{ date: string; quarantined: number; cleared: number }>;
	  }
	| { installed: false; owner: string; reason: string };

export type OrgDashboardConsoleCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	emptyTitle: string;
	emptyBody: string;
	emptyCta: string;
	emptyCtaHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
	queueTitle: string;
	queueSubtitle: string;
	queueViewAll: string;
	queueViewAllHref: string;
	queueColumns: { item: string; repo: string; score: string; status: string; age: string };
	reposTitle: string;
	reposSubtitle: string;
	reposViewAll: string;
	reposViewAllHref: string;
	campaignTitle: string;
	campaignSubtitle: string;
	campaignsEmpty: string;
	campaignHref: string;
	campaignCta: string;
	alertsTitle: string;
	alertsBody: string;
	alertsHref: string;
	alertsCta: string;
	policyTitle: string;
	policyBody: string;
	policyViewAll: string;
	policyViewAllHref: string;
	metricLabels: { open: string; repos: string; score: string; policy: string };
	statusLabels: Record<"quarantined" | "cleared" | "watching", string>;
	emptyQueue: string;
	emptyRepos: string;
	policyReadout: string;
	trendTitle: string;
	trendEmpty: string;
};

type OrgQueueStatus = "quarantined" | "cleared" | "watching";

function deriveStatus(labels: string[]): OrgQueueStatus {
	if (labels.some((l) => l.toLowerCase().includes("quarantine"))) return "quarantined";
	if (labels.some((l) => l.toLowerCase().includes("cleared"))) return "cleared";
	return "watching";
}
function deriveScore(labels: string[]): number {
	const l = labels.map((x) => x.toLowerCase()).join(" ");
	if (l.includes("quarantine")) return 78;
	if (l.includes("cleared")) return 24;
	return 46;
}
function formatAge(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const m = Math.floor(ms / 60000);
	if (m < 1) return "now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	return `${Math.floor(h / 24)}d`;
}
function extractRepo(url: string): string {
	const m =
		url.match(/repos\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/\d+/) ??
		url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/\d+/);
	return m ? `${m[1]}/${m[2]}` : "-";
}

const statusTone: Record<OrgQueueStatus, "low" | "medium" | "high"> = {
	quarantined: "high",
	cleared: "low",
	watching: "medium",
};
export default function OrgDashboardConsole({ copy }: { copy: OrgDashboardConsoleCopy }) {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/team/dashboard", { cache: "no-store" });
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as DashboardResponse);
			} catch (e) {
				setError(e instanceof Error ? e.message : "load failed");
			}
		})();
	}, []);

	const isLoading = data === null && error === null;
	const notInstalled = data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;

	const queue = useMemo(() => {
		if (!live) return [];
		return live.recent.slice(0, 5).map((it) => ({
			key: `${it.url}#${it.number}`,
			item: it.title,
			repo: extractRepo(it.url),
			score: deriveScore(it.labels),
			status: deriveStatus(it.labels),
			age: formatAge(it.updatedAt),
			href: it.url.replace("api.github.com", "github.com").replace(/\/repos\//, "/"),
		}));
	}, [live]);

	const reposRows = (live?.repos ?? []).slice(0, 5);
	const campaigns = live?.radar.slice(0, 3) ?? [];
	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
	const avgScore = live?.recent.length
		? Math.round(live.recent.reduce((s, it) => s + deriveScore(it.labels), 0) / live.recent.length)
		: 0;
	const ml = copy.metricLabels;

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-command.png"
				imageAlt="Organization command overview"
				plateLabel="organization command"
				connected={copy.connected}
				metrics={[
					{ label: ml.open, value: live ? live.open : "-", tone: live && live.open > 0 ? "warn" : "ok" },
					{ label: ml.repos, value: live ? covered : "-", tone: "ok" },
					{ label: ml.score, value: live ? avgScore : "-", tone: avgScore >= 60 ? "warn" : "ok" },
					{ label: ml.policy, value: live ? `${pct}%` : "-", tone: "neutral" },
				]}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && <ConsoleStatus danger>{error}</ConsoleStatus>}
			{notInstalled && (
				<div className="plate console-empty">
					<h2>{copy.emptyTitle}</h2>
					<p>{copy.emptyBody}</p>
					<Link href={copy.emptyCtaHref} className="btn btn-primary btn-sm">
						{copy.emptyCta}
					</Link>
				</div>
			)}

			{!isLoading && !notInstalled && (
				<section className="console-section">
					<div className="plate console-overview">
						<div className="console-overview-main">
							<ConsoleSectionHead title={copy.queueTitle} sub={copy.queueSubtitle} />
							<div className="console-mini-table">
								<div className="console-mini-th">
									<span>{copy.queueColumns.item}</span>
									<span>{copy.queueColumns.status}</span>
									<span style={{ textAlign: "right" }}>{copy.queueColumns.age}</span>
								</div>
								{queue.length === 0 ? (
									<div className="console-empty-line">{copy.emptyQueue}</div>
								) : (
									queue.map((row) => (
										<div className="console-mini-tr" key={row.key}>
											<Link href={row.href} target="_blank" rel="noreferrer">
												<b>{row.item}</b>
												<small>{row.repo}</small>
											</Link>
											<span className="console-pill" style={{ color: riskColor[statusTone[row.status]], background: riskBg[statusTone[row.status]] }}>
												{copy.statusLabels[row.status]}
											</span>
											<em>{row.age}</em>
										</div>
									))
								)}
							</div>
						</div>

						<aside className="console-overview-rail">
							<div className="console-rail-block">
								<header className="console-block-head"><h3>{copy.reposTitle}</h3></header>
								{reposRows.length === 0 ? (
									<div className="console-empty-line">{copy.emptyRepos}</div>
								) : (
									reposRows.map((row) => (
										<div className="console-rail-row" key={row.repo}>
											<span>{row.repo}</span>
											<b style={{ color: "var(--danger)" }}>{row.quarantined}</b>
											<em style={{ color: "var(--green)" }}>{row.cleared}</em>
										</div>
									))
								)}
							</div>

							<div className="console-rail-block">
								<header className="console-block-head">
									<h3>{copy.campaignTitle}</h3>
									<span className="tier-chip">PRO</span>
									<Link href={copy.campaignHref} className="console-block-link">
										{copy.campaignCta} <span aria-hidden="true">→</span>
									</Link>
								</header>
								{campaigns.length === 0 ? (
									<div className="console-empty-line">{copy.campaignsEmpty}</div>
								) : (
									campaigns.map((c) => (
										<div className="console-rail-row campaign" key={c.name}>
											<span>{c.fingerprint}</span>
											<b className="console-pill" style={{ color: riskColor[c.risk], background: riskBg[c.risk] }}>{c.risk}</b>
										</div>
									))
								)}
							</div>

							<div className="console-rail-block">
								<header className="console-block-head">
									<h3>{copy.alertsTitle}</h3>
									<span className="tier-chip">TEAM</span>
									<Link href={copy.alertsHref} className="console-block-link">
										{copy.alertsCta} <span aria-hidden="true">→</span>
									</Link>
								</header>
								<p className="console-block-sub">{copy.alertsBody}</p>
							</div>

							<div className="console-rail-block">
								<header className="console-block-head"><h3>{copy.policyTitle}</h3></header>
								<div className="console-policy-readout">
									<b style={{ color: toneColor.ok }}>{pct}%</b>
									<span>{copy.policyReadout}</span>
								</div>
							</div>

							<div className="console-rail-block">
								<header className="console-block-head"><h3>{copy.trendTitle}</h3></header>
								{(() => {
									const trend = live?.trend ?? [];
									const max = Math.max(1, ...trend.map((d) => d.quarantined));
									const any = trend.some((d) => d.quarantined > 0 || d.cleared > 0);
									if (!any)
										return (
											<div className="console-empty-line">{copy.trendEmpty}</div>
										);
									return (
										<div className="trend-strip" aria-hidden="true">
											{trend.map((d) => (
												<span
													key={d.date}
													className="trend-bar"
													title={`${d.date}: ${d.quarantined} quarantined, ${d.cleared} cleared`}
													style={{ height: `${Math.round((d.quarantined / max) * 100)}%` }}
											/>
											))}
										</div>
									);
								})()}
							</div>
						</aside>
					</div>
				</section>
			)}
		</ConsoleShell>
	);
}
