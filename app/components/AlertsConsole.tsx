import Link from "next/link";
import Image from "next/image";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { shell, frame, card, muted, toneColor } from "./console-styles";

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
	nav: SidebarItem[];
	activeNav: string;
	eyebrow: string;
	title: string;
	subtitle: string;
	backToOrg: string;
	testSend: string;
	metrics: {
		label: string;
		value: string;
		detail: string;
		tone?: "neutral" | "warn" | "danger" | "ok";
	}[];
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
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
};

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
									<Link
										href={copy.heroCtaHref}
										className="btn btn-primary btn-sm"
									>
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
									src="/funnel-circuit.png"
									alt="Alerts routing diagram"
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
										Routing fan-out
									</div>
									<div style={{ marginTop: 4 }}>
										Slack · Discord · Custom webhook
									</div>
								</div>
							</div>
						</header>

						{/* Metrics — same monospace row as org */}
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
									<h2
										style={{ margin: 0, fontSize: 18, letterSpacing: "-.02em" }}
									>
										{copy.channelsTitle}
									</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.channelsSubtitle}
									</div>
								</div>
							</header>
							<div style={{ ...card, overflow: "hidden" }}>
								{copy.channels.map((channel, i) => (
									<div
										key={channel.label}
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr auto",
											gap: 12,
											padding: "12px 16px",
											borderTop: i === 0 ? "none" : "1px solid #161e29",
											alignItems: "center",
										}}
									>
										<div>
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
														background: "rgba(63,185,80,0.10)",
														color: "#3fb950",
													}}
												>
													{channel.kind}
												</span>
												<span style={{ fontWeight: 600 }}>{channel.label}</span>
											</div>
											<div
												style={{
													...muted,
													fontSize: 11,
													marginTop: 4,
													fontFamily: "var(--mono)",
												}}
											>
												{channel.target}
											</div>
										</div>
										<div
											style={{
												fontSize: 11,
												color: "#8b949e",
												fontFamily: "var(--mono)",
											}}
										>
											last sent {channel.lastSent}
										</div>
										<span
											style={{
												fontSize: 11,
												padding: "2px 8px",
												borderRadius: 99,
												fontFamily: "var(--mono)",
												background:
													channel.status === "active"
														? "rgba(63,185,80,.12)"
														: channel.status === "paused"
															? "rgba(210,153,34,.12)"
															: "rgba(248,81,73,.12)",
												color: statusColor(channel.status),
											}}
										>
											{channel.status}
										</span>
									</div>
								))}
							</div>
						</section>

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
										style={{ margin: 0, fontSize: 18, letterSpacing: "-.02em" }}
									>
										{copy.rulesTitle}
									</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.rulesSubtitle}
									</div>
								</div>
							</header>
							<div style={{ ...card, overflow: "hidden" }}>
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
												["repo", "pattern", "channel", "threshold"] as const
											).map((k) => (
												<th
													key={k}
													style={{
														textAlign: k === "threshold" ? "right" : "left",
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
										{copy.rules.map((row, i) => (
											<tr
												key={`${row.repo}-${i}`}
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
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.pattern}
												</td>
												<td
													style={{
														padding: "11px 14px",
														color: "#c9d1d9",
													}}
												>
													{row.channel}
												</td>
												<td
													style={{
														padding: "11px 14px",
														textAlign: "right",
														fontFamily: "var(--mono)",
														color:
															row.threshold >= 80
																? "#f85149"
																: row.threshold >= 60
																	? "#d29922"
																	: "#3fb950",
													}}
												>
													≥ {row.threshold}
												</td>
											</tr>
										))}
									</tbody>
								</table>
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
									<h2
										style={{ margin: 0, fontSize: 18, letterSpacing: "-.02em" }}
									>
										{copy.logTitle}
									</h2>
									<div style={{ ...muted, fontSize: 12, marginTop: 4 }}>
										{copy.logSubtitle}
									</div>
								</div>
							</header>
							<div style={{ ...card, overflow: "hidden" }}>
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
													"when",
													"item",
													"score",
													"dest",
													"status",
													"latency",
												] as const
											).map((k) => (
												<th
													key={k}
													style={{
														textAlign:
															k === "score" || k === "latency"
																? "right"
																: "left",
														padding: "10px 14px",
														fontSize: 10,
														letterSpacing: ".14em",
														textTransform: "uppercase",
														fontWeight: 600,
														fontFamily: "var(--mono)",
													}}
												>
													{copy.logColumns[k]}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{copy.log.map((row, i) => (
											<tr key={i} style={{ borderBottom: "1px solid #161e29" }}>
												<td
													style={{
														padding: "11px 14px",
														fontFamily: "var(--mono)",
														color: "#8b949e",
													}}
												>
													{row.when}
												</td>
												<td
													style={{
														padding: "11px 14px",
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.item}
												</td>
												<td
													style={{
														padding: "11px 14px",
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
												</td>
												<td style={{ padding: "11px 14px", color: "#c9d1d9" }}>
													{row.dest}
												</td>
												<td
													style={{
														padding: "11px 14px",
														color: rowColor(row.status),
														fontFamily: "var(--mono)",
													}}
												>
													{row.status}
												</td>
												<td
													style={{
														padding: "11px 14px",
														textAlign: "right",
														color: "#8b949e",
														fontFamily: "var(--mono)",
													}}
												>
													{row.latency}
												</td>
											</tr>
										))}
									</tbody>
								</table>
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
								{copy.testSend}
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
