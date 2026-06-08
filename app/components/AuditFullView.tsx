"use client";

import { useEffect, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";

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
	integrations: Array<{ name: string; status: "connected" | "pending" | "available"; scope: string }>;
};

function sourceColor(s: AuditEntry["source"]): string {
	return s === "SSO" ? "#3fb950" : s === "Admin" ? "#3fb950" : "#d29922";
}

export type AuditFullViewCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	tableTitle: string;
	tableSub: string;
	columns: { when: string; actor: string; action: string; target: string; source: string };
	exportJson: string;
	exportCsv: string;
	exportedNote: string;
};

const GRID = "130px 120px minmax(0,1.2fr) minmax(0,1fr) 84px";

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
			const res = await fetch(`/api/audit/export?format=${format}`, { credentials: "include" });
			if (!res.ok) {
				setError(`Export failed: HTTP ${res.status}`);
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `slopguard-audit-${Date.now()}.${format}`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setLastExport(format.toUpperCase());
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
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-governance.png"
				imageAlt="Audit trail vault"
				plateLabel="audit trail"
				connected={copy.connected}
				actions={
					<>
						<button type="button" className="btn btn-ghost btn-sm" disabled={exportBusy !== null} onClick={() => downloadExport("json")}>
							{exportBusy === "json" ? "..." : copy.exportJson}
						</button>
						<button type="button" className="btn btn-primary btn-sm" disabled={exportBusy !== null} onClick={() => downloadExport("csv")}>
							{exportBusy === "csv" ? "..." : copy.exportCsv}
						</button>
						{lastExport && (
							<span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>
								{lastExport} {copy.exportedNote}
							</span>
						)}
					</>
				}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && !isLoading && <ConsoleStatus danger>{error}</ConsoleStatus>}
			{!isLoading && entries.length === 0 && <ConsoleStatus>{copy.empty}</ConsoleStatus>}

			{entries.length > 0 && (
				<section className="console-section">
					<ConsoleSectionHead title={copy.tableTitle} sub={copy.tableSub} />
					<div className="plate console-table">
						<div className="console-th" style={{ gridTemplateColumns: GRID }}>
							<span>{copy.columns.when}</span>
							<span>{copy.columns.actor}</span>
							<span>{copy.columns.action}</span>
							<span>{copy.columns.target}</span>
							<span>{copy.columns.source}</span>
						</div>
						{entries.map((row) => (
							<div className="console-tr" key={row.id} style={{ gridTemplateColumns: GRID }}>
								<span style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{row.when}</span>
								<span style={{ color: "var(--fg)" }}>{row.actor}</span>
								<span style={{ color: "var(--fg)" }}>{row.action}</span>
								<span style={{ color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.target}</span>
								<span style={{ fontFamily: "var(--mono)", color: sourceColor(row.source) }}>{row.source}</span>
							</div>
						))}
					</div>
				</section>
			)}
		</ConsoleShell>
	);
}
