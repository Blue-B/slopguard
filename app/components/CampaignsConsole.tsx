import Link from "next/link";

type Metric = { label: string; value: string; detail: string };
type Campaign = {
	fingerprint: string;
	repos: number;
	hits: number;
	authors: number;
	first: string;
	risk: "High" | "Medium" | "Low";
	boost: number;
};
type ClusterRepo = {
	repo: string;
	commits: number;
	authors: string[];
	score: number;
};

export type CampaignsConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: string[];
	activeNav: string;
	eyebrow: string;
	title: string;
	subtitle: string;
	backToOrg: string;
	primaryAction: string;
	metrics: Metric[];
	clustersTitle: string;
	clustersSubtitle: string;
	riskHigh: string;
	riskMedium: string;
	riskLow: string;
	repoHeader: string;
	commitsHeader: string;
	authorsHeader: string;
	scoreHeader: string;
	clusters: { campaign: Campaign; repos: ClusterRepo[] }[];
	investigate: string;
	note: string;
	orgHref: string;
	alertsHref: string;
	accountHref: string;
};

const shell: React.CSSProperties = {
	maxWidth: 1200,
	margin: "28px auto 56px",
	padding: "0 20px",
};
const frame: React.CSSProperties = {
	border: "1px solid var(--border)",
	borderRadius: 20,
	overflow: "hidden",
	background: "#0b1016",
	boxShadow: "0 20px 70px rgba(0,0,0,.28)",
};
const card: React.CSSProperties = {
	border: "1px solid #26313d",
	borderRadius: 14,
	background: "#0f1620",
};
const muted: React.CSSProperties = { color: "#8b949e" };

function riskColor(r: Campaign["risk"]): string {
	return r === "High" ? "#f85149" : r === "Medium" ? "#d29922" : "#3fb950";
}

export default function CampaignsConsole({
	copy,
}: {
	copy: CampaignsConsoleCopy;
}) {
	return (
		<main style={shell}>
			<section style={frame}>
				<div style={{ display: "grid", gridTemplateColumns: "228px 1fr" }}>
					<aside
						style={{
							borderRight: "1px solid #26313d",
							background: "#111923",
							padding: 18,
							minHeight: 720,
						}}
					>
						<div style={{ marginBottom: 22 }}>
							<div style={{ fontWeight: 800, letterSpacing: "-.02em" }}>
								{copy.workspace}
							</div>
							<div style={{ ...muted, fontSize: 12, marginTop: 3 }}>
								{copy.workspaceSub}
							</div>
						</div>

						<nav style={{ display: "grid", gap: 4 }}>
							{copy.nav.map((item) => {
								const active = item === copy.activeNav;
								return (
									<div
										key={item}
										style={{
											borderRadius: 10,
											padding: "9px 10px",
											fontSize: 13,
											color: active ? "#f0f6fc" : "#8b949e",
											background: active ? "#17212d" : "transparent",
											border: active
												? "1px solid #2b3846"
												: "1px solid transparent",
										}}
									>
										{item}
									</div>
								);
							})}
						</nav>

						<div style={{ ...card, marginTop: 28, padding: 12, fontSize: 12 }}>
							<div style={{ color: "#f0f6fc", fontWeight: 700 }}>{copy.user}</div>
							<div style={{ ...muted, marginTop: 4 }}>{copy.entitlement}</div>
							<div style={{ marginTop: 10, color: "#3fb950" }}>{copy.connected}</div>
						</div>
					</aside>

					<div style={{ padding: 24 }}>
						<header
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: 18,
								marginBottom: 22,
							}}
						>
							<div>
								<div
									style={{
										color: "#3fb950",
										fontSize: 12,
										fontWeight: 800,
										letterSpacing: ".08em",
									}}
								>
									{copy.eyebrow}
								</div>
								<h1
									style={{
										margin: "8px 0 7px",
										fontSize: 32,
										letterSpacing: "-.04em",
									}}
								>
									{copy.title}
								</h1>
								<p style={{ ...muted, margin: 0, maxWidth: 680, lineHeight: 1.55 }}>
									{copy.subtitle}
								</p>
							</div>
							<div style={{ display: "flex", gap: 10 }}>
								<Link href={copy.orgHref} className="btn btn-ghost btn-sm">
									{copy.backToOrg}
								</Link>
								<Link href={copy.alertsHref} className="btn btn-primary btn-sm">
									{copy.primaryAction}
								</Link>
							</div>
						</header>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
								gap: 12,
							}}
						>
							{copy.metrics.map((metric) => (
								<div key={metric.label} style={{ ...card, padding: 15 }}>
									<div
										style={{
											fontSize: 27,
											fontWeight: 800,
											letterSpacing: "-.03em",
										}}
									>
										{metric.value}
									</div>
									<div style={{ color: "#f0f6fc", fontSize: 13, marginTop: 4 }}>
										{metric.label}
									</div>
									<div style={{ ...muted, fontSize: 12, marginTop: 6 }}>
										{metric.detail}
									</div>
								</div>
							))}
						</div>

						<section style={{ ...card, padding: 16, marginTop: 16 }}>
							<div style={{ marginBottom: 12 }}>
								<h2 style={{ margin: 0, fontSize: 18 }}>{copy.clustersTitle}</h2>
								<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
									{copy.clustersSubtitle}
								</div>
							</div>

							<div style={{ display: "grid", gap: 16 }}>
								{copy.clusters.map(({ campaign, repos }) => (
									<div
										key={campaign.fingerprint}
										style={{
											border: "1px solid #26313d",
											borderRadius: 12,
											background: "#0b1119",
											padding: 16,
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												gap: 12,
												marginBottom: 12,
											}}
										>
											<div>
												<div
													style={{
														...muted,
														fontSize: 12,
														fontFamily: "var(--mono)",
														marginBottom: 4,
													}}
												>
													prompt fingerprint
												</div>
												<div style={{ fontSize: 15, fontWeight: 600 }}>
													{campaign.fingerprint}
												</div>
												<div
													style={{
														...muted,
														fontSize: 12,
														marginTop: 6,
														display: "flex",
														gap: 16,
														flexWrap: "wrap",
													}}
												>
													<span>
														<strong style={{ color: "#f0f6fc" }}>
															{campaign.repos}
														</strong>{" "}
														repos
													</span>
													<span>
														<strong style={{ color: "#f0f6fc" }}>
															{campaign.hits}
														</strong>{" "}
														hits
													</span>
													<span>
														<strong style={{ color: "#f0f6fc" }}>
															{campaign.authors}
														</strong>{" "}
														authors
													</span>
													<span>{campaign.first}</span>
												</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<div style={{ color: riskColor(campaign.risk), fontSize: 12, fontWeight: 700 }}>
													● {campaign.risk} risk
												</div>
												<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
													+{campaign.boost} score boost
												</div>
												<button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>
													{copy.investigate}
												</button>
											</div>
										</div>

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
														color: "#8b949e",
														borderBottom: "1px solid #26313d",
													}}
												>
													<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.repoHeader}</th>
													<th style={{ textAlign: "right", padding: "9px 8px" }}>{copy.commitsHeader}</th>
													<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.authorsHeader}</th>
													<th style={{ textAlign: "right", padding: "9px 8px" }}>{copy.scoreHeader}</th>
												</tr>
											</thead>
											<tbody>
												{repos.map((repo) => (
													<tr
														key={repo.repo}
														style={{ borderBottom: "1px solid #18222e" }}
													>
														<td style={{ padding: "10px 8px", fontFamily: "var(--mono)" }}>{repo.repo}</td>
														<td style={{ padding: "10px 8px", textAlign: "right" }}>{repo.commits}</td>
														<td style={{ padding: "10px 8px", color: "#c9d1d9" }}>{repo.authors.join(", ")}</td>
														<td
															style={{
																padding: "10px 8px",
																textAlign: "right",
																color: repo.score > 60 ? "#f85149" : "#3fb950",
															}}
														>
															{repo.score}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								))}
							</div>

							<p style={{ ...muted, fontSize: 12, marginTop: 16 }}>{copy.note}</p>
						</section>
					</div>
				</div>
			</section>
		</main>
	);
}
