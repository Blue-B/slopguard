"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { toneColor, riskColor, riskBg } from "./console-styles";

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

	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;

	const metrics = useMemo(() => {
		if (!live) {
			return [
				{
					label: "Open reviews",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "Protected repos",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "Avg. slop score",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "Active clusters",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
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
				detail: `${campaigns.filter((c) => c.risk === "high").length} high-confidence`,
				tone:
					campaigns.filter((c) => c.risk === "high").length > 0
						? ("danger" as const)
						: ("neutral" as const),
			},
		];
	}, [live, campaigns.length, covered, total]);

	return (
		<main
			style={{
				maxWidth: 1480,
				margin: "0 auto",
				padding: "18px 32px 96px",
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "260px minmax(0, 1fr)",
					gap: 24,
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

				<section>
					{/* Hero - left text / right circuit asset. No card box. */}
					<header
						style={{
							display: "grid",
							gridTemplateColumns: "1.2fr 1fr",
							gap: 16,
							padding: "0 0 24px",
							borderBottom: "1px solid #1c2530",
							marginBottom: 0,
						}}
					>
						<div style={{ padding: "8px 0" }}>
							<div
								style={{
									color: "#3fb950",
									fontSize: 10,
									letterSpacing: ".18em",
									textTransform: "uppercase",
									fontFamily: "var(--mono)",
									marginBottom: 10,
								}}
							>
								{copy.heroEyebrow}
							</div>
							<h1
								style={{
									margin: 0,
									fontSize: 26,
									letterSpacing: "-.035em",
									fontWeight: 800,
									lineHeight: 1.15,
								}}
							>
								{copy.heroTitle}
							</h1>
							<p
								style={{
									color: "#8b949e",
									margin: "10px 0 14px",
									maxWidth: 540,
									fontSize: 13,
									lineHeight: 1.55,
								}}
							>
								{copy.heroBody}
							</p>
							<Link href={copy.heroCtaHref} className="btn btn-primary btn-sm">
								{copy.heroCta}
							</Link>
						</div>
						<div
							style={{
								position: "relative",
								borderRadius: 12,
								overflow: "hidden",
								minHeight: 160,
								background: "#0a0e15",
								border: "1px solid #1c2530",
							}}
						>
							<Image
								src="/paid-console-premium-header.png"
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
										"linear-gradient(180deg, rgba(10,14,21,.4) 0%, rgba(10,14,21,.92) 100%)",
								}}
							/>
							<div
								style={{
									position: "absolute",
									bottom: 12,
									left: 14,
									right: 14,
									fontFamily: "var(--mono)",
									fontSize: 11,
									color: "#8b949e",
									letterSpacing: ".05em",
								}}
							>
								<div style={{ color: "#f0f6fc", fontWeight: 700 }}>
									Live campaign feed
								</div>
								<div style={{ marginTop: 4 }}>
									{live
										? `${campaigns.length} clusters / ${live.open} open reviews`
										: copy.loading}
								</div>
							</div>
						</div>
					</header>

					{isLoading && (
						<div
							style={{
								padding: "48px 0",
								textAlign: "center",
								color: "#8b949e",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							Loading live data…
						</div>
					)}

					{error && !isLoading && (
						<div
							style={{
								padding: "16px 0",
								color: "#f85149",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{error}
						</div>
					)}

					{notInstalled && (
						<div
							style={{
								padding: "48px 0",
								textAlign: "center",
							}}
						>
							<h2
								style={{
									margin: 0,
									fontSize: 17,
									letterSpacing: "-.02em",
									color: "#f0f6fc",
								}}
							>
								{copy.emptyTitle}
							</h2>
							<p
								style={{
									color: "#8b949e",
									margin: "8px auto 0",
									maxWidth: 480,
									fontSize: 13,
									lineHeight: 1.55,
								}}
							>
								{copy.emptyBody}
							</p>
							<p
								style={{
									color: "#8b949e",
									margin: "8px auto 0",
									maxWidth: 480,
									fontFamily: "var(--mono)",
									fontSize: 11,
								}}
							>
								reason: {data && "reason" in data ? data.reason : ""}
							</p>
							<div style={{ marginTop: 16 }}>
								<Link
									href={copy.emptyCtaHref}
									className="btn btn-primary btn-sm"
								>
									{copy.emptyCta}
								</Link>
							</div>
						</div>
					)}

					{!isLoading && !notInstalled && (
						<>
							{/* Metrics row - no card box, just border-t/b + mono numbers */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 0,
									borderBottom: "1px solid #1c2530",
									marginBottom: 0,
								}}
							>
								{metrics.map((metric, i) => (
									<div
										key={metric.label}
										style={{
											padding: "20px 16px",
											borderRight:
												i < metrics.length - 1 ? "1px solid #1c2530" : "none",
										}}
									>
										<div
											style={{
												color: "#8b949e",
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
												color: "#8b949e",
												fontSize: 11,
												marginTop: 4,
											}}
										>
											{metric.detail}
										</div>
									</div>
								))}
							</div>

							{/* Quarantine queue - TOP 5 with View all link */}
							<section style={{ padding: "20px 0 0" }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: 8,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 15,
												letterSpacing: "-.02em",
											}}
										>
											{copy.queueTitle}
										</h2>
										<div
											style={{
												color: "#8b949e",
												fontSize: 12,
												marginTop: 4,
											}}
										>
											{copy.queueSubtitle}
										</div>
									</div>
									<Link
										href={copy.queueViewAllHref}
										style={{
											fontSize: 12,
											color: "#3fb950",
											textDecoration: "none",
											fontFamily: "var(--mono)",
										}}
									>
										{copy.queueViewAll} →
									</Link>
								</header>
								{queue.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										No items in the last 30 days. Install on more repos to see
										activity.
									</div>
								) : (
									<div>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 140px 70px 120px 60px",
												gap: 12,
												padding: "10px 4px",
												color: "#7d8590",
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontFamily: "var(--mono)",
												borderBottom: "1px solid #1c2530",
											}}
										>
											<span>{copy.queueColumns.item}</span>
											<span>{copy.queueColumns.repo}</span>
											<span style={{ textAlign: "right" }}>
												{copy.queueColumns.score}
											</span>
											<span>{copy.queueColumns.status}</span>
											<span style={{ textAlign: "right" }}>
												{copy.queueColumns.age}
											</span>
										</div>
										{queue.map((row) => (
											<div
												key={row.key}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr 140px 70px 120px 60px",
													gap: 12,
													padding: "12px 4px",
													borderBottom: "1px solid #161e29",
													fontSize: 13,
												}}
											>
												<Link
													href={row.href}
													target="_blank"
													rel="noreferrer"
													style={{
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
														textDecoration: "none",
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{row.item}
												</Link>
												<span style={{ color: "#c9d1d9" }}>{row.repo}</span>
												<span
													style={{
														textAlign: "right",
														fontFamily: "var(--mono)",
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
												<span>
													<span
														style={{
															fontSize: 10,
															padding: "2px 7px",
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
												</span>
												<span
													style={{
														textAlign: "right",
														color: "#8b949e",
														fontFamily: "var(--mono)",
													}}
												>
													{row.age}
												</span>
											</div>
										))}
									</div>
								)}
							</section>

							{/* Repos - TOP 5 with View all link */}
							<section style={{ padding: "20px 0 0" }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: 8,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 15,
												letterSpacing: "-.02em",
											}}
										>
											{copy.reposTitle}
										</h2>
										<div
											style={{
												color: "#8b949e",
												fontSize: 12,
												marginTop: 4,
											}}
										>
											{copy.reposSubtitle}
										</div>
									</div>
									<Link
										href={copy.reposViewAllHref}
										style={{
											fontSize: 12,
											color: "#3fb950",
											textDecoration: "none",
											fontFamily: "var(--mono)",
										}}
									>
										{copy.reposViewAll} →
									</Link>
								</header>
								{reposRows.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										No repos with activity yet. Install on more repos.
									</div>
								) : (
									<div>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 110px 110px",
												gap: 12,
												padding: "10px 4px",
												color: "#7d8590",
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontFamily: "var(--mono)",
												borderBottom: "1px solid #1c2530",
											}}
										>
											<span>{copy.reposColumns.repo}</span>
											<span style={{ textAlign: "right" }}>
												{copy.reposColumns.quarantined}
											</span>
											<span style={{ textAlign: "right" }}>
												{copy.reposColumns.cleared}
											</span>
										</div>
										{reposRows.map((row) => (
											<div
												key={row.repo}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr 110px 110px",
													gap: 12,
													padding: "12px 4px",
													borderBottom: "1px solid #161e29",
													fontSize: 13,
												}}
											>
												<span
													style={{
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.repo}
												</span>
												<span
													style={{
														textAlign: "right",
														fontFamily: "var(--mono)",
														color: row.quarantined > 0 ? "#f85149" : "#8b949e",
													}}
												>
													{row.quarantined}
												</span>
												<span
													style={{
														textAlign: "right",
														fontFamily: "var(--mono)",
														color: row.cleared > 0 ? "#3fb950" : "#8b949e",
													}}
												>
													{row.cleared}
												</span>
											</div>
										))}
									</div>
								)}
							</section>

							{/* Campaign radar - TOP 3 */}
							<section style={{ padding: "20px 0 0" }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: 8,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 15,
												letterSpacing: "-.02em",
											}}
										>
											{copy.campaignTitle}
										</h2>
										<div
											style={{
												color: "#8b949e",
												fontSize: 12,
												marginTop: 4,
											}}
										>
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
								{campaigns.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										{copy.campaignsEmpty}
									</div>
								) : (
									<div>
										{campaigns.map((c) => {
											const c0 = riskColor[c.risk];
											return (
												<div
													key={c.name}
													style={{
														padding: "12px 4px",
														borderBottom: "1px solid #161e29",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														gap: 12,
													}}
												>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: 8,
															flex: "0 0 auto",
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
																fontFamily: "var(--mono)",
																fontSize: 13,
																color: "#f0f6fc",
																overflow: "hidden",
																textOverflow: "ellipsis",
																whiteSpace: "nowrap",
																maxWidth: 280,
															}}
														>
															{c.fingerprint}
														</span>
													</div>
													<div
														style={{
															flex: 1,
															display: "flex",
															alignItems: "center",
															gap: 10,
														}}
													>
														<div
															style={{
																flex: 1,
																height: 4,
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
																minWidth: 36,
																textAlign: "right",
															}}
														>
															+{c.delta}
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</section>

							{/* Policy coverage - single big bar + View policy link */}
							<section style={{ padding: "20px 0 0" }}>
								<header
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: 14,
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: 15,
												letterSpacing: "-.02em",
											}}
										>
											{copy.policyTitle}
										</h2>
										<div
											style={{
												color: "#8b949e",
												fontSize: 12,
												marginTop: 4,
											}}
										>
											{copy.policyBody}
										</div>
									</div>
									<Link
										href={copy.policyViewAllHref}
										style={{
											fontSize: 12,
											color: "#3fb950",
											textDecoration: "none",
											fontFamily: "var(--mono)",
										}}
									>
										{copy.policyViewAll} →
									</Link>
								</header>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: 8,
										fontFamily: "var(--mono)",
										fontSize: 11,
									}}
								>
									<span style={{ color: "#8b949e" }}>
										Enforcing on {covered} of {total} installed repos
									</span>
									<span
										style={{
											color: "#3fb950",
											fontWeight: 700,
											fontSize: 13,
										}}
									>
										{pct}%
									</span>
								</div>
								<div
									style={{
										height: 6,
										background: "rgba(255,255,255,0.04)",
										borderRadius: 99,
										overflow: "hidden",
									}}
								>
									<div
										style={{
											width: `${pct}%`,
											height: "100%",
											background:
												"linear-gradient(90deg, #3fb950 0%, #2ea043 100%)",
										}}
									/>
								</div>
							</section>
						</>
					)}
				</section>
			</div>
		</main>
	);
}
