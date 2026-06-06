"use client";

import { useState } from "react";

type AuditEntry = {
	id: string;
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

type Props = {
	audit: AuditEntry[];
	integrations: Integration[];
	exportJsonLabel: string;
	exportCsvLabel: string;
	connectLabel: string;
	disconnectLabel: string;
};

export default function EnterpriseClient(props: Props) {
	const [integrations, setIntegrations] = useState(props.integrations);
	const [busy, setBusy] = useState(false);

	function toggleIntegration(name: string) {
		setIntegrations((prev) =>
			prev.map((i) =>
				i.name === name
					? {
							...i,
							status: i.status === "connected" ? "available" : "connected",
						}
					: i,
			),
		);
	}

	function downloadAudit(format: "json" | "csv") {
		setBusy(true);
		fetch(`/api/audit/export?format=${format}`)
			.then((r) => {
				if (!r.ok) throw new Error("export failed");
				return r.blob();
			})
			.then((blob) => {
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `slopguard-audit.${format}`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			})
			.catch((e) => {
				alert(`✗ ${e instanceof Error ? e.message : "failed"}`);
			})
			.finally(() => setBusy(false));
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
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 12,
					}}
				>
					<h2 style={{ margin: 0, fontSize: 18 }}>Audit log (live)</h2>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							disabled={busy}
							onClick={() => downloadAudit("json")}
						>
							{props.exportJsonLabel}
						</button>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							disabled={busy}
							onClick={() => downloadAudit("csv")}
						>
							{props.exportCsvLabel}
						</button>
					</div>
				</div>
				<table
					style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
				>
					<thead>
						<tr style={{ color: "#8b949e", borderBottom: "1px solid #26313d" }}>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>When</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Actor</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Action</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Target</th>
							<th style={{ textAlign: "left", padding: "9px 8px" }}>Source</th>
						</tr>
					</thead>
					<tbody>
						{props.audit.map((row) => (
							<tr key={row.id} style={{ borderBottom: "1px solid #18222e" }}>
								<td
									style={{
										padding: "10px 8px",
										color: "#8b949e",
										fontFamily: "var(--mono)",
									}}
								>
									{row.when}
								</td>
								<td style={{ padding: "10px 8px" }}>{row.actor}</td>
								<td style={{ padding: "10px 8px" }}>{row.action}</td>
								<td style={{ padding: "10px 8px", color: "#c9d1d9" }}>
									{row.target}
								</td>
								<td
									style={{
										padding: "10px 8px",
										color:
											row.source === "SSO"
												? "var(--green)"
												: row.source === "Admin"
													? "#3fb950"
													: "#d29922",
									}}
								>
									{row.source}
								</td>
							</tr>
						))}
					</tbody>
				</table>
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
				<h2 style={{ margin: 0, fontSize: 18, marginBottom: 8 }}>
					Custom integrations (live)
				</h2>
				{integrations.map((integration) => (
					<div
						key={integration.name}
						style={{
							borderTop: "1px solid #26313d",
							padding: "12px 0",
							display: "flex",
							justifyContent: "space-between",
							gap: 12,
							alignItems: "center",
						}}
					>
						<div>
							<div style={{ fontWeight: 700 }}>{integration.name}</div>
							<div style={{ color: "#8b949e", fontSize: 12, marginTop: 4 }}>
								{integration.scope}
							</div>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<span
								style={{
									color:
										integration.status === "connected"
											? "#3fb950"
											: integration.status === "pending"
												? "#d29922"
												: "#8b949e",
									fontSize: 12,
								}}
							>
								● {integration.status}
							</span>
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={() => toggleIntegration(integration.name)}
							>
								{integration.status === "connected"
									? props.disconnectLabel
									: props.connectLabel}
							</button>
						</div>
					</div>
				))}
			</section>
		</>
	);
}
