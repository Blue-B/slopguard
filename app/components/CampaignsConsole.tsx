"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { muted, toneColor } from "./console-styles";

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
	commits: Array<{
		repo: string;
		sha: string;
		title: string;
		author: string;
		when: string;
	}>;
};

type ListResponse =
	| { installed: true; owner: string; repoCount: number; clusters: Cluster[] }
	| { installed: false; owner: string; reason: string };

export type CampaignsConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	activeNav?: string;
	loading: string;
	emptyTitle: string;
	emptyBody: string;
	emptyCta: string;
	emptyCtaHref: string;
	investigate: string;
	backToOrg: string;
	orgHref: string;
	accountHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
	clustersTitle: string;
	clustersSubtitle: string;
	clustersEmpty: string;
	scoreBoostTitle: string;
	scoreBoostBody: string;
};

export default function CampaignsConsole({
	copy,
}: {
	copy: CampaignsConsoleCopy;
}) {
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
			const json = (await res.json()) as ListResponse;
			setData(json);
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
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;

	const metrics = [
		{
			label: "Active clusters",
			value: live ? String(live.clusters.length) : "—",
			detail: live
				? `${live.clusters.filter((c) => c.risk === "high").length} high-risk`
				: "loading",
			tone:
				live && live.clusters.some((c) => c.risk === "high")
					? ("danger" as const)
					: ("neutral" as const),
		},
		{
			label: "Total hits",
			value: live ? String(live.clusters.reduce((s, c) => s + c.hits, 0)) : "—",
			detail: live ? `${live.repoCount} installed repos` : "loading",
			tone: "ok" as const,
		},
		{
			label: "Authors involved",
			value: live
				? String(new Set(live.clusters.flatMap((c) => c.authors)).size)
				: "—",
			detail: live ? "unique handles" : "loading",
			tone: "neutral" as const,
		},
		{
			label: "Repos monitored",
			value: live ? String(live.repoCount) : "—",
			detail: live ? "in this account" : "loading",
			tone: "ok" as const,
		},
	];

	return (
		<main
			style={{
				maxWidth: 1320,
				margin: "0 auto",
				padding: "0 24px 80px",
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "232px 1fr",
					gap: 0,
					alignItems: "start",
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

				<div style={{ paddingLeft: 32, paddingTop: 8 }}>
					{/* Clean, premium header */}
					<div style={{ marginBottom: 32 }}>
						<div
							style={{
								color: "#3fb950",
								fontSize: 10,
								letterSpacing: "0.18em",
								fontFamily: "var(--mono)",
								marginBottom: 8,
							}}
						>
							{copy.heroEyebrow}
						</div>
						<h1
							style={{
								margin: 0,
								fontSize: 28,
								letterSpacing: "-0.032em",
								fontWeight: 700,
								lineHeight: 1.1,
							}}
						>
							{copy.heroTitle}
						</h1>
						<p
							style={{
								...muted,
								marginTop: 10,
								maxWidth: 520,
								fontSize: 14,
								lineHeight: 1.5,
							}}
						>
							{copy.heroBody}
						</p>
					</div>

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
							Loading live campaign state…
						</div>
					)}

					{error && !isLoading && (
						<div
							style={{
								padding: "16px 0",
								color: "#f85149",
								fontSize: 12,
								fontFamily: "var(--mono)",
							}}
						>
							Failed to load: {error}
						</div>
					)}

					{notInstalled && (
						<div style={{ padding: "48px 0", textAlign: "center" }}>
							<h2
								style={{
									margin: "0 0 8px",
									fontSize: 17,
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
									maxWidth: 460,
									lineHeight: 1.55,
									fontSize: 13,
								}}
							>
								{copy.emptyBody}
							</p>
							<div style={{ marginTop: 20 }}>
								<Link
									href={copy.emptyCtaHref}
									className="btn btn-primary btn-sm"
								>
									{copy.emptyCta}
								</Link>
							</div>
						</div>
					)}

					{!isLoading && !notInstalled && live && (
						<>
							{/* Elegant, refined metrics (no card grid) */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 0,
									borderTop: "1px solid #1c2530",
									borderBottom: "1px solid #1c2530",
									marginBottom: 36,
								}}
							>
								{metrics.map((metric, i) => (
									<div
										key={metric.label}
										style={{
											padding: "18px 22px 18px 0",
											borderRight: i < 3 ? "1px solid #1c2530" : "none",
										}}
									>
										<div
											style={{
												...muted,
												fontSize: 10,
												letterSpacing: "0.14em",
												fontFamily: "var(--mono)",
											}}
										>
											{metric.label}
										</div>
										<div
											style={{
												fontSize: 26,
												fontWeight: 700,
												letterSpacing: "-0.02em",
												marginTop: 4,
												color: toneColor[metric.tone ?? "neutral"],
												fontFamily: "var(--mono)",
											}}
										>
											{metric.value}
										</div>
										<div style={{ ...muted, fontSize: 11, marginTop: 2 }}>
											{metric.detail}
										</div>
									</div>
								))}
							</div>

							{/* Clusters - clean, spacious, designer list (no heavy cards) */}
							<div style={{ marginBottom: 12 }}>
								<div style={{ marginBottom: 14 }}>
									<div
										style={{
											fontSize: 13,
											fontWeight: 600,
											letterSpacing: "-0.01em",
										}}
									>
										{copy.clustersTitle}
									</div>
									<div style={{ ...muted, fontSize: 12, marginTop: 2 }}>
										{copy.clustersSubtitle}
									</div>
								</div>

								{live.clusters.length === 0 ? (
									<div
										style={{
											padding: "40px 0",
											color: "#8b949e",
											fontSize: 13,
											fontFamily: "var(--mono)",
										}}
									>
										{copy.clustersEmpty}
									</div>
								) : (
									<div style={{ borderTop: "1px solid #1c2530" }}>
										{live.clusters.map((cluster, index) => {
											const rs = {
												low: { c: "#3fb950", bg: "rgba(63,185,80,0.09)" },
												medium: { c: "#d29922", bg: "rgba(210,153,34,0.09)" },
												high: { c: "#f85149", bg: "rgba(248,81,73,0.09)" },
											}[cluster.risk];

											return (
												<div
													key={cluster.id}
													style={{
														padding: "17px 0",
														borderBottom:
															index < live.clusters.length - 1
																? "1px solid #1c2530"
																: "none",
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
														<div style={{ flex: 1, minWidth: 0 }}>
															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: 10,
																	marginBottom: 5,
																}}
															>
																<span
																	style={{
																		display: "inline-block",
																		padding: "1px 8px",
																		borderRadius: 999,
																		fontSize: 9,
																		fontFamily: "var(--mono)",
																		letterSpacing: "0.05em",
																		background: rs.bg,
																		color: rs.c,
																	}}
																>
																	{cluster.risk}
																</span>
																<span
																	style={{
																		fontFamily: "var(--mono)",
																		fontSize: 14,
																		color: "#e6edf3",
																		fontWeight: 500,
																	}}
																>
																	{cluster.fingerprint}
																</span>
															</div>
															<div style={{ fontSize: 12, color: "#8b949e" }}>
																{cluster.hits} hits across {cluster.repoCount}{" "}
																repos · {cluster.authorCount} authors
															</div>
														</div>

														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: 14,
																flexShrink: 0,
															}}
														>
															<span
																style={{
																	fontSize: 11,
																	color: "#8b949e",
																	fontFamily: "var(--mono)",
																}}
															>
																{cluster.firstSeen}
															</span>
															<Link
																href={`/campaigns/${cluster.id}`}
																className="btn btn-ghost btn-sm"
															>
																{copy.investigate}
															</Link>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</main>
	);
}
