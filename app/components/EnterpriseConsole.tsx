import Link from "next/link";

type Metric = { label: string; value: string; detail: string };
type AuditEntry = {
	when: string;
	actor: string;
	action: string;
	target: string;
	source: "SSO" | "API" | "Admin";
};
type Integration = {
	name: string;
	status: "connected" | "pending" | "available";
	scope: string;
};

export type EnterpriseConsoleCopy = {
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
	contactSales: string;
	accountHref: string;
	orgHref: string;
	alertsHref: string;
	campaignsHref: string;
	metrics: Metric[];
	ssoTitle: string;
	ssoSubtitle: string;
	ssoStatus: string;
	ssoProvider: string;
	ssoLastSync: string;
	ssoConfigure: string;
	auditTitle: string;
	auditSubtitle: string;
	auditColumns: { when: string; actor: string; action: string; target: string; source: string };
	audit: AuditEntry[];
	exportAudit: string;
	integrationsTitle: string;
	integrationsSubtitle: string;
	connect: string;
	integrations: Integration[];
	supportTitle: string;
	supportSubtitle: string;
	supportSla: string;
	supportHours: string;
	supportAccountMgr: string;
	note: string;
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

function intStatusColor(s: Integration["status"]): string {
	return s === "connected" ? "#3fb950" : s === "pending" ? "#d29922" : "#8b949e";
}

export default function EnterpriseConsole({
	copy,
}: {
	copy: EnterpriseConsoleCopy;
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
							<div style={{ marginTop: 10, color: "#a371f7" }}>{copy.connected}</div>
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
										color: "#a371f7",
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
								<a
									href="https://github.com/Blue-B/slopguard/issues/new?labels=enterprise&title=Enterprise%20inquiry"
									className="btn btn-primary btn-sm"
								>
									{copy.contactSales}
								</a>
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

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 16,
								marginTop: 16,
							}}
						>
							<section style={{ ...card, padding: 16 }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<div>
										<h2 style={{ margin: 0, fontSize: 18 }}>{copy.ssoTitle}</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.ssoSubtitle}
										</div>
									</div>
									<button type="button" className="btn btn-ghost btn-sm">
										{copy.ssoConfigure}
									</button>
								</div>
								<div
									style={{
										borderTop: "1px solid #26313d",
										padding: "12px 0",
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 12,
									}}
								>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.ssoStatus}</div>
										<div style={{ color: "#3fb950", fontWeight: 700, marginTop: 4 }}>
											● Active
										</div>
									</div>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.ssoProvider}</div>
										<div style={{ color: "#f0f6fc", fontWeight: 700, marginTop: 4 }}>
											Okta (SAML 2.0)
										</div>
									</div>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.ssoLastSync}</div>
										<div style={{ color: "#f0f6fc", fontWeight: 700, marginTop: 4 }}>
											3 minutes ago
										</div>
									</div>
								</div>
							</section>

							<section style={{ ...card, padding: 16 }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<div>
										<h2 style={{ margin: 0, fontSize: 18 }}>{copy.supportTitle}</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.supportSubtitle}
										</div>
									</div>
								</div>
								<div
									style={{
										borderTop: "1px solid #26313d",
										padding: "12px 0",
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: 12,
									}}
								>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.supportSla}</div>
										<div style={{ color: "#f0f6fc", fontWeight: 700, marginTop: 4 }}>
											1h P1 / 4h P3
										</div>
									</div>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.supportHours}</div>
										<div style={{ color: "#f0f6fc", fontWeight: 700, marginTop: 4 }}>
											24×7
										</div>
									</div>
									<div>
										<div style={{ ...muted, fontSize: 12 }}>{copy.supportAccountMgr}</div>
										<div style={{ color: "#f0f6fc", fontWeight: 700, marginTop: 4 }}>
											Assigned
										</div>
									</div>
								</div>
							</section>
						</div>

						<section style={{ ...card, padding: 16, marginTop: 16 }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: 12,
								}}
							>
								<div>
									<h2 style={{ margin: 0, fontSize: 18 }}>{copy.auditTitle}</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.auditSubtitle}
									</div>
								</div>
								<div style={{ display: "flex", gap: 8 }}>
									<Link href={copy.alertsHref} className="btn btn-ghost btn-sm">
										{copy.exportAudit}
									</Link>
								</div>
							</div>
							<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
								<thead>
									<tr style={{ color: "#8b949e", borderBottom: "1px solid #26313d" }}>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.auditColumns.when}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.auditColumns.actor}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.auditColumns.action}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.auditColumns.target}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.auditColumns.source}</th>
									</tr>
								</thead>
								<tbody>
									{copy.audit.map((row, i) => (
										<tr key={i} style={{ borderBottom: "1px solid #18222e" }}>
											<td style={{ padding: "10px 8px", color: "#8b949e", fontFamily: "var(--mono)" }}>{row.when}</td>
											<td style={{ padding: "10px 8px" }}>{row.actor}</td>
											<td style={{ padding: "10px 8px" }}>{row.action}</td>
											<td style={{ padding: "10px 8px", color: "#c9d1d9" }}>{row.target}</td>
											<td style={{ padding: "10px 8px", color: row.source === "SSO" ? "#a371f7" : row.source === "Admin" ? "#3fb950" : "#d29922" }}>{row.source}</td>
										</tr>
									))}
								</tbody>
							</table>
						</section>

						<section style={{ ...card, padding: 16, marginTop: 16 }}>
							<div style={{ marginBottom: 12 }}>
								<h2 style={{ margin: 0, fontSize: 18 }}>{copy.integrationsTitle}</h2>
								<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
									{copy.integrationsSubtitle}
								</div>
							</div>
							{copy.integrations.map((integration) => (
								<div
									key={integration.name}
									style={{
										borderTop: "1px solid #26313d",
										padding: "12px 0",
										display: "flex",
										justifyContent: "space-between",
										gap: 12,
									}}
								>
									<div>
										<div style={{ fontWeight: 700 }}>{integration.name}</div>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{integration.scope}
										</div>
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
										<span
											style={{ color: intStatusColor(integration.status), fontSize: 12 }}
										>
											● {integration.status}
										</span>
										{integration.status !== "connected" && (
											<button type="button" className="btn btn-ghost btn-sm">
												{copy.connect}
											</button>
										)}
									</div>
								</div>
							))}
							<p style={{ ...muted, fontSize: 12, marginTop: 16 }}>{copy.note}</p>
						</section>
					</div>
				</div>
			</section>
		</main>
	);
}
