import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Org Dashboard — Team",
	description:
		"Org-wide slop activity, audit log, and cross-repo intelligence for Team plans.",
};

const navItems = ["Overview", "Dashboard", "Repos", "Alerts", "Campaigns", "Settings"];
const activity = [
	{
		item: "feat: add GitHub OAuth hardening",
		repo: "blue-b/slopguard",
		score: 78,
		status: "quarantined",
		owner: "Team review",
		when: "2h ago",
	},
	{
		item: "docs: update setup guide",
		repo: "blue-b/docs",
		score: 31,
		status: "cleared",
		owner: "@blue-b",
		when: "yesterday",
	},
	{
		item: "chore: dependency refresh",
		repo: "blue-b/api",
		score: 64,
		status: "watching",
		owner: "Policy bot",
		when: "2d ago",
	},
];

export default function OrgDashboard() {
	return (
		<>
			<MarketingNav lang="en" enHref="/org" koHref="/ko/org" />

			<main
				style={{
					maxWidth: 1180,
					margin: "28px auto 56px",
					padding: "0 20px",
				}}
			>
				<section
					style={{
						border: "1px solid var(--border)",
						borderRadius: 24,
						overflow: "hidden",
						background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)",
						boxShadow: "0 24px 90px rgba(0,0,0,.35)",
					}}
				>
					<div style={{ display: "grid", gridTemplateColumns: "240px 1fr" }}>
						<aside
							style={{
								borderRight: "1px solid #30363d",
								padding: 18,
								background: "#161b22",
								minHeight: 720,
							}}
						>
							<div style={{ color: "#3fb950", fontWeight: 800, marginBottom: 18 }}>
								SlopGuard Team
							</div>
							<nav style={{ display: "grid", gap: 6 }}>
								{navItems.map((item) => (
									<div
										key={item}
										style={{
											borderRadius: 10,
											padding: "9px 10px",
											fontSize: 13,
											color: item === "Dashboard" ? "#f0f6fc" : "#8b949e",
											background: item === "Dashboard" ? "#21262d" : "transparent",
										}}
									>
										{item}
									</div>
								))}
							</nav>
							<div
								style={{
									marginTop: 28,
									padding: 12,
									border: "1px solid #30363d",
									borderRadius: 14,
									color: "#8b949e",
									fontSize: 12,
								}}
							>
								<div style={{ color: "#f0f6fc", fontWeight: 700 }}>Blue-B</div>
								<div>Team entitlement active</div>
							</div>
						</aside>

						<div style={{ padding: 24 }}>
							<header
								style={{
									display: "flex",
									justifyContent: "space-between",
									gap: 16,
									alignItems: "flex-start",
									marginBottom: 22,
								}}
							>
								<div>
									<span className="eyebrow">TEAM CONSOLE</span>
									<h1 style={{ margin: "8px 0 6px", fontSize: 34 }}>Org Dashboard</h1>
									<p style={{ margin: 0, color: "#8b949e" }}>
										Cross-repo quarantine, campaign, and reviewer activity in one panel.
									</p>
								</div>
								<div style={{ display: "flex", gap: 10 }}>
									<Link href="/account" className="btn btn-ghost btn-sm">
										Account
									</Link>
									<Link href="/alerts" className="btn btn-primary btn-sm">
										Alerts
									</Link>
								</div>
							</header>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
									gap: 12,
									marginBottom: 18,
								}}
							>
								{[
									["142", "Quarantined", "#f85149"],
									["89", "Cleared", "#3fb950"],
									["17", "Repos", "#58a6ff"],
									["3", "Campaigns", "#d29922"],
								].map(([value, label, color]) => (
									<div
										key={label}
										style={{
											border: "1px solid #30363d",
											borderRadius: 16,
											background: "#0d1117",
											padding: 16,
										}}
									>
										<div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
										<div style={{ color: "#8b949e", fontSize: 13 }}>{label}</div>
									</div>
								))}
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "1.4fr .8fr", gap: 16 }}>
								<section className="card" style={{ background: "#0d1117" }}>
									<div className="card-head">
										<h3>Recent activity</h3>
										<span className="card-meta">Live-style Team panel</span>
									</div>
									<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
										<thead>
											<tr style={{ color: "#8b949e", borderBottom: "1px solid #30363d" }}>
												<th style={{ textAlign: "left", padding: 10 }}>Item</th>
												<th style={{ textAlign: "left", padding: 10 }}>Repo</th>
												<th style={{ textAlign: "left", padding: 10 }}>Score</th>
												<th style={{ textAlign: "left", padding: 10 }}>Status</th>
												<th style={{ textAlign: "left", padding: 10 }}>Owner</th>
												<th style={{ textAlign: "left", padding: 10 }}>When</th>
											</tr>
										</thead>
										<tbody>
											{activity.map((row) => (
												<tr key={row.item} style={{ borderBottom: "1px solid #21262d" }}>
													<td style={{ padding: 10, fontFamily: "var(--mono)" }}>{row.item}</td>
													<td style={{ padding: 10 }}>{row.repo}</td>
													<td style={{ padding: 10, color: row.score > 60 ? "#f85149" : "#3fb950" }}>{row.score}/100</td>
													<td style={{ padding: 10 }}>{row.status}</td>
													<td style={{ padding: 10 }}>{row.owner}</td>
													<td style={{ padding: 10, color: "#8b949e" }}>{row.when}</td>
												</tr>
											))}
										</tbody>
									</table>
								</section>

								<section className="card" style={{ background: "#0d1117" }}>
									<div className="card-head">
										<h3>Campaign radar</h3>
									</div>
									{[
										["Auth flow burst", "7 repos", "High"],
										["Docs churn", "3 repos", "Low"],
										["Dependency wave", "5 repos", "Medium"],
									].map(([name, repos, risk]) => (
										<div
											key={name}
											style={{
												border: "1px solid #30363d",
												borderRadius: 12,
												padding: 12,
												marginBottom: 10,
											}}
										>
											<div style={{ fontWeight: 700 }}>{name}</div>
											<div style={{ color: "#8b949e", fontSize: 12 }}>{repos} • {risk} risk</div>
										</div>
									))}
								</section>
							</div>
						</div>
					</div>
				</section>
			</main>

			<SiteFooter lang="en" />
		</>
	);
}
