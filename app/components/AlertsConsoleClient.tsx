"use client";

import { useState, useTransition } from "react";

type Channel = {
	id: string;
	kind: "slack" | "discord" | "webhook";
	label: string;
	target: string;
	status: "active" | "paused" | "failed";
	lastSent?: string;
};

type SentAlert = {
	id: string;
	when: string;
	item: string;
	score: number;
	dest: string;
	status: "delivered" | "failed" | "queued" | "retrying";
	latency: string;
};

type Props = {
	channels: Channel[];
	sentAlerts: SentAlert[];
	addChannelLabel: string;
	channelKindLabel: string;
	targetLabel: string;
	kindSlack: string;
	kindDiscord: string;
	kindWebhook: string;
	submitLabel: string;
	testSendLabel: string;
	sendingLabel: string;
	successLabel: string;
	failedLabel: string;
	emptyChannelsLabel: string;
};

export default function AlertsConsoleClient(props: Props) {
	const [channels, setChannels] = useState<Channel[]>(props.channels);
	const [alerts, setAlerts] = useState<SentAlert[]>(props.sentAlerts);
	const [label, setLabel] = useState("");
	const [target, setTarget] = useState("");
	const [kind, setKind] = useState<"slack" | "discord" | "webhook">("slack");
	const [status, setStatus] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();
	const [testingId, setTestingId] = useState<string | null>(null);

	function addChannel() {
		setStatus(null);
		if (!label.trim() || !target.trim()) {
			setStatus("✗ label과 target을 입력하세요");
			return;
		}
		startTransition(async () => {
			const res = await fetch("/api/alerts/channels", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ kind, label: label.trim(), target: target.trim() }),
			});
			if (!res.ok) {
				const j = (await res.json().catch(() => ({}))) as { error?: string };
				setStatus(`✗ ${j.error ?? "failed"}`);
				return;
			}
			const j = (await res.json()) as { channel: Channel };
			setChannels((prev) => [...prev, j.channel]);
			setLabel("");
			setTarget("");
			setStatus(`✓ ${j.channel.label} 채널이 추가됨`);
		});
	}

	function sendTest(channelId: string) {
		setStatus(null);
		setTestingId(channelId);
		startTransition(async () => {
			const res = await fetch("/api/alerts/test", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ channelId }),
			});
			const j = (await res.json().catch(() => ({}))) as {
				ok?: boolean;
				channel?: string;
				latencyMs?: number;
				alert?: SentAlert;
				error?: string;
			};
			if (j.ok && j.alert) {
				setAlerts((prev) => [j.alert!, ...prev].slice(0, 20));
				setStatus(
					j.error
						? `⚠ ${j.channel}: ${j.error} (${j.latencyMs}ms)`
						: `✓ ${j.channel} (${j.latencyMs}ms)`,
				);
			} else {
				setStatus(`✗ ${j.error ?? "send failed"}`);
			}
			setTestingId(null);
		});
	}

	return (
		<>
			<section
				style={{
					border: "1px solid #26313d",
					borderRadius: 14,
					background: "#0f1620",
					padding: 16,
					marginTop: 16,
				}}
			>
				<div style={{ marginBottom: 12 }}>
					<h2 style={{ margin: 0, fontSize: 18 }}>{props.addChannelLabel}</h2>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr 1fr auto",
						gap: 8,
						alignItems: "end",
					}}
				>
					<label style={{ display: "grid", gap: 4, fontSize: 12, color: "#8b949e" }}>
						<span>{props.channelKindLabel}</span>
						<select
							value={kind}
							onChange={(e) => setKind(e.target.value as "slack" | "discord" | "webhook")}
							style={{
								background: "#0b1119",
								color: "#f0f6fc",
								border: "1px solid #26313d",
								borderRadius: 8,
								padding: "8px 10px",
								fontSize: 13,
							}}
						>
							<option value="slack">{props.kindSlack}</option>
							<option value="discord">{props.kindDiscord}</option>
							<option value="webhook">{props.kindWebhook}</option>
						</select>
					</label>
					<label style={{ display: "grid", gap: 4, fontSize: 12, color: "#8b949e" }}>
						<span>Label</span>
						<input
							type="text"
							value={label}
							onChange={(e) => setLabel(e.target.value)}
							placeholder="e.g. PagerDuty P1"
							style={{
								background: "#0b1119",
								color: "#f0f6fc",
								border: "1px solid #26313d",
								borderRadius: 8,
								padding: "8px 10px",
								fontSize: 13,
							}}
						/>
					</label>
					<label style={{ display: "grid", gap: 4, fontSize: 12, color: "#8b949e" }}>
						<span>{props.targetLabel}</span>
						<input
							type="url"
							value={target}
							onChange={(e) => setTarget(e.target.value)}
							placeholder="https://hooks.slack.com/..."
							style={{
								background: "#0b1119",
								color: "#f0f6fc",
								border: "1px solid #26313d",
								borderRadius: 8,
								padding: "8px 10px",
								fontSize: 13,
							}}
						/>
					</label>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						disabled={pending}
						onClick={addChannel}
					>
						{pending ? "..." : props.submitLabel}
					</button>
				</div>
				{status && (
					<div style={{ marginTop: 10, fontSize: 12, color: "#c9d1d9" }}>{status}</div>
				)}
			</section>

			<section
				style={{
					border: "1px solid #26313d",
					borderRadius: 14,
					background: "#0f1620",
					padding: 16,
					marginTop: 16,
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 12,
					}}
				>
					<h2 style={{ margin: 0, fontSize: 18 }}>Channels ({channels.length})</h2>
					{channels.length === 0 && (
						<span style={{ color: "#8b949e", fontSize: 12 }}>
							{props.emptyChannelsLabel}
						</span>
					)}
				</div>
				{channels.map((channel) => (
					<div
						key={channel.id}
						style={{
							borderTop: "1px solid #26313d",
							padding: "12px 0",
							display: "grid",
							gridTemplateColumns: "1fr auto",
							gap: 12,
							alignItems: "center",
						}}
					>
						<div>
							<div style={{ fontWeight: 700 }}>
								{channel.label}{" "}
								<span
									style={{ color: "#8b949e", fontSize: 12, fontWeight: 500 }}
								>
									· {channel.kind}
								</span>
							</div>
							<div style={{ color: "#8b949e", fontSize: 12, marginTop: 4 }}>
								{channel.target}
							</div>
							{channel.lastSent && (
								<div style={{ color: "#8b949e", fontSize: 12, marginTop: 4 }}>
									last sent: {channel.lastSent}
								</div>
							)}
						</div>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							disabled={testingId === channel.id || pending}
							onClick={() => sendTest(channel.id)}
						>
							{testingId === channel.id ? props.sendingLabel : props.testSendLabel}
						</button>
					</div>
				))}
			</section>

			<section
				style={{
					border: "1px solid #26313d",
					borderRadius: 14,
					background: "#0f1620",
					padding: 16,
					marginTop: 16,
				}}
			>
				<h2 style={{ margin: 0, fontSize: 18, marginBottom: 8 }}>Sent alert log (live)</h2>
				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
					<thead>
						<tr style={{ color: "#8b949e", borderBottom: "1px solid #26313d" }}>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>When</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Item</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Dest</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Status</th>
							<th style={{ textAlign: "right", padding: "9px 8px" }}>Latency</th>
						</tr>
					</thead>
					<tbody>
						{alerts.map((row) => (
							<tr key={row.id} style={{ borderBottom: "1px solid #18222e" }}>
								<td style={{ padding: "10px 8px", color: "#8b949e", fontFamily: "var(--mono)" }}>
									{row.when}
								</td>
								<td style={{ padding: "10px 8px" }}>{row.item}</td>
								<td style={{ padding: "10px 8px" }}>{row.dest}</td>
								<td
									style={{
										padding: "10px 8px",
										color: row.status === "delivered" ? "#3fb950" : "#f85149",
									}}
								>
									● {row.status}
								</td>
								<td
									style={{
										padding: "10px 8px",
										textAlign: "right",
										color: "#8b949e",
									}}
								>
									{row.latency}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</>
	);
}
