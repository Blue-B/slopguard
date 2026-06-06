"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { content, frame, heroSurface, lineSection, muted, shell } from "./console-styles";

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
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	eyebrow: string;
	title: string;
	body: string;
	providerLabel: string;
	idpMetadataLabel: string;
	idpMetadataPlaceholder: string;
	emailAttributeLabel: string;
	loginAttributeLabel: string;
	enforcedLabel: string;
	enforcedHint: string;
	activateCta: string;
	deactivateCta: string;
	saveCta: string;
	savingCta: string;
	savedCta: string;
	backToEnterprise: string;
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
	if (!iso) return "-";
	const ms = Date.now() - new Date(iso).getTime();
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
	const statusLabel =
		status === "active"
			? copy.statusActive
			: status === "pending"
				? copy.statusPending
				: copy.statusUnconfigured;
	const statusColor =
		status === "active" ? "#3fb950" : status === "pending" ? "#d29922" : "#8b949e";

	return (
		<main style={shell}>
			<section style={frame}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "280px minmax(0, 1fr)",
						minHeight: 780,
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

					<div style={content}>
						<header
							style={{
								...heroSurface,
								display: "grid",
								gridTemplateColumns: "minmax(0, 1fr) 420px",
								minHeight: 270,
								marginBottom: 26,
							}}
						>
							<div style={{ padding: "32px 34px", position: "relative", zIndex: 2 }}>
								<div style={{ color: "#3fb950", fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 14 }}>
									{copy.eyebrow}
								</div>
								<h1 style={{ margin: 0, fontSize: "clamp(34px, 4vw, 56px)", letterSpacing: "-.06em", fontWeight: 850, lineHeight: .95, maxWidth: 760 }}>
									{copy.title}
								</h1>
								<p style={{ ...muted, margin: "18px 0 0", maxWidth: 660, lineHeight: 1.55, fontSize: 14 }}>
									{copy.body}
								</p>
							</div>
							<div style={{ position: "relative", minHeight: 240 }}>
								<Image
									src="/paid-command-mesh.png"
									alt="Enterprise identity command mesh"
									fill
									priority
									style={{ objectFit: "cover", opacity: .78 }}
									sizes="420px"
								/>
								<div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,17,25,.98) 0%, rgba(11,17,25,.12) 58%, rgba(11,17,25,.72) 100%)" }} />
							</div>
						</header>

						{!cfg && !error && <StateLine>Loading SSO configuration...</StateLine>}
						{error && <StateLine tone="danger">{error}</StateLine>}

						{cfg && (
							<>
								<div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderTop: "1px solid #1b2632", borderBottom: "1px solid #1b2632", marginBottom: 28 }}>
									<Metric label="Status" value={statusLabel} color={statusColor} />
									<Metric label="Provider" value={cfg.provider} />
									<Metric label="Enforced" value={cfg.enforced ? "Yes" : "No"} color={cfg.enforced ? "#3fb950" : "#8b949e"} />
									<Metric label={copy.lastSyncLabel} value={relativeTime(cfg.lastSync)} last />
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.08fr) minmax(340px, .92fr)", gap: 30 }}>
									<section style={lineSection}>
										<div style={{ marginBottom: 18 }}>
											<h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-.04em" }}>Identity configuration</h2>
											<p style={{ ...muted, margin: "7px 0 0", fontSize: 12, lineHeight: 1.5 }}>SAML metadata and enforcement controls stay connected to the live backend.</p>
										</div>
										<div style={{ borderTop: "1px solid #1b2632" }}>
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
											{flash && <span style={{ fontSize: 11, color: "#3fb950", fontFamily: "var(--mono)", alignSelf: "center" }}>{flash}</span>}
										</div>
									</section>

									<div style={{ display: "grid", gap: 24, alignContent: "start" }}>
										<section style={lineSection}>
											<h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-.04em" }}>Service endpoints</h2>
											<div style={{ marginTop: 14, borderTop: "1px solid #1b2632" }}>
												<ReadOnly label={copy.entityIdLabel} value={cfg.entityId} />
												<ReadOnly label={copy.acsUrlLabel} value={cfg.acsUrl} />
											</div>
										</section>

										<section style={lineSection}>
											<h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-.04em" }}>{copy.helpTitle}</h2>
											<div style={{ marginTop: 14, borderTop: "1px solid #1b2632" }}>
												{copy.helpSteps.map((s) => (
													<div key={s.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, padding: "12px 0", borderBottom: "1px solid #121a24", fontSize: 12 }}>
														<div style={{ ...muted, fontFamily: "var(--mono)", letterSpacing: ".05em" }}>{s.name}</div>
														<div style={{ color: "#c9d1d9", fontFamily: "var(--mono)", wordBreak: "break-word" }}>{s.value}</div>
													</div>
												))}
											</div>
										</section>
									</div>
								</div>
							</>
						)}

						<div style={{ marginTop: 26, display: "flex", justifyContent: "flex-end" }}>
							<Link href="/enterprise" className="btn btn-ghost btn-sm">{copy.backToEnterprise}</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
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

function Metric({ label, value, color = "#f0f6fc", last = false }: { label: string; value: string; color?: string; last?: boolean }) {
	return (
		<div style={{ padding: "17px 18px", borderRight: last ? "none" : "1px solid #1b2632" }}>
			<div style={{ ...muted, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "var(--mono)" }}>{label}</div>
			<div style={{ marginTop: 7, fontSize: 21, fontWeight: 800, color, fontFamily: "var(--mono)", letterSpacing: "-.03em" }}>{value}</div>
		</div>
	);
}

function StateLine({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "danger" }) {
	return <div style={{ padding: "24px 0", color: tone === "danger" ? "#f85149" : "#8b949e", fontFamily: "var(--mono)", fontSize: 12 }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr)", gap: 18, alignItems: "center", padding: "14px 0", borderBottom: "1px solid #121a24" }}>
			<label style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#8b949e", fontFamily: "var(--mono)" }}>{label}</label>
			{children}
		</div>
	);
}

function ReadOnly({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ padding: "12px 0", borderBottom: "1px solid #121a24" }}>
			<div style={{ ...muted, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 6 }}>{label}</div>
			<div style={{ color: "#c9d1d9", fontFamily: "var(--mono)", fontSize: 12, wordBreak: "break-all" }}>{value}</div>
		</div>
	);
}
