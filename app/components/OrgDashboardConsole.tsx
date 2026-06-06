"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toneColor, riskBg, riskColor } from "./console-styles";
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
	  }
	| { installed: false; owner: string; reason: string };

export type OrgDashboardConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
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
	queueColumns: {
		item: string;
		repo: string;
		score: string;
		status: string;
		age: string;
	};
	reposTitle: string;
	reposSubtitle: string;
	reposViewAll: string;
	reposViewAllHref: string;
	reposColumns: { repo: string; quarantined: string; cleared: string };
	campaignTitle: string;
	campaignSubtitle: string;
	campaignsEmpty: string;
	policyTitle: string;
	policyBody: string;
	policyViewAll: string;
	policyViewAllHref: string;
};

type OrgQueueStatus = "quarantined" | "cleared" | "watching";

function deriveStatus(labels: string[]): OrgQueueStatus {
	if (labels.some((l) => l.toLowerCase().includes("quarantine")))
		return "quarantined";
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

export default function OrgDashboardConsole({
	copy,
}: {
	copy: OrgDashboardConsoleCopy;
}) {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const pathname = usePathname() ?? "";

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
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;
	const isKo = copy.nav.some((item) => item.href.startsWith("/ko/"));
	const labels = isKo
		? {
				status: { quarantined: "격리됨", cleared: "정상화", watching: "관찰 중" } satisfies Record<OrgQueueStatus, string>,
				emptyQueue: "최근 30일 안에 처리할 항목이 없습니다.",
				emptyRepos: "아직 활동이 있는 레포가 없습니다.",
				campaignCta: "캠페인 열기",
				policyReadout: (coveredCount: number, totalCount: number) =>
					`설치 레포 ${totalCount}개 중 ${coveredCount}개에서 정책 신호가 동작 중`,
			}
		: {
				status: { quarantined: "Quarantined", cleared: "Cleared", watching: "Watching" } satisfies Record<OrgQueueStatus, string>,
				emptyQueue: "No items in the last 30 days.",
				emptyRepos: "No repos with activity yet.",
				campaignCta: "Open campaigns",
				policyReadout: (coveredCount: number, totalCount: number) =>
					`Enforcing on ${coveredCount} of ${totalCount} installed repos`,
			};

	const queue = useMemo(() => {
		if (!live) return [];
		return live.recent.slice(0, 5).map((it) => ({
			key: `${it.url}#${it.number}`,
			item: it.title,
			repo: extractRepo(it.url),
			score: deriveScore(it.labels),
			status: deriveStatus(it.labels),
			age: formatAge(it.updatedAt),
			href: it.url
				.replace("api.github.com", "github.com")
				.replace(/\/repos\//, "/"),
		}));
	}, [live]);

	const reposRows = (live?.repos ?? []).slice(0, 5);
	const campaigns = live?.radar.slice(0, 3) ?? [];
	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

	const avgScore = live?.recent.length
		? Math.round(
				live.recent.reduce((s, it) => s + deriveScore(it.labels), 0) /
					live.recent.length,
			)
		: 0;

	const metrics = [
		{
			label: "Open reviews",
			value: live ? String(live.open) : "-",
			tone: live && live.open > 0 ? "warn" : "ok",
		},
		{
			label: "Protected repos",
			value: live ? String(covered) : "-",
			tone: "ok",
		},
		{
			label: "Avg score",
			value: live ? String(avgScore) : "-",
			tone: avgScore >= 60 ? "warn" : "ok",
		},
		{ label: "Policy", value: live ? `${pct}%` : "-", tone: "neutral" },
	] as const;

	const campaignHref =
		copy.nav.find((item) => item.href.includes("/campaigns"))?.href ??
		"/campaigns";
	const activeBase = copy.nav.reduce<string | null>((best, item) => {
		const base = item.href.split("#")[0];
		const match = pathname === base || pathname.startsWith(`${base}/`);
		if (!match) return best;
		return !best || base.length > best.length ? base : best;
	}, null);

	return (
		<main className="org-experience">
			<div className="grid-bg" aria-hidden="true" />
			<div className="wide org-wide">
				<nav className="org-console-nav" aria-label="Team console sections">
					<div>
						<span className="org-nav-kicker mono">SlopGuard Team</span>
						<strong>{copy.workspace}</strong>
					</div>
					<div className="org-nav-links">
						{copy.nav.map((item) => {
							const base = item.href.split("#")[0];
							const active = activeBase === base;
							return (
								<Link
									key={item.label}
									href={item.href}
									className={active ? "active" : ""}
								>
									{item.label}
									{item.external ? <span>↗</span> : null}
								</Link>
							);
						})}
					</div>
				</nav>

				<header className="org-hero-redesign">
					<div className="org-hero-copy">
						<div className="eyebrow mono">{copy.heroEyebrow}</div>
						<h1>{copy.heroTitle}</h1>
						<p>{copy.heroBody}</p>
						<div className="hero-actions">
							<Link href={copy.heroCtaHref} className="btn btn-primary btn-lg">
								{copy.heroCta}
							</Link>
							<Link href={copy.queueViewAllHref} className="text-link">
								{copy.queueViewAll}
								<span>→</span>
							</Link>
						</div>
						<ul className="hero-spec org-spec">
							{metrics.map((m) => (
								<li key={m.label}>
									<span>{m.label}</span>
									<b style={{ color: toneColor[m.tone] }}>{m.value}</b>
								</li>
							))}
						</ul>
					</div>
					<figure className="plate org-hero-plate">
						<figcaption className="plate-bar">
							<span>organization command</span>
							<span className="plate-coord">{copy.connected}</span>
						</figcaption>
						<div className="plate-art">
							<Image
								src="/org-wave-command.png"
								alt="Organization repository protection wave"
								width={1568}
								height={882}
								priority
							/>
							<span className="plate-scan" aria-hidden="true" />
						</div>
					</figure>
				</header>

				{isLoading && <StatusPlate>{copy.loading}</StatusPlate>}
				{error && <StatusPlate danger>{error}</StatusPlate>}
				{notInstalled && (
					<section className="plate org-empty">
						<h2>{copy.emptyTitle}</h2>
						<p>{copy.emptyBody}</p>
						<Link href={copy.emptyCtaHref} className="btn btn-primary btn-sm">
							{copy.emptyCta}
						</Link>
					</section>
				)}

				{!isLoading && !notInstalled && (
					<>
						<section className="org-live-grid section">
							<div className="org-main-feed">
								<SectionHeader
									title={copy.queueTitle}
									sub={copy.queueSubtitle}
									href={copy.queueViewAllHref}
									cta={copy.queueViewAll}
								/>
								<div className="plate org-review-plate">
									<div className="org-table-head mono">
										<span>{copy.queueColumns.item}</span>
										<span>{copy.queueColumns.repo}</span>
										<span>{copy.queueColumns.score}</span>
										<span>{copy.queueColumns.status}</span>
										<span>{copy.queueColumns.age}</span>
									</div>
									{queue.length === 0 ? (
										<EmptyLine>{labels.emptyQueue}</EmptyLine>
									) : (
										queue.map((row) => (
											<div className="org-table-row" key={row.key}>
												<Link href={row.href} target="_blank" rel="noreferrer">
													{row.item}
												</Link>
												<span>{row.repo}</span>
												<b>{row.score}</b>
												<span>{labels.status[row.status]}</span>
												<span>{row.age}</span>
											</div>
										))
									)}
								</div>
							</div>

							<aside className="org-side-stack">
								<MiniPanel
									title={copy.reposTitle}
									sub={copy.reposSubtitle}
									href={copy.reposViewAllHref}
									cta={copy.reposViewAll}
								>
									{reposRows.length === 0 ? (
										<EmptyLine>{labels.emptyRepos}</EmptyLine>
									) : (
										reposRows.map((row) => (
											<div className="org-mini-row" key={row.repo}>
												<span>{row.repo}</span>
												<b>{row.quarantined}</b>
												<em>{row.cleared}</em>
											</div>
										))
									)}
								</MiniPanel>
								<MiniPanel
									title={copy.campaignTitle}
									sub={copy.campaignSubtitle}
									href={campaignHref}
									cta={labels.campaignCta}
								>
									{campaigns.length === 0 ? (
										<EmptyLine>{copy.campaignsEmpty}</EmptyLine>
									) : (
										campaigns.map((c) => (
											<div className="org-campaign-row" key={c.name}>
												<span>{c.fingerprint}</span>
												<b
													style={{
														color: riskColor[c.risk],
														background: riskBg[c.risk],
													}}
												>
													{c.risk}
												</b>
											</div>
										))
									)}
								</MiniPanel>
								<MiniPanel
									title={copy.policyTitle}
									sub={copy.policyBody}
									href={copy.policyViewAllHref}
									cta={copy.policyViewAll}
								>
									<div className="org-policy-readout">
										<b>{pct}%</b>
										<span>{labels.policyReadout(covered, total)}</span>
									</div>
								</MiniPanel>
							</aside>
						</section>

					</>
				)}
			</div>
		</main>
	);
}

function StatusPlate({
	children,
	danger = false,
}: {
	children: React.ReactNode;
	danger?: boolean;
}) {
	return (
		<div className={danger ? "plate org-status danger" : "plate org-status"}>
			{children}
		</div>
	);
}

function SectionHeader({
	title,
	sub,
	href,
	cta,
}: {
	title: string;
	sub: string;
	href: string;
	cta: string;
}) {
	return (
		<header className="org-section-head">
			<div>
				<h2>{title}</h2>
				<p>{sub}</p>
			</div>
			<Link href={href}>
				{cta}
				<span>→</span>
			</Link>
		</header>
	);
}

function MiniPanel({
	title,
	sub,
	href,
	cta,
	children,
}: {
	title: string;
	sub: string;
	href: string;
	cta: string;
	children: React.ReactNode;
}) {
	return (
		<section className="plate org-mini-panel">
			<SectionHeader title={title} sub={sub} href={href} cta={cta} />
			<div>{children}</div>
		</section>
	);
}

function EmptyLine({ children }: { children: React.ReactNode }) {
	return <div className="org-empty-line mono">{children}</div>;
}
