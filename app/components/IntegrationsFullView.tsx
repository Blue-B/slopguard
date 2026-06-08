"use client";

import { useEffect, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";

type Integration = {
	name: string;
	status: "connected" | "pending" | "available";
	scope: string;
};

type IntegrationsResponse = {
	owner: string;
	integrations: Integration[];
};

export type IntegrationsFullViewCopy = {
	kicker: string;
	workspace: string;
	connectedLabel: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	sectionTitle: string;
	sectionSub: string;
	connect: string;
	disconnect: string;
	pending: string;
	available: string;
	connected: string;
};

function statusColor(s: Integration["status"]): string {
	return s === "connected" ? "#3fb950" : s === "pending" ? "#d29922" : "#8b949e";
}
function statusLabel(s: Integration["status"], copy: IntegrationsFullViewCopy): string {
	return s === "connected" ? copy.connected : s === "pending" ? copy.pending : copy.available;
}

export default function IntegrationsFullView({ copy }: { copy: IntegrationsFullViewCopy }) {
	const [data, setData] = useState<IntegrationsResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<string | null>(null);
	const [flash, setFlash] = useState<string>("");

	async function load() {
		try {
			const res = await fetch("/api/enterprise/integrations", { cache: "no-store" });
			if (!res.ok) {
				setError(`HTTP ${res.status}`);
				return;
			}
			setData((await res.json()) as IntegrationsResponse);
		} catch (e) {
			setError(e instanceof Error ? e.message : "load failed");
		}
	}

	async function toggle(name: string, currentStatus: Integration["status"]) {
		// "available" -> request it; anything else (requested) -> cancel the request.
		const action = currentStatus === "available" ? "connect" : "disconnect";
		setBusy(name);
		try {
			const res = await fetch("/api/enterprise/integrations", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name, action }),
			});
			if (!res.ok) {
				setError(`Toggle failed: HTTP ${res.status}`);
				return;
			}
			setFlash(`${name} ${action}ed`);
			setTimeout(() => setFlash(""), 2400);
			await load();
		} finally {
			setBusy(null);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isLoading = data === null && error === null;
	const items = data?.integrations ?? [];

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-governance.png"
				imageAlt="Enterprise integrations"
				plateLabel="integrations"
				connected={copy.connectedLabel}
				actions={
					flash ? (
						<span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 11 }}>{flash}</span>
					) : undefined
				}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && !isLoading && <ConsoleStatus danger>{error}</ConsoleStatus>}
			{!isLoading && items.length === 0 && <ConsoleStatus>{copy.empty}</ConsoleStatus>}

			{items.length > 0 && (
				<section className="console-section">
					<ConsoleSectionHead title={copy.sectionTitle} sub={copy.sectionSub} />
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
						{items.map((integration) => {
							const isRequested = integration.status !== "available";
							return (
								<div key={integration.name} className="plate console-panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
										<div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)" }}>{integration.name}</div>
										<span className="console-pill" style={{ textTransform: "uppercase", letterSpacing: ".08em", fontSize: 10, color: statusColor(integration.status), background: `${statusColor(integration.status)}20` }}>
											{statusLabel(integration.status, copy)}
										</span>
									</div>
									<div style={{ color: "var(--muted)", fontSize: 12, fontFamily: "var(--mono)" }}>{integration.scope}</div>
									<button
										type="button"
										className={isRequested ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
										disabled={busy === integration.name}
										onClick={() => toggle(integration.name, integration.status)}
										style={{ alignSelf: "flex-start" }}
									>
										{busy === integration.name ? "..." : isRequested ? copy.disconnect : copy.connect}
									</button>
								</div>
							);
						})}
					</div>
				</section>
			)}
		</ConsoleShell>
	);
}
