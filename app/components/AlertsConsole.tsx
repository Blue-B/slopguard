import Link from "next/link";

type Channel = {
	kind: "slack" | "discord" | "webhook";
	label: string;
	target: string;
	status: "active" | "paused" | "failed";
	lastSent: string;
};
type RouteRule = {
	repo: string;
	pattern: string;
	channel: string;
	threshold: number;
};
type SentRow = {
	when: string;
	item: string;
	score: number;
	dest: string;
	status: "delivered" | "failed" | "queued" | "retrying";
	latency: string;
};

export type AlertsConsoleCopy = {
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
	testSend: string;
	metrics: { label: string; value: string; detail: string }[];
	channelsTitle: string;
	channelsSubtitle: string;
	channels: Channel[];
	addChannel: string;
	rulesTitle: string;
	rulesSubtitle: string;
	columns: {
		repo: string;
		pattern: string;
		channel: string;
		threshold: string;
	};
	rules: RouteRule[];
	addRule: string;
	logTitle: string;
	logSubtitle: string;
	logColumns: {
		when: string;
		item: string;
		score: string;
		dest: string;
		status: string;
		latency: string;
	};
	log: SentRow[];
	note: string;
	orgHref: string;
	campaignsHref: string;
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

function statusColor(s: Channel["status"]): string {
	return s === "active" ? "#3fb950" : s === "paused" ? "#d29922" : "#f85149";
}
function rowColor(s: SentRow["status"]): string {
	return s === "delivered" ? "#3fb950" : s === "queued" ? "#d29922" : "#f85149";
}

export default function AlertsConsole({ copy }: { copy: AlertsConsoleCopy }) {
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
								<button type="button" className="btn btn-primary btn-sm">
									{copy.testSend}
								</button>
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
										<h2 style={{ margin: 0, fontSize: 18 }}>{copy.channelsTitle}</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.channelsSubtitle}
										</div>
									</div>
									<button type="button" className="btn btn-ghost btn-sm">
										{copy.addChannel}
									</button>
								</div>
								{copy.channels.map((channel) => (
									<div
										key={channel.label}
										style={{
											borderTop: "1px solid #26313d",
											padding: "12px 0",
											display: "flex",
											justifyContent: "space-between",
											gap: 12,
										}}
									>
										<div>
											<div style={{ fontWeight: 700 }}>
												{channel.label}{" "}
												<span
													style={{
														...muted,
														fontSize: 12,
														fontWeight: 500,
													}}
												>
													· {channel.kind}
												</span>
											</div>
											<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
												{channel.target}
											</div>
										</div>
										<div style={{ textAlign: "right" }}>
											<div style={{ color: statusColor(channel.status), fontSize: 12 }}>
												● {channel.status}
											</div>
											<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
												{channel.lastSent}
											</div>
										</div>
									</div>
								))}
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
										<h2 style={{ margin: 0, fontSize: 18 }}>{copy.rulesTitle}</h2>
										<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
											{copy.rulesSubtitle}
										</div>
									</div>
									<button type="button" className="btn btn-ghost btn-sm">
										{copy.addRule}
									</button>
								</div>
								<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
									<thead>
										<tr style={{ color: "#8b949e", borderBottom: "1px solid #26313d" }}>
											<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.columns.repo}</th>
											<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.columns.pattern}</th>
											<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.columns.channel}</th>
											<th style={{ textAlign: "right", padding: "9px 8px" }}>{copy.columns.threshold}</th>
										</tr>
									</thead>
									<tbody>
										{copy.rules.map((rule) => (
											<tr key={rule.repo + rule.pattern} style={{ borderBottom: "1px solid #18222e" }}>
												<td style={{ padding: "10px 8px", fontFamily: "var(--mono)" }}>{rule.repo}</td>
												<td style={{ padding: "10px 8px" }}>{rule.pattern}</td>
												<td style={{ padding: "10px 8px" }}>{rule.channel}</td>
												<td style={{ padding: "10px 8px", textAlign: "right", color: rule.threshold >= 80 ? "#f85149" : "#3fb950" }}>≥ {rule.threshold}</td>
											</tr>
										))}
									</tbody>
								</table>
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
									<h2 style={{ margin: 0, fontSize: 18 }}>{copy.logTitle}</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.logSubtitle}
									</div>
								</div>
								<Link href={copy.campaignsHref} className="btn btn-ghost btn-sm">
									{copy.backToOrg.replace(/Org|조직/g, "")}
								</Link>
							</div>
							<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
								<thead>
									<tr style={{ color: "#8b949e", borderBottom: "1px solid #26313d" }}>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.logColumns.when}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.logColumns.item}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.logColumns.score}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.logColumns.dest}</th>
										<th style={{ textAlign: "left", padding: "9px 8px" }}>{copy.logColumns.status}</th>
										<th style={{ textAlign: "right", padding: "9px 8px" }}>{copy.logColumns.latency}</th>
									</tr>
								</thead>
								<tbody>
									{copy.log.map((row) => (
										<tr key={row.when + row.item} style={{ borderBottom: "1px solid #18222e" }}>
											<td style={{ padding: "10px 8px", color: "#8b949e", fontFamily: "var(--mono)" }}>{row.when}</td>
											<td style={{ padding: "10px 8px" }}>{row.item}</td>
											<td style={{ padding: "10px 8px", color: row.score > 80 ? "#f85149" : "#3fb950" }}>{row.score}</td>
											<td style={{ padding: "10px 8px" }}>{row.dest}</td>
											<td style={{ padding: "10px 8px", color: rowColor(row.status) }}>● {row.status}</td>
											<td style={{ padding: "10px 8px", textAlign: "right", color: "#8b949e" }}>{row.latency}</td>
										</tr>
									))}
								</tbody>
							</table>
							<p style={{ ...muted, fontSize: 12, marginTop: 12 }}>{copy.note}</p>
						</section>
					</div>
				</div>
			</section>
		</main>
	);
}
