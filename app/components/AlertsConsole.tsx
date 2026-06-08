"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsoleHero, ConsoleShell } from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";

type Channel = {
	id: string;
	kind: "slack" | "discord" | "webhook";
	label: string;
	target: string;
	status: "active" | "paused" | "failed";
	lastSent: string | null;
	lastLatencyMs: number | null;
};
type RouteRule = {
	id: string;
	repo: string;
	pattern: string;
	channel: string;
	threshold: number;
};
type SentRow = {
	id: string;
	when: string;
	item: string;
	score: number;
	dest: string;
	channelKind: "slack" | "discord" | "webhook";
	status: "delivered" | "failed" | "queued" | "retrying";
	latency: string;
};

type StateResponse = {
	owner: string;
	channels: Channel[];
	rules: RouteRule[];
	sent: SentRow[];
};

export type AlertsConsoleCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	metricLabels: { channels: string; rules: string; delivered: string; latency: string };
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
	channelsTitle: string;
	channelsSubtitle: string;
	channelsEmpty: string;
	addChannelTitle: string;
	addChannelBody: string;
	addChannelKindLabel: string;
	addChannelLabelLabel: string;
	addChannelTargetLabel: string;
	addChannelCta: string;
	addChannelBusy: string;
	removeChannel: string;
	channelsRemovedFlash: string;
	rulesTitle: string;
	rulesSubtitle: string;
	rulesEmpty: string;
	rulesColumns: {
		repo: string;
		pattern: string;
		channel: string;
		threshold: string;
	};
	addRuleTitle: string;
	addRuleBody: string;
	addRuleRepoLabel: string;
	addRulePatternLabel: string;
	addRuleChannelLabel: string;
	addRuleThresholdLabel: string;
	addRuleCta: string;
	removeRule: string;
	logTitle: string;
	logSubtitle: string;
	logEmpty: string;
	logColumns: {
		when: string;
		item: string;
		score: string;
		dest: string;
		status: string;
		latency: string;
	};
};

function statusColor(s: Channel["status"]): string {
	return s === "active" ? "#3fb950" : s === "paused" ? "#d29922" : "#f85149";
}
function rowColor(s: SentRow["status"]): string {
	return s === "delivered"
		? "#3fb950"
		: s === "queued"
			? "#d29922"
			: s === "retrying"
				? "#d29922"
				: "#f85149";
}

export default function AlertsConsole({ copy }: { copy: AlertsConsoleCopy }) {
	const [data, setData] = useState<StateResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [flash, setFlash] = useState<string>("");

	// Add channel form state
	const [addKind, setAddKind] = useState<"slack" | "discord" | "webhook">(
		"slack",
	);
	const [addLabel, setAddLabel] = useState("");
	const [addTarget, setAddTarget] = useState("");
	const [addBusy, setAddBusy] = useState(false);

	// Add rule form state
	const [addRuleRepo, setAddRuleRepo] = useState("");
	const [addRulePattern, setAddRulePattern] = useState("");
	const [addRuleChannel, setAddRuleChannel] = useState("");
	const [addRuleThreshold, setAddRuleThreshold] = useState(60);
	const [addRuleBusy, setAddRuleBusy] = useState(false);

	const [busyChannel, setBusyChannel] = useState<string | null>(null);
	const [busyRule, setBusyRule] = useState<string | null>(null);

	async function load() {
		try {
			const res = await fetch("/api/alerts/state", { cache: "no-store" });
			if (!res.ok) {
				setError(`HTTP ${res.status}`);
				return;
			}
			setData((await res.json()) as StateResponse);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load alerts state");
		}
	}

	async function addChannel(e: { preventDefault: () => void }) {
		e.preventDefault();
		if (!addLabel.trim() || !addTarget.trim()) return;
		setAddBusy(true);
		try {
			const res = await fetch("/api/alerts/channels", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					kind: addKind,
					label: addLabel.trim(),
					target: addTarget.trim(),
				}),
			});
			if (!res.ok) {
				setError(`Add channel failed: HTTP ${res.status}`);
				return;
			}
			setAddLabel("");
			setAddTarget("");
			setFlash(`Channel added`);
			setTimeout(() => setFlash(""), 2400);
			await load();
		} finally {
			setAddBusy(false);
		}
	}

	async function removeChannel(id: string, label: string) {
		setBusyChannel(id);
		try {
			const res = await fetch(`/api/alerts/channels/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				setError(`Remove failed: HTTP ${res.status}`);
				return;
			}
			setFlash(`${copy.channelsRemovedFlash}: ${label}`);
			setTimeout(() => setFlash(""), 2400);
			await load();
		} finally {
			setBusyChannel(null);
		}
	}

	async function addRule(e: { preventDefault: () => void }) {
		e.preventDefault();
		if (
			!addRuleRepo.trim() ||
			!addRulePattern.trim() ||
			!addRuleChannel ||
			!addRuleThreshold
		)
			return;
		setAddRuleBusy(true);
		try {
			const res = await fetch("/api/alerts/rules", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					repo: addRuleRepo.trim(),
					pattern: addRulePattern.trim(),
					channelId: addRuleChannel,
					threshold: addRuleThreshold,
				}),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				setError(
					`Add rule failed: HTTP ${res.status} ${body.error ?? ""}`.trim(),
				);
				return;
			}
			setAddRuleRepo("");
			setAddRulePattern("");
			setFlash(`Routing rule added`);
			setTimeout(() => setFlash(""), 2400);
			await load();
		} finally {
			setAddRuleBusy(false);
		}
	}

	async function removeRule(id: string) {
		setBusyRule(id);
		try {
			const res = await fetch(`/api/alerts/rules/${id}`, { method: "DELETE" });
			if (!res.ok) {
				setError(`Remove rule failed: HTTP ${res.status}`);
				return;
			}
			setFlash("Routing rule removed");
			setTimeout(() => setFlash(""), 2400);
			await load();
		} finally {
			setBusyRule(null);
		}
	}

	useEffect(() => {
		load();
		const t = setInterval(load, 15_000);
		return () => clearInterval(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isLoading = data === null && error === null;

	const metrics = useMemo(() => {
		const channels = data?.channels ?? [];
		const sent = data?.sent ?? [];
		const rules = data?.rules ?? [];
		const failed = channels.filter((c) => c.status === "failed").length;
		const delivered = sent.filter((s) => s.status === "delivered").length;
		const avgLatency =
			sent.length > 0
				? Math.round(
						(sent
							.map((s) => parseFloat(s.latency) || 0)
							.reduce((a, b) => a + b, 0) /
							sent.length) *
							100,
					) / 100
				: 0;
		return [
			{
				label: copy.metricLabels.channels,
				value: String(channels.length),
				tone: failed > 0 ? ("warn" as const) : ("ok" as const),
			},
			{
				label: copy.metricLabels.rules,
				value: String(rules.length),
				tone: "neutral" as const,
			},
			{
				label: copy.metricLabels.delivered,
				value: String(delivered),
				tone: delivered > 0 ? ("ok" as const) : ("neutral" as const),
			},
			{
				label: copy.metricLabels.latency,
				value: avgLatency > 0 ? `${avgLatency.toFixed(2)}s` : "-",
				tone: avgLatency >= 2 ? ("warn" as const) : ("ok" as const),
			},
		];
	}, [data, copy.metricLabels]);

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-signal.png"
				imageAlt="Alert routing fan-out"
				plateLabel="routing fan-out"
				connected={copy.connected}
				metrics={metrics}
			/>
			<div className="console-section">

					{flash && (
						<div
							style={{
								padding: "10px 0",
								color: "#3fb950",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{flash}
						</div>
					)}
					{error && (
						<div
							style={{
								padding: "10px 0",
								color: "#f85149",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{error}
						</div>
					)}

					{isLoading ? (
						<div
							style={{
								padding: "48px 0",
								textAlign: "center",
								color: "#8b949e",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{copy.loading}
						</div>
					) : (
						<>
							{/* Channels section */}
							<section style={{ padding: "20px 0 0" }}>
								<header style={{ marginBottom: 12 }}>
									<h2
										style={{
											margin: 0,
											fontSize: 15,
											letterSpacing: "-.02em",
										}}
									>
										{copy.channelsTitle}
									</h2>
									<div
										style={{
											color: "#8b949e",
											fontSize: 12,
											marginTop: 4,
										}}
									>
										{copy.channelsSubtitle}
									</div>
								</header>
								{data!.channels.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										{copy.channelsEmpty}
									</div>
								) : (
									<div>
										{data!.channels.map((channel) => (
											<div
												key={channel.id}
												style={{
													display: "grid",
													gridTemplateColumns: "90px 1fr 1fr auto auto",
													gap: 12,
													padding: "12px 4px",
													borderBottom: "1px solid #161e29",
													fontSize: 13,
													alignItems: "center",
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
														textAlign: "center",
													}}
												>
													{channel.kind}
												</span>
												<span style={{ fontWeight: 600, color: "#c9d1d9" }}>
													{channel.label}
												</span>
												<span
													style={{
														color: "#8b949e",
														fontFamily: "var(--mono)",
														fontSize: 12,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{channel.target}
												</span>
												<span
													style={{
														fontSize: 10,
														padding: "2px 7px",
														borderRadius: 99,
														fontFamily: "var(--mono)",
														background: `${statusColor(channel.status)}20`,
														color: statusColor(channel.status),
														textAlign: "center",
													}}
												>
													{channel.status}
												</span>
												<button
													type="button"
													className="btn btn-ghost btn-sm"
													disabled={busyChannel === channel.id}
													onClick={() =>
														removeChannel(channel.id, channel.label)
													}
												>
													{busyChannel === channel.id
														? "..."
														: copy.removeChannel}
												</button>
											</div>
										))}
									</div>
								)}

								{/* Add channel form - real */}
								<form
									onSubmit={addChannel}
									style={{
										marginTop: 20,
										padding: "16px 0",
										borderTop: "1px solid #1c2530",
										borderBottom: "1px solid #1c2530",
									}}
								>
									<div
										style={{
											fontSize: 12,
											color: "#8b949e",
											fontFamily: "var(--mono)",
											marginBottom: 12,
										}}
									>
										{copy.addChannelTitle}
									</div>
									<div
										className="alerts-form-grid"
										style={{
											display: "grid",
											gridTemplateColumns: "120px 1fr 2fr auto",
											gap: 8,
											alignItems: "center",
										}}
									>
										<select
											aria-label={copy.addChannelKindLabel}
											value={addKind}
											onChange={(e) =>
												setAddKind(e.target.value as typeof addKind)
											}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
											}}
										>
											<option value="slack">slack</option>
											<option value="discord">discord</option>
											<option value="webhook">webhook</option>
										</select>
										<input
											aria-label={copy.addChannelLabelLabel}
											placeholder="Label (e.g. Security alerts)"
											value={addLabel}
											onChange={(e) => setAddLabel(e.target.value)}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontSize: 12,
											}}
										/>
										<input
											aria-label={copy.addChannelTargetLabel}
											placeholder={
												addKind === "slack"
													? "https://hooks.slack.com/services/..."
													: addKind === "discord"
														? "https://discord.com/api/webhooks/..."
														: "https://your-endpoint.example.com/inbound"
											}
											value={addTarget}
											onChange={(e) => setAddTarget(e.target.value)}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
											}}
										/>
										<button
											type="button"
											onClick={addChannel}
											className="btn btn-primary btn-sm"
											disabled={
												addBusy || !addLabel.trim() || !addTarget.trim()
											}
										>
											{addBusy ? copy.addChannelBusy : copy.addChannelCta}
										</button>
									</div>
								</form>
							</section>

							{/* Routing rules section */}
							<section style={{ padding: "20px 0 0" }}>
								<header style={{ marginBottom: 12 }}>
									<h2
										style={{
											margin: 0,
											fontSize: 15,
											letterSpacing: "-.02em",
										}}
									>
										{copy.rulesTitle}
									</h2>
									<div
										style={{
											color: "#8b949e",
											fontSize: 12,
											marginTop: 4,
										}}
									>
										{copy.rulesSubtitle}
									</div>
								</header>
								{data!.rules.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										{copy.rulesEmpty}
									</div>
								) : (
									<div>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr 1fr 80px 80px",
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
											<span>{copy.rulesColumns.repo}</span>
											<span>{copy.rulesColumns.pattern}</span>
											<span>{copy.rulesColumns.channel}</span>
											<span style={{ textAlign: "right" }}>
												{copy.rulesColumns.threshold}
											</span>
											<span></span>
										</div>
										{data!.rules.map((row) => (
											<div
												key={row.id}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr 1fr 1fr 80px 80px",
													gap: 12,
													padding: "12px 4px",
													borderBottom: "1px solid #161e29",
													fontSize: 13,
													alignItems: "center",
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
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.pattern}
												</span>
												<span style={{ color: "#c9d1d9" }}>{row.channel}</span>
												<span
													style={{
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
												</span>
												<button
													type="button"
													className="btn btn-ghost btn-sm"
													disabled={busyRule === row.id}
													onClick={() => removeRule(row.id)}
												>
													{busyRule === row.id ? "..." : copy.removeRule}
												</button>
											</div>
										))}
									</div>
								)}

								{/* Add rule form - real */}
								<form
									onSubmit={addRule}
									style={{
										marginTop: 20,
										padding: "16px 0",
										borderTop: "1px solid #1c2530",
										borderBottom: "1px solid #1c2530",
									}}
								>
									<div
										style={{
											fontSize: 12,
											color: "#8b949e",
											fontFamily: "var(--mono)",
											marginBottom: 12,
										}}
									>
										{copy.addRuleTitle}
									</div>
									<div
										className="alerts-form-grid"
										style={{
											display: "grid",
											gridTemplateColumns: "1.4fr 1fr 1fr 90px auto",
											gap: 8,
											alignItems: "center",
										}}
									>
										<input
											aria-label={copy.addRuleRepoLabel}
											placeholder="owner/repo"
											value={addRuleRepo}
											onChange={(e) => setAddRuleRepo(e.target.value)}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
											}}
										/>
										<input
											aria-label={copy.addRulePatternLabel}
											placeholder="pattern (e.g. auth_surface)"
											value={addRulePattern}
											onChange={(e) => setAddRulePattern(e.target.value)}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
											}}
										/>
										<select
											aria-label={copy.addRuleChannelLabel}
											value={addRuleChannel}
											onChange={(e) => setAddRuleChannel(e.target.value)}
											disabled={data!.channels.length === 0}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
											}}
										>
											<option value="">channel…</option>
											{data!.channels.map((c) => (
												<option key={c.id} value={c.id}>
													{c.label} ({c.kind})
												</option>
											))}
										</select>
										<input
											aria-label={copy.addRuleThresholdLabel}
											type="number"
											min={1}
											max={100}
											value={addRuleThreshold}
											onChange={(e) =>
												setAddRuleThreshold(parseInt(e.target.value, 10) || 60)
											}
											style={{
												background: "#0a1018",
												border: "1px solid #1c2530",
												borderRadius: 8,
												padding: "8px 10px",
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												fontSize: 12,
												textAlign: "right",
											}}
										/>
										<button
											type="button"
											onClick={addRule}
											className="btn btn-primary btn-sm"
											disabled={
												addRuleBusy ||
												!addRuleRepo.trim() ||
												!addRulePattern.trim() ||
												!addRuleChannel
											}
										>
											{addRuleBusy ? "..." : copy.addRuleCta}
										</button>
									</div>
								</form>
							</section>

							{/* Sent log */}
							<section style={{ padding: "20px 0 0" }}>
								<header style={{ marginBottom: 8 }}>
									<h2
										style={{
											margin: 0,
											fontSize: 15,
											letterSpacing: "-.02em",
										}}
									>
										{copy.logTitle}
									</h2>
									<div
										style={{
											color: "#8b949e",
											fontSize: 12,
											marginTop: 4,
										}}
									>
										{copy.logSubtitle}
									</div>
								</header>
								{data!.sent.length === 0 ? (
									<div
										style={{
											padding: "24px 0",
											color: "#8b949e",
											fontSize: 12,
											fontFamily: "var(--mono)",
										}}
									>
										{copy.logEmpty}
									</div>
								) : (
									<div>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "120px 1fr 60px 1fr 90px 70px",
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
											<span>{copy.logColumns.when}</span>
											<span>{copy.logColumns.item}</span>
											<span style={{ textAlign: "right" }}>
												{copy.logColumns.score}
											</span>
											<span>{copy.logColumns.dest}</span>
											<span>{copy.logColumns.status}</span>
											<span style={{ textAlign: "right" }}>
												{copy.logColumns.latency}
											</span>
										</div>
										{data!.sent.map((row) => (
											<div
												key={row.id}
												style={{
													display: "grid",
													gridTemplateColumns: "120px 1fr 60px 1fr 90px 70px",
													gap: 12,
													padding: "12px 4px",
													borderBottom: "1px solid #161e29",
													fontSize: 13,
												}}
											>
												<span
													style={{
														fontFamily: "var(--mono)",
														color: "#8b949e",
													}}
												>
													{row.when}
												</span>
												<span
													style={{
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
													}}
												>
													{row.item}
												</span>
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
												<span style={{ color: "#c9d1d9" }}>{row.dest}</span>
												<span
													style={{
														fontFamily: "var(--mono)",
														color: rowColor(row.status),
													}}
												>
													{row.status}
												</span>
												<span
													style={{
														textAlign: "right",
														color: "#8b949e",
														fontFamily: "var(--mono)",
													}}
												>
													{row.latency}
												</span>
											</div>
										))}
									</div>
								)}
							</section>
						</>
					)}
			</div>
		</ConsoleShell>
	);
}
