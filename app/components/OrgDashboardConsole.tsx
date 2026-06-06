"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import {
	content,
	frame,
	heroSurface,
	lineSection,
	muted,
	riskBg,
	riskColor,
	shell,
	toneColor,
} from "./console-styles";

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

function deriveStatus(labels: string[]): string {
	if (labels.some((l) => l.toLowerCase().includes("quarantine")))
		return "Quarantined";
	if (labels.some((l) => l.toLowerCase().includes("cleared"))) return "Cleared";
	return "Watching";
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

const tableHeader: React.CSSProperties = {
	color: "#6f7a86",
	fontSize: 10,
	letterSpacing: ".14em",
	textTransform: "uppercase",
	fontFamily: "var(--mono)",
};

export default function OrgDashboardConsole({
	copy,
}: {
	copy: OrgDashboardConsoleCopy;
}) {
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
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;
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
			href: it.url
				.replace("api.github.com", "github.com")
				.replace(/\/repos\//, "/"),
		}));
	}, [live]);

	const reposRows = (live?.repos ?? []).slice(0, 5);
	const campaigns = live?.radar.slice(0, 3) ?? [];
	const campaignHref =
		copy.nav.find((item) => /campaign|캠페인/i.test(item.label))?.href ??
		"/campaigns";

	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

	const metrics = useMemo(() => {
		if (!live) {
			return [
				{ label: "Open reviews", value: "-", detail: "loading", tone: "neutral" as const },
				{ label: "Protected repos", value: "-", detail: "loading", tone: "neutral" as const },
				{ label: "Avg. slop score", value: "-", detail: "loading", tone: "neutral" as const },
				{ label: "Active clusters", value: "-", detail: "loading", tone: "neutral" as const },
			];
		}
		const avgScore =
			live.recent.length > 0
				? Math.round(
						live.recent.reduce((s, it) => s + deriveScore(it.labels), 0) /
							live.recent.length,
					)
				: 0;
		return [
			{
				label: "Open reviews",
				value: String(live.open),
				detail: `${live.open} need owner action`,
				tone: live.open > 0 ? ("warn" as const) : ("ok" as const),
			},
			{
				label: "Protected repos",
				value: String(covered),
				detail: `${total} installed`,
				tone: "ok" as const,
			},
			{
				label: "Avg. slop score",
				value: String(avgScore),
				detail: `${live.quarantined} quarantined / ${live.cleared} cleared`,
				tone: avgScore >= 60 ? ("warn" as const) : ("ok" as const),
			},
			{
				label: "Active clusters",
				value: String(campaigns.length),
				detail: `${campaigns.filter((c) => c.risk === "high").length} high confidence`,
				tone:
					campaigns.filter((c) => c.risk === "high").length > 0
						? ("danger" as const)
						: ("neutral" as const),
			},
		];
	}, [live, campaigns.length, covered, total]);

	return (
		<main style={shell}>
			<section style={frame}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "280px minmax(0, 1fr)",
						minHeight: 780,
					}}
				>
					<ConsoleSidebar
						workspace={copy.workspace}
						workspaceSub={copy.workspaceSub}
						user={copy.user}
						entitlement={copy.entitlement}
						connected={copy.connected}
						nav={copy.nav}
					/>

					<section style={content}>
						<header
							style={{
								...heroSurface,
								display: "grid",
								gridTemplateColumns: "minmax(0, 1.08fr) minmax(360px, .92fr)",
								minHeight: 286,
							}}
						>
							<div style={{ padding: "32px 34px 30px", position: "relative", zIndex: 2 }}>
								<div
									style={{
										color: "#3fb950",
										fontSize: 10,
										letterSpacing: ".18em",
										textTransform: "uppercase",
										fontFamily: "var(--mono)",
										marginBottom: 14,
									}}
								>
									{copy.heroEyebrow}
								</div>
								<h1
									style={{
										margin: 0,
										fontSize: "clamp(34px, 4.1vw, 58px)",
										letterSpacing: "-.06em",
										fontWeight: 850,
										lineHeight: .94,
										maxWidth: 760,
									}}
								>
									{copy.heroTitle}
								</h1>
								<p
									style={{
										color: "#a6b0bc",
										margin: "18px 0 22px",
										maxWidth: 640,
										fontSize: 14,
										lineHeight: 1.55,
									}}
								>
									{copy.heroBody}
								</p>
								<Link href={copy.heroCtaHref} className="btn btn-primary btn-sm">
									{copy.heroCta}
								</Link>
							</div>
							<div style={{ position: "relative", minHeight: 260 }}>
								<Image
									src="/paid-command-mesh.png"
									alt="Repository protection command mesh"
									fill
									priority
									style={{ objectFit: "cover", opacity: .74 }}
									sizes="(max-width: 1280px) 100vw, 620px"
								/>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background:
											"linear-gradient(90deg, rgba(11,17,25,.98) 0%, rgba(11,17,25,.22) 44%, rgba(11,17,25,.82) 100%)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										right: 22,
										bottom: 20,
										left: 28,
										display: "grid",
										gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
										gap: 0,
										borderTop: "1px solid rgba(255,255,255,.14)",
									}}
								>
									{[
										["Queue", live ? String(live.open) : "-"],
										["Repos", live ? String(covered) : "-"],
										["Policy", `${pct}%`],
									].map(([label, value], i) => (
										<div
											key={label}
											style={{
												padding: "13px 14px 0",
												borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.12)",
											}}
										>
											<div style={{ ...muted, fontSize: 10, fontFamily: "var(--mono)" }}>
												{label}
											</div>
											<div style={{ color: "#f0f6fc", fontSize: 22, fontWeight: 800, fontFamily: "var(--mono)" }}>
												{value}
											</div>
										</div>
									))}
								</div>
							</div>
						</header>

						{isLoading && <StateLine>{copy.loading}</StateLine>}
						{error && !isLoading && <StateLine tone="danger">{error}</StateLine>}
						{notInstalled && (
							<section style={{ ...lineSection, marginTop: 24, textAlign: "center" }}>
								<h2 style={{ margin: 0, fontSize: 24, letterSpacing: "-.04em" }}>
									{copy.emptyTitle}
								</h2>
								<p style={{ ...muted, margin: "10px auto 0", maxWidth: 560, fontSize: 14, lineHeight: 1.55 }}>
									{copy.emptyBody}
								</p>
								<div style={{ marginTop: 18 }}>
									<Link href={copy.emptyCtaHref} className="btn btn-primary btn-sm">
										{copy.emptyCta}
									</Link>
								</div>
							</section>
						)}

						{!isLoading && !notInstalled && (
							<>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
										gap: 0,
										borderTop: "1px solid #1b2632",
										borderBottom: "1px solid #1b2632",
										margin: "24px 0 0",
									}}
								>
									{metrics.map((metric, i) => (
										<div
											key={metric.label}
											style={{
												padding: "18px 18px 16px",
												borderRight: i < metrics.length - 1 ? "1px solid #1b2632" : "none",
											}}
										>
											<div style={tableHeader}>{metric.label}</div>
											<div style={{ fontSize: 32, fontWeight: 850, letterSpacing: "-.05em", marginTop: 7, color: toneColor[metric.tone ?? "neutral"], fontFamily: "var(--mono)" }}>
												{metric.value}
											</div>
											<div style={{ ...muted, fontSize: 11, marginTop: 3 }}>
												{metric.detail}
											</div>
										</div>
									))}
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.12fr) minmax(320px, .88fr)", gap: 28, marginTop: 28 }}>
									<section style={lineSection}>
										<SectionHeader title={copy.queueTitle} subtitle={copy.queueSubtitle} href={copy.queueViewAllHref} cta={copy.queueViewAll} />
										{queue.length === 0 ? (
											<EmptyLine>No items in the last 30 days. Install on more repos to see activity.</EmptyLine>
										) : (
											<div>
												<div style={{ display: "grid", gridTemplateColumns: "1fr 142px 76px 118px 58px", gap: 12, padding: "10px 0", borderBottom: "1px solid #1b2632", ...tableHeader }}>
													<span>{copy.queueColumns.item}</span>
													<span>{copy.queueColumns.repo}</span>
													<span style={{ textAlign: "right" }}>{copy.queueColumns.score}</span>
													<span>{copy.queueColumns.status}</span>
													<span style={{ textAlign: "right" }}>{copy.queueColumns.age}</span>
												</div>
												{queue.map((row) => (
													<div key={row.key} style={{ display: "grid", gridTemplateColumns: "1fr 142px 76px 118px 58px", gap: 12, padding: "14px 0", borderBottom: "1px solid #121a24", fontSize: 13, alignItems: "center" }}>
														<Link href={row.href} target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", color: "#d8dee6", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
															{row.item}
														</Link>
														<span style={{ color: "#c9d1d9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.repo}</span>
														<span style={{ textAlign: "right", fontFamily: "var(--mono)", color: row.score >= 80 ? "#f85149" : row.score >= 60 ? "#d29922" : "#3fb950" }}>{row.score}</span>
														<span style={{ color: "#c9d1d9", fontFamily: "var(--mono)", fontSize: 11 }}>{row.status}</span>
														<span style={{ textAlign: "right", color: "#8b949e", fontFamily: "var(--mono)" }}>{row.age}</span>
													</div>
												))}
											</div>
										)}
									</section>

									<div style={{ display: "grid", gap: 24, alignContent: "start" }}>
										<section style={lineSection}>
											<SectionHeader title={copy.reposTitle} subtitle={copy.reposSubtitle} href={copy.reposViewAllHref} cta={copy.reposViewAll} />
											{reposRows.length === 0 ? (
												<EmptyLine>No repos with activity yet. Install on more repos.</EmptyLine>
											) : (
												reposRows.map((row) => (
													<div key={row.repo} style={{ display: "grid", gridTemplateColumns: "1fr 68px 68px", gap: 14, padding: "12px 0", borderBottom: "1px solid #121a24", fontSize: 13 }}>
														<span style={{ fontFamily: "var(--mono)", color: "#d8dee6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.repo}</span>
														<span style={{ textAlign: "right", fontFamily: "var(--mono)", color: row.quarantined > 0 ? "#f85149" : "#8b949e" }}>{row.quarantined}</span>
														<span style={{ textAlign: "right", fontFamily: "var(--mono)", color: row.cleared > 0 ? "#3fb950" : "#8b949e" }}>{row.cleared}</span>
													</div>
												))
											)}
										</section>

										<section style={lineSection}>
											<SectionHeader title={copy.campaignTitle} subtitle={copy.campaignSubtitle} href={campaignHref} cta="Open campaigns" />
											{campaigns.length === 0 ? (
												<EmptyLine>{copy.campaignsEmpty}</EmptyLine>
											) : (
												campaigns.map((c) => (
													<div key={c.name} style={{ padding: "12px 0", borderBottom: "1px solid #121a24" }}>
														<div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
															<span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#f0f6fc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fingerprint}</span>
															<span style={{ fontFamily: "var(--mono)", fontSize: 10, color: riskColor[c.risk], background: riskBg[c.risk], padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>{c.risk}</span>
														</div>
														<div style={{ ...muted, marginTop: 7, fontSize: 11, fontFamily: "var(--mono)" }}>{c.repos} repos / {c.commits} commits / +{c.delta}</div>
													</div>
												))
											)}
										</section>

										<section style={lineSection}>
											<SectionHeader title={copy.policyTitle} subtitle={copy.policyBody} href={copy.policyViewAllHref} cta={copy.policyViewAll} />
											<div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center", padding: "12px 0" }}>
												<div style={{ fontFamily: "var(--mono)", color: "#3fb950", fontSize: 34, fontWeight: 850, letterSpacing: "-.05em" }}>{pct}%</div>
												<div style={{ ...muted, fontSize: 12, lineHeight: 1.5 }}>Enforcing on {covered} of {total} installed repos</div>
											</div>
										</section>
									</div>
								</div>
							</>
						)}
					</section>
				</div>
			</section>
		</main>
	);
}

function SectionHeader({
	title,
	subtitle,
	href,
	cta,
}: {
	title: string;
	subtitle: string;
	href: string;
	cta: string;
}) {
	return (
		<header style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "end", marginBottom: 10 }}>
			<div>
				<h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-.035em", lineHeight: 1.1 }}>{title}</h2>
				<div style={{ ...muted, fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>{subtitle}</div>
			</div>
			<Link href={href} style={{ fontSize: 12, color: "#3fb950", textDecoration: "none", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>
				{cta} →
			</Link>
		</header>
	);
}

function StateLine({
	children,
	tone = "neutral",
}: {
	children: React.ReactNode;
	tone?: "neutral" | "danger";
}) {
	return (
		<div style={{ padding: "34px 0 10px", color: tone === "danger" ? "#f85149" : "#8b949e", fontFamily: "var(--mono)", fontSize: 12 }}>
			{children}
		</div>
	);
}

function EmptyLine({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ padding: "18px 0", color: "#8b949e", fontSize: 12, fontFamily: "var(--mono)", lineHeight: 1.5 }}>
			{children}
		</div>
	);
}
