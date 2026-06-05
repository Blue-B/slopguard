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

type Metric = { label: string; value: string; detail: string; tone?: "neutral" | "warn" | "danger" | "ok" };
type QueueRow = {
	item: string;
	repo: string;
	score: number;
	status: string;
	owner: string;
	age: string;
};
type Campaign = {
	name: string;
	fingerprint: string;
	repos: number;
	risk: "low" | "medium" | "high";
	commits: number;
	authors: number;
	delta: number; // 0-100 bar width
};

export type OrgDashboardConsoleCopy = {
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
	account: string;
	alerts: string;
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
	campaignTitle: string;
	campaignSubtitle: string;
	campaigns: Campaign[];
	policyTitle: string;
	policyBody: string;
	coverageLabel: string;
	coveragePercent: number;
	coverageRepos: string;
	coverageMissing: string;
	accountHref: string;
	alertsHref: string;
	campaignsHref: string;
	policyHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
};

export default function OrgDashboardConsole({
	copy,
}: {
	copy: OrgDashboardConsoleCopy;
}) {
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
						{/* Hero strip — uses existing radar-circuit.png so the console matches the
						    marketing site tone, and gives the page a real visual instead of a card wall. */}
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
									<div style={{ color: "#f0f6fc", fontWeight: 700, fontSize: 12 }}>
										Live campaign feed
									</div>
									<div style={{ marginTop: 4 }}>
										3 active clusters · updated 12s ago
									</div>
								</div>
							</div>
						</header>

						{/* Metrics row — mono numbers, no card box on the highest density dial */}
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

						{/* Quarantine queue */}
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
									{copy.updated}
								</div>
							</header>
							<div
								style={{
									...card,
									overflow: "hidden",
								}}
							>
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
											{(["item", "repo", "score", "status", "owner", "age"] as const).map(
												(k) => (
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
												),
											)}
										</tr>
									</thead>
									<tbody>
										{copy.queue.map((row) => (
											<tr
												key={row.item}
												style={{ borderBottom: "1px solid #161e29" }}
											>
												<td
													style={{
														padding: "11px 14px",
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.item}
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
																	: "rgba(63,185,80,.12)",
															color:
																row.status === "Quarantined"
																	? "#f85149"
																	: "#3fb950",
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
							</div>
						</section>

						{/* Campaign radar — real bar chart visualization */}
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
									href={copy.campaignsHref}
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
								{copy.campaigns.map((c) => {
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
								})}
							</div>
						</section>

						{/* Policy coverage — real progress bar, mono numbers */}
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
									href={copy.policyHref}
									style={{
										fontSize: 12,
										color: "#3fb950",
										textDecoration: "none",
										fontFamily: "var(--mono)",
									}}
								>
									{copy.coverageRepos}
								</Link>
							</header>
							<div
								style={{
									...card,
									padding: "16px 18px",
								}}
							>
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
										{copy.coveragePercent}% of {copy.coverageRepos}
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
											width: `${copy.coveragePercent}%`,
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
									{copy.coverageMissing}
								</div>
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
								{copy.account}
							</Link>
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
