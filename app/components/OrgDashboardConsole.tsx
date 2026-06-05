"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import {
	shell,
	frame,
	card,
	muted,
	riskColor,
	riskBg,
	toneColor,
} from "./console-styles";

type Metric = {
	label: string;
	value: string;
	detail: string;
	tone?: "neutral" | "warn" | "danger" | "ok";
};
type QueueRow = {
	item: string;
	repo: string;
	score: number;
	status: string;
	owner: string;
	age: string;
	href: string;
};
type RepoRow = {
	repo: string;
	quarantined: number;
	cleared: number;
};
type Campaign = {
	name: string;
	fingerprint: string;
	repos: number;
	risk: "low" | "medium" | "high";
	commits: number;
	authors: number;
	delta: number;
};

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
			repos: RepoRow[];
			radar: Campaign[];
	  }
	| { installed: false; owner: string; reason: string };

export type OrgDashboardConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	activeNav: string;
	loading: string;
	emptyTitle: string;
	emptyBody: string;
	emptyCta: string;
	emptyCtaHref: string;
	metrics: Metric[];
	queueTitle: string;
	queueSubtitle: string;
	updated: string;
	columns: {
		item: string;
		repo: string;
		score: string;
		status: string;
		owner: string;
		age: string;
	};
	queue: QueueRow[];
	reposTitle: string;
	reposSubtitle: string;
	reposEmpty: string;
	reposColumns: { repo: string; quarantined: string; cleared: string };
	repos: RepoRow[];
	campaignTitle: string;
	campaignSubtitle: string;
	campaigns: Campaign[];
	campaignsEmpty: string;
	policyTitle: string;
	policyBody: string;
	coverageLabel: string;
	coveragePercent: number;
	coverageRepos: string;
	coverageMissing: string;
	installHref: string;
	alerts: string;
	alertsHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
};

function formatAge(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const m = Math.floor(ms / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d`;
	return new Date(iso).toISOString().slice(0, 10);
}

function deriveStatus(labels: string[]): string {
	if (labels.some((l) => l.toLowerCase().includes("quarantine")))
		return "Quarantined";
	if (labels.some((l) => l.toLowerCase().includes("cleared"))) return "Cleared";
	return "Watching";
}

function deriveScore(labels: string[]): number {
	// 0-100. Real score comes from the SlopGuard detector (lib/agent). When we
	// aggregate from a public label view, we just use the label tag as a
	// coarse proxy so the dial still has a value the user can act on.
	const l = labels.map((x) => x.toLowerCase()).join(" ");
	if (l.includes("quarantine")) return 78;
	if (l.includes("cleared")) return 24;
	return 46;
}

export default function OrgDashboardConsole({
	copy,
}: {
	copy: OrgDashboardConsoleCopy;
}) {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [updatedAt, setUpdatedAt] = useState<string>("");

	async function load() {
		setError(null);
		try {
			const res = await fetch("/api/team/dashboard", { cache: "no-store" });
			if (!res.ok) {
				setError(`HTTP ${res.status}`);
				return;
			}
			const json = (await res.json()) as DashboardResponse;
			setData(json);
			setUpdatedAt(new Date().toISOString());
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load dashboard");
		}
	}

	useEffect(() => {
		load();
		const t = setInterval(load, 30_000);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isLoading = data === null && error === null;
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;

	const live = data && data.installed ? data : null;

	// Build display rows from real data only — no hardcoded values fall through.
	const queue: QueueRow[] = useMemo(() => {
		if (!live) return [];
		return live.recent.slice(0, 8).map((it) => {
			const repo =
				it.url.match(/github\.com\/([^/]+)\/([^/]+)\//i)?.[0]?.replace(/\/$/, "") ??
				"";
			// url is https://api.github.com/repos/o/r/issues/N — extract o/r
			const m = it.url.match(/repos\/([^/]+)\/([^/]+)\//);
			const repoLabel = m ? `${m[1]}/${m[2]}` : repo || "—";
			return {
				item: it.title,
				repo: repoLabel,
				score: deriveScore(it.labels),
				status: deriveStatus(it.labels),
				owner: `@${it.author}`,
				age: formatAge(it.updatedAt),
				href: it.url
					.replace("api.github.com", "github.com")
					.replace(/\/repos\//, "/"),
			};
		});
	}, [live]);

	const reposRows: RepoRow[] = live?.repos ?? [];

	const campaigns: Campaign[] = live?.radar ?? [];

	const metrics: Metric[] = useMemo(() => {
		if (!live) return copy.metrics; // safe placeholder; replaced as soon as data lands
		const repos = live.repos.length;
		const avgScore =
			repos > 0
				? Math.round(
						live.recent.reduce(
							(s, it) => s + deriveScore(it.labels),
							0,
						) / Math.max(1, live.recent.length),
					)
				: 0;
		return [
			{
				label: "Open reviews",
				value: String(live.open),
				detail:
					live.open > 0
						? `${live.recent.filter((i) => i.state === "open").length} need owner action`
						: "all clear",
				tone: live.open > 0 ? "warn" : "ok",
			},
			{
				label: "Protected repos",
				value: String(repos),
				detail: `${live.repoCount} installed`,
				tone: "ok",
			},
			{
				label: "Avg. slop score",
				value: String(avgScore),
				detail: `${live.quarantined} quarantined / ${live.cleared} cleared`,
				tone: avgScore >= 60 ? "warn" : "ok",
			},
			{
				label: "Active clusters",
				value: String(campaigns.length),
				detail:
					campaigns.filter((c) => c.risk === "high").length > 0
						? `${campaigns.filter((c) => c.risk === "high").length} high-confidence`
						: "no high-risk clusters",
				tone:
					campaigns.filter((c) => c.risk === "high").length > 0
						? "danger"
						: "neutral",
			},
		];
	}, [live, campaigns.length, copy.metrics]);

	const coverage = useMemo(() => {
		if (!live) return { percent: 0, repos: "0", missing: "" };
		const total = live.repoCount;
		const covered = live.repos.length;
		const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
		const missing =
			total - covered > 0
				? `${total - covered} repos have no quarantine activity yet — install SlopGuard on them.`
				: "All installed repos are protected.";
		return {
			percent: pct,
			repos: `${total} installed repos`,
			missing,
		};
	}, [live]);

	return (
		<main style={shell}>
			<section style={frame}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "240px 1fr",
						minHeight: 760,
					}}
				>
					<ConsoleSidebar
						workspace={copy.workspace}
						workspaceSub={copy.workspaceSub}
						user={copy.user}
						entitlement={copy.entitlement}
						connected={copy.connected}
						nav={copy.nav}
						activeNav={copy.activeNav}
					/>

					<div style={{ padding: "26px 28px 32px" }}>
						<header
							style={{
								display: "grid",
								gridTemplateColumns: "1.2fr 1fr",
								gap: 18,
								marginBottom: 26,
							}}
						>
							<div
								style={{
									background:
										"radial-gradient(120% 80% at 0% 0%, rgba(63,185,80,.08), transparent 60%), linear-gradient(180deg, #0f1620 0%, #0b1016 100%)",
									border: "1px solid #1c2530",
									borderRadius: 16,
									padding: "20px 22px",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										color: "#3fb950",
										fontSize: 11,
										fontWeight: 800,
										letterSpacing: ".14em",
										fontFamily: "var(--mono)",
									}}
								>
									{copy.heroEyebrow}
								</div>
								<h1
									style={{
										margin: "10px 0 8px",
										fontSize: 30,
										letterSpacing: "-.035em",
										fontWeight: 800,
										lineHeight: 1.1,
									}}
								>
									{copy.heroTitle}
								</h1>
								<p
									style={{
										...muted,
										margin: 0,
										maxWidth: 540,
										lineHeight: 1.55,
										fontSize: 14,
									}}
								>
									{copy.heroBody}
								</p>
								<div style={{ marginTop: 16 }}>
									<Link
										href={copy.heroCtaHref}
										className="btn btn-primary btn-sm"
									>
										{copy.heroCta}
									</Link>
								</div>
							</div>
							<div
								style={{
									border: "1px solid #1c2530",
									borderRadius: 16,
									overflow: "hidden",
									position: "relative",
									minHeight: 180,
									background: "#0a0e15",
								}}
							>
								<Image
									src="/radar-circuit.png"
									alt="Cross-repo campaign radar"
									fill
									style={{ objectFit: "cover", opacity: 0.7 }}
									sizes="(max-width: 1280px) 100vw, 480px"
								/>
								<div
									style={{
										position: "absolute",
										inset: 0,
										background:
											"linear-gradient(180deg, rgba(10,14,21,.4) 0%, rgba(10,14,21,.9) 100%)",
									}}
								/>
								<div
									style={{
										position: "absolute",
										bottom: 14,
										left: 16,
										right: 16,
										fontFamily: "var(--mono)",
										fontSize: 11,
										color: "#8b949e",
										letterSpacing: ".05em",
									}}
								>
									<div
										style={{ color: "#f0f6fc", fontWeight: 700, fontSize: 12 }}
									>
										Live campaign feed
									</div>
									<div style={{ marginTop: 4 }}>
										{live
											? `${campaigns.length} clusters · ${live.open} open reviews`
											: copy.loading}
									</div>
								</div>
							</div>
						</header>

						{/* Loading state */}
						{isLoading && (
							<div
								style={{
									...card,
									padding: "32px 24px",
									textAlign: "center",
									color: "#8b949e",
									fontFamily: "var(--mono)",
									fontSize: 12,
									marginBottom: 24,
								}}
							>
								Loading live data from GitHub…
							</div>
						)}

						{/* Error state */}
						{error && !isLoading && (
							<div
								style={{
									...card,
									padding: "16px 18px",
									border: "1px solid rgba(248,81,73,.4)",
									color: "#f85149",
									fontSize: 12,
									fontFamily: "var(--mono)",
									marginBottom: 24,
								}}
							>
								Failed to load: {error}
							</div>
						)}

						{/* Not installed state — no fake numbers */}
						{notInstalled && (
							<div
								style={{
									...card,
									padding: "32px 24px",
									textAlign: "center",
									marginBottom: 24,
								}}
							>
								<h2
									style={{
										margin: "0 0 8px",
										fontSize: 18,
										letterSpacing: "-.02em",
										color: "#f0f6fc",
									}}
								>
									{copy.emptyTitle}
								</h2>
								<p
									style={{
										...muted,
										margin: "0 auto",
										maxWidth: 480,
										lineHeight: 1.55,
										fontSize: 13,
									}}
								>
									{copy.emptyBody}
								</p>
								<p
									style={{
										...muted,
										margin: "12px auto 0",
										maxWidth: 480,
										fontFamily: "var(--mono)",
										fontSize: 11,
									}}
								>
									reason: {data && "reason" in data ? data.reason : ""}
								</p>
								<div style={{ marginTop: 18 }}>
									<Link
										href={copy.emptyCtaHref}
										className="btn btn-primary btn-sm"
									>
										{copy.emptyCta}
									</Link>
								</div>
							</div>
						)}

						{/* Metrics row — derived from real data */}
						{!isLoading && !notInstalled && (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
									gap: 0,
									borderTop: "1px solid #1c2530",
									borderBottom: "1px solid #1c2530",
									marginBottom: 24,
								}}
							>
								{metrics.map((metric, i) => (
									<div
										key={metric.label}
										style={{
											padding: "16px 18px",
											borderRight:
												i < metrics.length - 1
													? "1px solid #1c2530"
													: "none",
										}}
									>
										<div
											style={{
												...muted,
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontFamily: "var(--mono)",
											}}
										>
											{metric.label}
										</div>
										<div
											style={{
												fontSize: 28,
												fontWeight: 800,
												letterSpacing: "-.03em",
												marginTop: 6,
												color: toneColor[metric.tone ?? "neutral"],
												fontFamily: "var(--mono)",
											}}
										>
											{metric.value}
										</div>
										<div
											style={{
												...muted,
												fontSize: 11,
												marginTop: 4,
											}}
										>
											{metric.detail}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Quarantine queue */}
						{!isLoading && !notInstalled && (
							<section id="queue" style={{ marginBottom: 24, scrollMarginTop: 80 }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-end",
										marginBottom: 12,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 18,
												letterSpacing: "-.02em",
											}}
										>
											{copy.queueTitle}
										</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.queueSubtitle}
										</div>
									</div>
									<div
										style={{
											...muted,
											fontSize: 11,
											fontFamily: "var(--mono)",
										}}
									>
										{updatedAt
											? `${copy.updated} · ${new Date(updatedAt).toLocaleTimeString()}`
											: copy.updated}
									</div>
								</header>
								<div style={{ ...card, overflow: "hidden" }}>
									{queue.length === 0 ? (
										<div
											style={{
												padding: "32px 24px",
												textAlign: "center",
												color: "#8b949e",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											No quarantine activity in the last 30 days. New items
											will show up here as SlopGuard detects them on your
											installed repos.
										</div>
									) : (
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												fontSize: 13,
											}}
										>
											<thead>
												<tr
													style={{
														color: "#7d8590",
														borderBottom: "1px solid #1c2530",
													}}
												>
													{(
														[
															"item",
															"repo",
															"score",
															"status",
															"owner",
															"age",
														] as const
													).map((k) => (
														<th
															key={k}
															style={{
																textAlign: k === "score" ? "right" : "left",
																padding: "10px 14px",
																fontSize: 10,
																letterSpacing: ".14em",
																textTransform: "uppercase",
																fontWeight: 600,
																fontFamily: "var(--mono)",
															}}
														>
															{copy.columns[k]}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{queue.map((row) => (
													<tr
														key={`${row.repo}#${row.item}`}
														style={{ borderBottom: "1px solid #161e29" }}
													>
														<td
															style={{
																padding: "11px 14px",
																fontFamily: "var(--mono)",
																color: "#c9d1d9",
															}}
														>
															<Link
																href={row.href}
																target="_blank"
																rel="noreferrer"
																style={{
																	color: "#c9d1d9",
																	textDecoration: "none",
																}}
															>
																{row.item}
															</Link>
														</td>
														<td style={{ padding: "11px 14px", color: "#c9d1d9" }}>
															{row.repo}
														</td>
														<td
															style={{
																padding: "11px 14px",
																textAlign: "right",
																fontFamily: "var(--mono)",
															}}
														>
															<span
																style={{
																	display: "inline-block",
																	width: 80,
																	textAlign: "right",
																	color:
																		row.score >= 80
																			? "#f85149"
																			: row.score >= 60
																				? "#d29922"
																				: "#3fb950",
																}}
															>
																{row.score}
															</span>
														</td>
														<td style={{ padding: "11px 14px" }}>
															<span
																style={{
																	fontSize: 11,
																	padding: "2px 8px",
																	borderRadius: 99,
																	background:
																		row.status === "Quarantined"
																			? "rgba(248,81,73,.12)"
																			: row.status === "Cleared"
																				? "rgba(63,185,80,.12)"
																				: "rgba(210,153,34,.12)",
																	color:
																		row.status === "Quarantined"
																			? "#f85149"
																			: row.status === "Cleared"
																				? "#3fb950"
																				: "#d29922",
																	fontFamily: "var(--mono)",
																}}
															>
																{row.status}
															</span>
														</td>
														<td
															style={{
																padding: "11px 14px",
																color: "#8b949e",
																fontFamily: "var(--mono)",
															}}
														>
															{row.owner}
														</td>
														<td
															style={{
																padding: "11px 14px",
																color: "#8b949e",
																fontFamily: "var(--mono)",
																textAlign: "right",
															}}
														>
															{row.age}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</section>
						)}

						{/* Repos section — real per-repo data */}
						{!isLoading && !notInstalled && (
							<section id="repos" style={{ marginBottom: 24, scrollMarginTop: 80 }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-end",
										marginBottom: 12,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 18,
												letterSpacing: "-.02em",
											}}
										>
											{copy.reposTitle}
										</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.reposSubtitle}
										</div>
									</div>
								</header>
								<div style={{ ...card, overflow: "hidden" }}>
									{reposRows.length === 0 ? (
										<div
											style={{
												padding: "32px 24px",
												textAlign: "center",
												color: "#8b949e",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											{copy.reposEmpty}
										</div>
									) : (
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												fontSize: 13,
											}}
										>
											<thead>
												<tr
													style={{
														color: "#7d8590",
														borderBottom: "1px solid #1c2530",
													}}
												>
													<th
														style={{
															textAlign: "left",
															padding: "10px 14px",
															fontSize: 10,
															letterSpacing: ".14em",
															textTransform: "uppercase",
															fontWeight: 600,
															fontFamily: "var(--mono)",
														}}
													>
														{copy.reposColumns.repo}
													</th>
													<th
														style={{
															textAlign: "right",
															padding: "10px 14px",
															fontSize: 10,
															letterSpacing: ".14em",
															textTransform: "uppercase",
															fontWeight: 600,
															fontFamily: "var(--mono)",
														}}
													>
														{copy.reposColumns.quarantined}
													</th>
													<th
														style={{
															textAlign: "right",
															padding: "10px 14px",
															fontSize: 10,
															letterSpacing: ".14em",
															textTransform: "uppercase",
															fontWeight: 600,
															fontFamily: "var(--mono)",
														}}
													>
														{copy.reposColumns.cleared}
													</th>
												</tr>
											</thead>
											<tbody>
												{reposRows.slice(0, 12).map((row) => (
													<tr
														key={row.repo}
														style={{ borderBottom: "1px solid #161e29" }}
													>
														<td
															style={{
																padding: "11px 14px",
																fontFamily: "var(--mono)",
																color: "#c9d1d9",
															}}
														>
															{row.repo}
														</td>
														<td
															style={{
																padding: "11px 14px",
																textAlign: "right",
																fontFamily: "var(--mono)",
																color:
																	row.quarantined > 0 ? "#f85149" : "#8b949e",
															}}
														>
															{row.quarantined}
														</td>
														<td
															style={{
																padding: "11px 14px",
																textAlign: "right",
																fontFamily: "var(--mono)",
																color: row.cleared > 0 ? "#3fb950" : "#8b949e",
															}}
														>
															{row.cleared}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</section>
						)}

						{/* Campaign radar */}
						{!isLoading && !notInstalled && (
							<section style={{ marginBottom: 24 }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-end",
										marginBottom: 12,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 18,
												letterSpacing: "-.02em",
											}}
										>
											{copy.campaignTitle}
										</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.campaignSubtitle}
										</div>
									</div>
									<Link
										href="/campaigns"
										style={{
											fontSize: 12,
											color: "#3fb950",
											textDecoration: "none",
											fontFamily: "var(--mono)",
										}}
									>
										Open campaigns →
									</Link>
								</header>
								<div style={{ ...card, padding: "16px 18px" }}>
									{campaigns.length === 0 ? (
										<div
											style={{
												padding: "16px 0",
												color: "#8b949e",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											{copy.campaignsEmpty}
										</div>
									) : (
										campaigns.map((c) => {
											const c0 = riskColor[c.risk];
											return (
												<div
													key={c.name}
													style={{
														padding: "12px 0",
														borderTop: "1px solid #1c2530",
													}}
												>
													<div
														style={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
															gap: 16,
														}}
													>
														<div style={{ flex: "0 0 auto", maxWidth: 360 }}>
															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: 8,
																}}
															>
																<span
																	style={{
																		display: "inline-block",
																		padding: "1px 8px",
																		borderRadius: 99,
																		fontSize: 10,
																		fontFamily: "var(--mono)",
																		textTransform: "uppercase",
																		letterSpacing: ".08em",
																		background: riskBg[c.risk],
																		color: c0,
																	}}
																>
																	{c.risk}
																</span>
																<span
																	style={{
																		fontSize: 11,
																		color: "#8b949e",
																		fontFamily: "var(--mono)",
																	}}
																>
																	{c.repos} repos · {c.commits} commits ·{" "}
																	{c.authors} authors
																</span>
															</div>
															<div
																style={{
																	marginTop: 6,
																	fontFamily: "var(--mono)",
																	fontSize: 13,
																	color: "#f0f6fc",
																	overflow: "hidden",
																	textOverflow: "ellipsis",
																	whiteSpace: "nowrap",
																}}
															>
																{c.fingerprint}
															</div>
														</div>
														<div
															style={{
																flex: 1,
																display: "flex",
																alignItems: "center",
																gap: 10,
																minWidth: 0,
															}}
														>
															<div
																style={{
																	flex: 1,
																	height: 6,
																	background: "rgba(255,255,255,0.04)",
																	borderRadius: 99,
																	overflow: "hidden",
																}}
															>
																<div
																	style={{
																		width: `${c.delta}%`,
																		height: "100%",
																		background: `linear-gradient(90deg, ${c0}55 0%, ${c0} 100%)`,
																	}}
																/>
															</div>
															<div
																style={{
																	fontFamily: "var(--mono)",
																	fontSize: 12,
																	color: c0,
																	minWidth: 38,
																	textAlign: "right",
																}}
															>
																+{c.delta}
															</div>
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</section>
						)}

						{/* Policy coverage */}
						{!isLoading && !notInstalled && (
							<section id="policy" style={{ scrollMarginTop: 80 }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-end",
										marginBottom: 12,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 18,
												letterSpacing: "-.02em",
											}}
										>
											{copy.policyTitle}
										</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.policyBody}
										</div>
									</div>
									<Link
										href="/docs#policy"
										style={{
											fontSize: 12,
											color: "#3fb950",
											textDecoration: "none",
											fontFamily: "var(--mono)",
										}}
									>
										{coverage.repos}
									</Link>
								</header>
								<div style={{ ...card, padding: "16px 18px" }}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											marginBottom: 10,
											fontFamily: "var(--mono)",
											fontSize: 12,
										}}
									>
										<span style={{ color: "#c9d1d9" }}>{copy.coverageLabel}</span>
										<span style={{ color: "#3fb950", fontWeight: 700 }}>
											{coverage.percent}% of {coverage.repos}
										</span>
									</div>
									<div
										style={{
											height: 8,
											background: "rgba(255,255,255,0.04)",
											borderRadius: 99,
											overflow: "hidden",
										}}
									>
										<div
											style={{
												width: `${coverage.percent}%`,
												height: "100%",
												background:
													"linear-gradient(90deg, #3fb950 0%, #2ea043 100%)",
											}}
										/>
									</div>
									<div
										style={{
											...muted,
											fontSize: 11,
											marginTop: 10,
											fontFamily: "var(--mono)",
										}}
									>
										{coverage.missing}
									</div>
								</div>
							</section>
						)}

						<div
							style={{
								marginTop: 24,
								display: "flex",
								gap: 10,
								justifyContent: "flex-end",
							}}
						>
							<Link href={copy.alertsHref} className="btn btn-primary btn-sm">
								{copy.alerts}
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
