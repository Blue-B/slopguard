"use client";

import { useEffect, useMemo, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";

type SsoState = { provider: string; status: "active" | "pending" | "unconfigured"; lastSync: string };
type AuditEntry = {
	id: string;
	owner: string;
	when: string;
	actor: string;
	action: string;
	target: string;
	source: "SSO" | "API" | "Admin";
};
type Integration = { name: string; status: "connected" | "pending" | "available"; scope: string };

type StateResponse = {
	owner: string;
	sso: SsoState;
	audit: AuditEntry[];
	integrations: Integration[];
};

function formatLastSync(iso: string): string {
	const t = new Date(iso).getTime();
	if (!t || t <= 0 || Number.isNaN(t)) return "—";
	const ms = Date.now() - t;
	const m = Math.floor(ms / 60000);
	if (m < 1) return "now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return new Date(iso).toISOString().slice(0, 10);
}

export type EnterpriseConsoleCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
	metricLabels: { audit: string; integrations: string; ssoProvider: string; ssoStatus: string };
	ssoTitle: string;
	ssoSubtitle: string;
	ssoLabels: { provider: string; status: string; lastSync: string };
	supportTitle: string;
	supportSubtitle: string;
	supportSla: string;
	supportHours: string;
	supportAccountMgr: string;
	auditTitle: string;
	auditSubtitle: string;
	auditViewAll: string;
	auditViewAllHref: string;
	integrationsTitle: string;
	integrationsSubtitle: string;
	integrationsViewAll: string;
	integrationsViewAllHref: string;
};

export default function EnterpriseConsole({ copy }: { copy: EnterpriseConsoleCopy }) {
	const [data, setData] = useState<StateResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
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
		})();
	}, []);

	const isLoading = data === null && error === null;
	const ml = copy.metricLabels;

	const metrics = useMemo(() => {
		if (!data) {
			return [
				{ label: ml.audit, value: "-" as string | number, tone: "neutral" as const },
				{ label: ml.integrations, value: "-" as string | number, tone: "neutral" as const },
				{ label: ml.ssoProvider, value: "-" as string | number, tone: "neutral" as const },
				{ label: ml.ssoStatus, value: "-" as string | number, tone: "neutral" as const },
			];
		}
		return [
			{ label: ml.audit, value: data.audit.length, tone: "ok" as const },
			{ label: ml.integrations, value: data.integrations.length, tone: "ok" as const },
			{ label: ml.ssoProvider, value: data.sso.provider, tone: "ok" as const },
			{
				label: ml.ssoStatus,
				value: data.sso.status,
				tone: data.sso.status === "active" ? ("ok" as const) : ("warn" as const),
			},
		];
	}, [data, ml]);

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-governance.png"
				imageAlt="Enterprise governance"
				plateLabel="compliance / audit / sso"
				connected={copy.connected}
				metrics={metrics}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && !isLoading && <ConsoleStatus danger>{error}</ConsoleStatus>}

			{!isLoading && !error && (
				<section className="console-section">
					<div className="plate console-overview">
						<div className="console-overview-main">
							<ConsoleSectionHead title={copy.ssoTitle} sub={copy.ssoSubtitle} />
							<div className="console-kv">
								{[
									{ k: copy.ssoLabels.provider, v: data?.sso.provider ?? "-", c: "var(--fg)" },
									{ k: copy.ssoLabels.status, v: data?.sso.status ?? "-", c: "var(--green)" },
									{ k: copy.ssoLabels.lastSync, v: data ? formatLastSync(data.sso.lastSync) : "-", c: "var(--fg)" },
								].map((row) => (
									<div key={row.k} className="console-kv-row">
										<span>{row.k}</span>
										<b style={{ color: row.c }}>{row.v}</b>
									</div>
								))}
							</div>
						</div>
						<aside className="console-overview-rail">
							<div className="console-rail-block">
								<header className="console-block-head"><h3>{copy.supportTitle}</h3></header>
								<p style={{ color: "var(--muted)", fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>{copy.supportSubtitle}</p>
								{[
									{ label: copy.supportSla, value: "1h P1" },
									{ label: copy.supportHours, value: "24 / 7" },
									{ label: copy.supportAccountMgr, value: "assigned" },
								].map((row) => (
									<div key={row.label} className="console-rail-row">
										<span>{row.label}</span>
										<b style={{ color: "var(--fg)" }}>{row.value}</b>
									</div>
								))}
							</div>
						</aside>
					</div>
				</section>
			)}
		</ConsoleShell>
	);
}
