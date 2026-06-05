import Link from "next/link";
import Image from "next/image";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { shell, frame, card, muted, riskColor, riskBg, toneColor } from "./console-styles";

type ClusterRepo = {
	repo: string;
	commits: number;
	authors: string[];
	score: number;
};

type Campaign = {
	fingerprint: string;
	repoCount: number;
	hits: number;
	firstSeen: string;
	risk: "low" | "medium" | "high";
	repos: ClusterRepo[];
};

export type CampaignsConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	activeNav: string;
	eyebrow: string;
	title: string;
	subtitle: string;
	investigate: string;
	backToOrg: string;
	metrics: { label: string; value: string; detail: string; tone?: "neutral" | "warn" | "danger" | "ok" }[];
	clustersTitle: string;
	clustersSubtitle: string;
	clusters: Campaign[];
	scoreBoostTitle: string;
	scoreBoostBody: string;
	orgHref: string;
	accountHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
};

export default function CampaignsConsole({ copy }: { copy: CampaignsConsoleCopy }) {
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
								<div style={{ marginTop: 16, display: "flex", gap: 10 }}>
									<Link href={copy.heroCtaHref} className="btn btn-primary btn-sm">
										{copy.heroCta}
									</Link>
									<Link href={copy.orgHref} className="btn btn-ghost btn-sm">
										{copy.backToOrg}
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
									<div style={{ color: "#f0f6fc", fontWeight: 700, fontSize: 12 }}>
										Cross-repo fingerprint detector
									</div>
									<div style={{ marginTop: 4 }}>
										Sliding 6h window · per-owner scope
									</div>
								</div>
							</div>
						</header>

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
							{copy.metrics.map((metric, i) => (
								<div
									key={metric.label}
									style={{
										padding: "16px 18px",
										borderRight:
											i < copy.metrics.length - 1
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
									<h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-.02em" }}>
										{copy.clustersTitle}
									</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.clustersSubtitle}
									</div>
								</div>
							</header>
							<div style={{ display: "grid", gap: 14 }}>
								{copy.clusters.map((cluster) => {
									const c0 = riskColor[cluster.risk];
									return (
										<div
											key={cluster.fingerprint}
											style={{ ...card, padding: "16px 18px" }}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
													gap: 16,
													marginBottom: 14,
												}}
											>
												<div style={{ minWidth: 0, flex: 1 }}>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: 8,
															marginBottom: 6,
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
																background: riskBg[cluster.risk],
																color: c0,
															}}
														>
															{cluster.risk} risk
														</span>
														<span
															style={{
																fontSize: 11,
																color: "#8b949e",
																fontFamily: "var(--mono)",
															}}
														>
															{cluster.repoCount} repos · {cluster.hits} hits ·
															first seen {cluster.firstSeen}
														</span>
													</div>
													<div
														style={{
															fontFamily: "var(--mono)",
															fontSize: 14,
															color: "#f0f6fc",
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														{cluster.fingerprint}
													</div>
												</div>
												<Link
													href={copy.heroCtaHref}
													className="btn btn-ghost btn-sm"
												>
													{copy.investigate}
												</Link>
											</div>
											<div
												style={{
													display: "grid",
													gridTemplateColumns:
														"repeat(auto-fit, minmax(220px, 1fr))",
													gap: 10,
												}}
											>
												{cluster.repos.map((repo) => (
													<div
														key={repo.repo}
														style={{
															border: "1px solid #1c2530",
															borderRadius: 10,
															padding: "10px 12px",
															background: "#0a1018",
														}}
													>
														<div
															style={{
																fontFamily: "var(--mono)",
																fontSize: 12,
																color: "#c9d1d9",
															}}
														>
															{repo.repo}
														</div>
														<div
															style={{
																display: "flex",
																justifyContent: "space-between",
																marginTop: 4,
																fontFamily: "var(--mono)",
																fontSize: 11,
																color: "#8b949e",
															}}
														>
															<span>
																{repo.commits} commits ·{" "}
																{repo.authors.join(", ")}
															</span>
															<span
																style={{
																	color:
																		repo.score >= 80
																			? "#f85149"
																			: repo.score >= 60
																				? "#d29922"
																				: "#3fb950",
																}}
															>
																{repo.score}
															</span>
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</section>

						<section>
							<header
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-end",
									marginBottom: 12,
								}}
							>
								<div>
									<h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-.02em" }}>
										{copy.scoreBoostTitle}
									</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.scoreBoostBody}
									</div>
								</div>
							</header>
							<div
								style={{
									...card,
									padding: "16px 18px",
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr",
									gap: 12,
								}}
							>
								{(
									[
										{ tier: "Free", boost: "+0", tone: "neutral" as const },
										{ tier: "Pro", boost: "+25", tone: "warn" as const },
										{ tier: "Team", boost: "+25", tone: "danger" as const },
									]
								).map((row) => (
									<div
										key={row.tier}
										style={{
											padding: "12px 14px",
											border: "1px solid #1c2530",
											borderRadius: 10,
											background: "#0a1018",
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
											{row.tier}
										</div>
										<div
											style={{
												fontSize: 22,
												fontWeight: 800,
												fontFamily: "var(--mono)",
												color: toneColor[row.tone],
												marginTop: 4,
											}}
										>
											{row.boost}
										</div>
										<div
											style={{
												...muted,
												fontSize: 11,
												fontFamily: "var(--mono)",
											}}
										>
											applied to fingerprint matches
										</div>
									</div>
								))}
							</div>
						</section>

						<div
							style={{
								marginTop: 24,
								display: "flex",
								gap: 10,
								justifyContent: "flex-end",
							}}
						>
							<Link href={copy.accountHref} className="btn btn-ghost btn-sm">
								{copy.investigate}
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
