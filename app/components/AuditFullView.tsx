"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";

type AuditEntry = {
	id: string;
	owner: string;
	when: string;
	actor: string;
	action: string;
	target: string;
	source: "SSO" | "API" | "Admin";
};

type StateResponse = {
	owner: string;
	sso: { provider: string; status: string; lastSync: string };
	audit: AuditEntry[];
	integrations: Array<{
		name: string;
		status: "connected" | "pending" | "available";
		scope: string;
	}>;
};

function sourceColor(s: AuditEntry["source"]): string {
	return s === "SSO" ? "#3fb950" : s === "Admin" ? "#3fb950" : "#d29922";
}

export type AuditFullViewCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	backHref: string;
	backLabel: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	columns: {
		when: string;
		actor: string;
		action: string;
		target: string;
		source: string;
	};
	exportJson: string;
	exportCsv: string;
};

export default function AuditFullView({ copy }: { copy: AuditFullViewCopy }) {
	const [data, setData] = useState<StateResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exportBusy, setExportBusy] = useState<"json" | "csv" | null>(null);
	const [lastExport, setLastExport] = useState<string>("");

	async function load() {
		try {
			const res = await fetch("/api/enterprise/state", { cache: "no-store" });
			if (!res.ok) {
				setError(`HTTP ${res.status}`);
				return;
			}
			setData((await res.json()) as StateResponse);
		} catch (e) {
			setError(e instanceof Error ? e.message : "load failed");
		}
	}

	async function downloadExport(format: "json" | "csv") {
		setExportBusy(format);
		try {
			const res = await fetch(`/api/audit/export?format=${format}`, {
				credentials: "include",
			});
			if (!res.ok) {
				setError(`Export failed: HTTP ${res.status}`);
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download =
				(format === "csv" ? "slopguard-audit" : "slopguard-audit") +
				`-${Date.now()}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setLastExport(format.toUpperCase());
			// Refresh audit so the new "exported" entry shows up.
			setTimeout(() => load(), 500);
		} finally {
			setExportBusy(null);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isLoading = data === null && error === null;
	const entries = data?.audit ?? [];

	return (
		<main
			style={{
				maxWidth: 1480,
				margin: "0 auto",
				padding: "18px 32px 96px",
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "260px minmax(0, 1fr)",
					gap: 24,
				}}
			>
				<ConsoleSidebar
					workspace={copy.workspace}
					workspaceSub={copy.workspaceSub}
					user={copy.user}
					entitlement={copy.entitlement}
					connected={copy.connected}
					nav={copy.nav}
				/>

				<section>
					<header
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-end",
							gap: 24,
							padding: "28px 30px",
							border: "1px solid #1c2530",
							borderRadius: 18,
							marginBottom: 26,
							backgroundImage:
								"linear-gradient(90deg, rgba(10,14,21,0.97) 0%, rgba(10,14,21,0.78) 52%, rgba(10,14,21,0.46) 100%), url('/paid-command-mesh.png')",
							backgroundSize: "cover",
							backgroundPosition: "center right",
						}}
					>
						<div>
							<div
								style={{
									color: "#3fb950",
									fontSize: 10,
									letterSpacing: ".18em",
									textTransform: "uppercase",
									fontFamily: "var(--mono)",
									marginBottom: 8,
								}}
							>
								{copy.heroEyebrow}
							</div>
							<h1
								style={{
									margin: 0,
									fontSize: 24,
									letterSpacing: "-.03em",
									fontWeight: 800,
								}}
							>
								{copy.heroTitle}
							</h1>
							<p
								style={{
									color: "#8b949e",
									margin: "8px 0 0",
									maxWidth: 560,
									fontSize: 13,
									lineHeight: 1.5,
								}}
							>
								{copy.heroBody}
							</p>
						</div>
						<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
							{lastExport && (
								<span
									style={{
										color: "#3fb950",
										fontFamily: "var(--mono)",
										fontSize: 11,
									}}
								>
									{lastExport} downloaded
								</span>
							)}
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								disabled={exportBusy !== null}
								onClick={() => downloadExport("json")}
							>
								{exportBusy === "json" ? "..." : copy.exportJson}
							</button>
							<button
								type="button"
								className="btn btn-primary btn-sm"
								disabled={exportBusy !== null}
								onClick={() => downloadExport("csv")}
							>
								{exportBusy === "csv" ? "..." : copy.exportCsv}
							</button>
							<Link href={copy.backHref} className="btn btn-ghost btn-sm">
								← {copy.backLabel}
							</Link>
						</div>
					</header>

					{isLoading && (
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
					)}

					{error && !isLoading && (
						<div
							style={{
								padding: "16px 0",
								color: "#f85149",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{error}
						</div>
					)}

					{!isLoading && entries.length === 0 && (
						<div
							style={{
								padding: "48px 0",
								textAlign: "center",
								color: "#8b949e",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{copy.empty}
						</div>
					)}

					{entries.length > 0 && (
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								fontSize: 13,
							}}
						>
							<thead>
								<tr style={{ color: "#7d8590" }}>
									{(
										["when", "actor", "action", "target", "source"] as const
									).map((k) => (
										<th
											key={k}
											style={{
												textAlign: "left",
												padding: "12px 4px",
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontWeight: 600,
												fontFamily: "var(--mono)",
												borderBottom: "1px solid #1c2530",
											}}
										>
											{copy.columns[k]}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{entries.map((row) => (
									<tr
										key={row.id}
										style={{ borderBottom: "1px solid #161e29" }}
									>
										<td
											style={{
												padding: "14px 4px",
												fontFamily: "var(--mono)",
												color: "#8b949e",
											}}
										>
											{row.when}
										</td>
										<td style={{ padding: "14px 4px", color: "#c9d1d9" }}>
											{row.actor}
										</td>
										<td style={{ padding: "14px 4px", color: "#c9d1d9" }}>
											{row.action}
										</td>
										<td style={{ padding: "14px 4px", color: "#c9d1d9" }}>
											{row.target}
										</td>
										<td
											style={{
												padding: "14px 4px",
												color: sourceColor(row.source),
												fontFamily: "var(--mono)",
											}}
										>
											{row.source}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</section>
			</div>
		</main>
	);
}
