"use client";

import { useEffect, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import { muted } from "./console-styles";
import type { SidebarItem } from "./ConsoleSidebar";

type SsoProvider = "okta" | "azure-ad" | "google" | "onelogin" | "generic";
type SsoStatus = "active" | "pending" | "unconfigured";

type SsoConfig = {
	provider: SsoProvider;
	status: SsoStatus;
	entityId: string;
	acsUrl: string;
	idpMetadataUrl: string;
	emailAttribute: string;
	loginAttribute: string;
	enforced: boolean;
	lastSync?: string;
};

export type SsoFullViewCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	eyebrow: string;
	title: string;
	body: string;
	configTitle: string;
	configSub: string;
	endpointsTitle: string;
	providerLabel: string;
	idpMetadataLabel: string;
	idpMetadataPlaceholder: string;
	emailAttributeLabel: string;
	loginAttributeLabel: string;
	enforcedLabel: string;
	enforcedHint: string;
	activateCta: string;
	deactivateCta: string;
	testLoginCta: string;
	saveCta: string;
	savingCta: string;
	savedCta: string;
	statusLabel: string;
	providerMetaLabel: string;
	enforcedMetaLabel: string;
	entityIdLabel: string;
	acsUrlLabel: string;
	lastSyncLabel: string;
	statusActive: string;
	statusPending: string;
	statusUnconfigured: string;
	helpTitle: string;
	helpSteps: { name: string; value: string }[];
	providerOptions: { value: SsoProvider; label: string }[];
};

function relativeTime(iso?: string): string {
	if (!iso) return "—";
	const t = new Date(iso).getTime();
	if (!t || t <= 0 || Number.isNaN(t)) return "—";
	const ms = Date.now() - t;
	const m = Math.floor(ms / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	return `${d}d ago`;
}

export default function SsoFullView({ copy }: { copy: SsoFullViewCopy }) {
	const [cfg, setCfg] = useState<SsoConfig | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [flash, setFlash] = useState<string | null>(null);

	async function load() {
		try {
			const res = await fetch("/api/enterprise/sso", { cache: "no-store" });
			if (!res.ok) {
				setError(`HTTP ${res.status}`);
				return;
			}
			const json = (await res.json()) as { sso: SsoConfig };
			setCfg(json.sso);
			setError(null);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load SSO config");
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function save(extra: { activate?: boolean } = {}) {
		if (!cfg) return;
		setBusy(true);
		setFlash(null);
		try {
			const res = await fetch("/api/enterprise/sso", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					provider: cfg.provider,
					idpMetadataUrl: cfg.idpMetadataUrl,
					emailAttribute: cfg.emailAttribute,
					loginAttribute: cfg.loginAttribute,
					enforced: cfg.enforced,
					...extra,
				}),
			});
			if (!res.ok) {
				const j = (await res.json().catch(() => ({}))) as { message?: string };
				setError(j.message ?? `HTTP ${res.status}`);
				return;
			}
			const json = (await res.json()) as { sso: SsoConfig };
			setCfg(json.sso);
			setError(null);
			setFlash(extra.activate === false ? copy.deactivateCta : copy.savedCta);
			setTimeout(() => setFlash(null), 2200);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to save SSO config");
		} finally {
			setBusy(false);
		}
	}

	const status = cfg?.status ?? "unconfigured";
	const statusText =
		status === "active" ? copy.statusActive : status === "pending" ? copy.statusPending : copy.statusUnconfigured;
	// Don't surface a provider until SSO is configured — "okta" is just the
	// default form selection, not a real connection.
	const providerMeta =
		status === "unconfigured"
			? "—"
			: (copy.providerOptions.find((o) => o.value === cfg?.provider)?.label ??
				cfg?.provider ??
				"—");

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.eyebrow}
				title={copy.title}
				body={copy.body}
				image="/console-governance.png"
				imageAlt="Enterprise identity command"
				plateLabel="identity / sso"
				connected={copy.connected}
				metrics={
					cfg
						? [
								{ label: copy.statusLabel, value: statusText, tone: status === "active" ? "ok" : status === "pending" ? "warn" : "neutral" },
								{ label: copy.providerMetaLabel, value: providerMeta },
								{ label: copy.enforcedMetaLabel, value: cfg.enforced ? "Yes" : "No", tone: cfg.enforced ? "ok" : "neutral" },
								{ label: copy.lastSyncLabel, value: relativeTime(cfg.lastSync) },
							]
						: undefined
				}
			/>

			{!cfg && !error && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && <ConsoleStatus danger>{error}</ConsoleStatus>}

			{cfg && (
				<section className="console-section console-grid">
					<div className="plate console-panel">
						<ConsoleSectionHead title={copy.configTitle} sub={copy.configSub} />
						<div style={{ borderTop: "1px solid var(--border-muted)" }}>
							<Field label={copy.providerLabel}>
								<select value={cfg.provider} onChange={(e) => setCfg({ ...cfg, provider: e.target.value as SsoProvider })} disabled={busy} style={inputStyle}>
									{copy.providerOptions.map((o) => (
										<option key={o.value} value={o.value}>{o.label}</option>
									))}
								</select>
							</Field>
							<Field label={copy.idpMetadataLabel}>
								<input type="url" value={cfg.idpMetadataUrl} placeholder={copy.idpMetadataPlaceholder} onChange={(e) => setCfg({ ...cfg, idpMetadataUrl: e.target.value })} disabled={busy} style={inputStyle} />
							</Field>
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
								<Field label={copy.emailAttributeLabel}>
									<input type="text" value={cfg.emailAttribute} onChange={(e) => setCfg({ ...cfg, emailAttribute: e.target.value })} disabled={busy} style={inputStyle} />
								</Field>
								<Field label={copy.loginAttributeLabel}>
									<input type="text" value={cfg.loginAttribute} onChange={(e) => setCfg({ ...cfg, loginAttribute: e.target.value })} disabled={busy} style={inputStyle} />
								</Field>
							</div>
							<Field label={copy.enforcedLabel}>
								<label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#c9d1d9" }}>
									<input type="checkbox" checked={cfg.enforced} onChange={(e) => setCfg({ ...cfg, enforced: e.target.checked })} disabled={busy} />
									<span>{copy.enforcedHint}</span>
								</label>
							</Field>
						</div>
						<div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
							<button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => save({ activate: true })}>{copy.activateCta}</button>
							<button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => save()}>{busy ? copy.savingCta : copy.saveCta}</button>
							<button type="button" className="btn btn-ghost btn-sm" disabled={busy || status !== "active"} onClick={() => save({ activate: false })}>{copy.deactivateCta}</button>
							{status === "active" && (
								<a className="btn btn-ghost btn-sm" href="/api/enterprise/sso/login">{copy.testLoginCta}</a>
							)}
							{flash && <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--mono)", alignSelf: "center" }}>{flash}</span>}
						</div>
					</div>

					<aside className="console-side-stack">
						<div className="plate console-panel">
							<ConsoleSectionHead title={copy.endpointsTitle} />
							<div style={{ borderTop: "1px solid var(--border-muted)" }}>
								<ReadOnly label={copy.entityIdLabel} value={cfg.entityId} />
								<ReadOnly label={copy.acsUrlLabel} value={cfg.acsUrl} />
							</div>
						</div>
						<div className="plate console-panel">
							<ConsoleSectionHead title={copy.helpTitle} />
							<div style={{ borderTop: "1px solid var(--border-muted)" }}>
								{copy.helpSteps.map((s) => (
									<div key={s.name} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border-muted)", fontSize: 12 }}>
										<div style={{ ...muted, fontFamily: "var(--mono)", letterSpacing: ".05em" }}>{s.name}</div>
										<div style={{ color: "#c9d1d9", fontFamily: "var(--mono)", wordBreak: "break-word" }}>{s.value}</div>
									</div>
								))}
							</div>
						</div>
					</aside>
				</section>
			)}
		</ConsoleShell>
	);
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	background: "#071019",
	color: "#f0f6fc",
	border: "1px solid #203040",
	borderRadius: 10,
	padding: "11px 12px",
	fontSize: 13,
	fontFamily: "var(--mono)",
	outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr)", gap: 18, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-muted)" }}>
			<label style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#8b949e", fontFamily: "var(--mono)" }}>{label}</label>
			{children}
		</div>
	);
}

function ReadOnly({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ padding: "12px 0", borderBottom: "1px solid var(--border-muted)" }}>
			<div style={{ ...muted, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 6 }}>{label}</div>
			<div style={{ color: "#c9d1d9", fontFamily: "var(--mono)", fontSize: 12, wordBreak: "break-all" }}>{value}</div>
		</div>
	);
}
