"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { shell, frame, card, muted } from "./console-styles";

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
		status === "active"
			? "#3fb950"
			: status === "pending"
				? "#d29922"
				: "#8b949e";

	return (
		<main style={shell}>
			<section style={frame}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "260px minmax(0, 1fr)",
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
					/>

					<div style={{ padding: "26px 28px 32px" }}>
						<header style={{ marginBottom: 22 }}>
							<div
								style={{
									color: "#3fb950",
									fontSize: 11,
									fontWeight: 800,
									letterSpacing: ".14em",
									fontFamily: "var(--mono)",
								}}
							>
								{copy.eyebrow}
							</div>
							<h1
								style={{
									margin: "8px 0 6px",
									fontSize: 28,
									letterSpacing: "-.035em",
									fontWeight: 800,
									lineHeight: 1.1,
								}}
							>
								{copy.title}
							</h1>
							<p
								style={{
									...muted,
									margin: 0,
									maxWidth: 620,
									lineHeight: 1.55,
									fontSize: 13,
								}}
							>
								{copy.body}
							</p>
						</header>

						{!cfg && !error && (
							<div
								style={{
									...card,
									padding: "32px 24px",
									textAlign: "center",
									color: "#8b949e",
									fontFamily: "var(--mono)",
									fontSize: 12,
									marginBottom: 24,
								}}
							>
								Loading SSO configuration…
							</div>
						)}

						{error && (
							<div
								style={{
									...card,
									padding: "12px 14px",
									border: "1px solid rgba(248,81,73,.4)",
									color: "#f85149",
									fontSize: 12,
									fontFamily: "var(--mono)",
									marginBottom: 18,
								}}
							>
								{error}
							</div>
						)}

						{cfg && (
							<>
								{/* Status row */}
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
									<div
										style={{
											padding: "14px 18px",
											borderRight: "1px solid #1c2530",
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
											Status
										</div>
										<div
											style={{
												marginTop: 6,
												fontSize: 18,
												fontWeight: 700,
												color: statusColor,
												fontFamily: "var(--mono)",
												letterSpacing: "-.02em",
											}}
										>
											{statusLabel}
										</div>
									</div>
									<div
										style={{
											padding: "14px 18px",
											borderRight: "1px solid #1c2530",
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
											Provider
										</div>
										<div
											style={{
												marginTop: 6,
												fontSize: 18,
												fontWeight: 700,
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												letterSpacing: "-.02em",
											}}
										>
											{cfg.provider}
										</div>
									</div>
									<div
										style={{
											padding: "14px 18px",
											borderRight: "1px solid #1c2530",
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
											Enforced
										</div>
										<div
											style={{
												marginTop: 6,
												fontSize: 18,
												fontWeight: 700,
												color: cfg.enforced ? "#3fb950" : "#8b949e",
												fontFamily: "var(--mono)",
												letterSpacing: "-.02em",
											}}
										>
											{cfg.enforced ? "Yes" : "No"}
										</div>
									</div>
									<div style={{ padding: "14px 18px" }}>
										<div
											style={{
												...muted,
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontFamily: "var(--mono)",
											}}
										>
											{copy.lastSyncLabel}
										</div>
										<div
											style={{
												marginTop: 6,
												fontSize: 18,
												fontWeight: 700,
												color: "#f0f6fc",
												fontFamily: "var(--mono)",
												letterSpacing: "-.02em",
											}}
										>
											{relativeTime(cfg.lastSync)}
										</div>
									</div>
								</div>

								{/* Form */}
								<div
									style={{
										...card,
										padding: "18px 20px",
										marginBottom: 24,
									}}
								>
									<Field label={copy.providerLabel}>
										<select
											value={cfg.provider}
											onChange={(e) =>
												setCfg({
													...cfg,
													provider: e.target.value as SsoProvider,
												})
											}
											disabled={busy}
											style={inputStyle}
										>
											{copy.providerOptions.map((o) => (
												<option key={o.value} value={o.value}>
													{o.label}
												</option>
											))}
										</select>
									</Field>

									<Field label={copy.idpMetadataLabel}>
										<input
											type="url"
											value={cfg.idpMetadataUrl}
											placeholder={copy.idpMetadataPlaceholder}
											onChange={(e) =>
												setCfg({ ...cfg, idpMetadataUrl: e.target.value })
											}
											disabled={busy}
											style={inputStyle}
										/>
									</Field>

									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: 14,
										}}
									>
										<Field label={copy.emailAttributeLabel}>
											<input
												type="text"
												value={cfg.emailAttribute}
												onChange={(e) =>
													setCfg({ ...cfg, emailAttribute: e.target.value })
												}
												disabled={busy}
												style={inputStyle}
											/>
										</Field>
										<Field label={copy.loginAttributeLabel}>
											<input
												type="text"
												value={cfg.loginAttribute}
												onChange={(e) =>
													setCfg({ ...cfg, loginAttribute: e.target.value })
												}
												disabled={busy}
												style={inputStyle}
											/>
										</Field>
									</div>

									<Field label={copy.enforcedLabel}>
										<label
											style={{
												display: "flex",
												alignItems: "center",
												gap: 8,
												fontSize: 12,
												color: "#c9d1d9",
											}}
										>
											<input
												type="checkbox"
												checked={cfg.enforced}
												onChange={(e) =>
													setCfg({ ...cfg, enforced: e.target.checked })
												}
												disabled={busy}
											/>
											<span>{copy.enforcedHint}</span>
										</label>
									</Field>

									<div
										style={{
											display: "flex",
											gap: 10,
											marginTop: 6,
											flexWrap: "wrap",
										}}
									>
										<button
											type="button"
											className="btn btn-primary btn-sm"
											disabled={busy}
											onClick={() => save({ activate: true })}
										>
											{copy.activateCta}
										</button>
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											disabled={busy}
											onClick={() => save()}
										>
											{busy ? copy.savingCta : copy.saveCta}
										</button>
										<button
											type="button"
											className="btn btn-ghost btn-sm"
											disabled={busy || status !== "active"}
											onClick={() => save({ activate: false })}
										>
											{copy.deactivateCta}
										</button>
										{flash && (
											<span
												style={{
													fontSize: 11,
													color: "#3fb950",
													fontFamily: "var(--mono)",
													alignSelf: "center",
												}}
											>
												{flash}
											</span>
										)}
									</div>
								</div>

								{/* Read-only connection info */}
								<div
									style={{
										...card,
										padding: "18px 20px",
										marginBottom: 24,
									}}
								>
									<div
										style={{
											...muted,
											fontSize: 11,
											letterSpacing: ".12em",
											textTransform: "uppercase",
											fontFamily: "var(--mono)",
											marginBottom: 10,
										}}
									>
										Connection info
									</div>
									<ReadOnly label={copy.entityIdLabel} value={cfg.entityId} />
									<ReadOnly label={copy.acsUrlLabel} value={cfg.acsUrl} />
								</div>

								{/* Help / steps */}
								<div
									style={{
										...card,
										padding: "18px 20px",
									}}
								>
									<div
										style={{
											color: "#f0f6fc",
											fontWeight: 700,
											fontSize: 13,
											marginBottom: 10,
										}}
									>
										{copy.helpTitle}
									</div>
									<dl
										style={{
											display: "grid",
											gridTemplateColumns: "120px 1fr",
											gap: "8px 14px",
											margin: 0,
											fontSize: 12,
										}}
									>
										{copy.helpSteps.map((s) => (
											<Fragment key={s.name}>
												<dt
													style={{
														...muted,
														fontFamily: "var(--mono)",
														letterSpacing: ".05em",
													}}
												>
													{s.name}
												</dt>
												<dd
													style={{
														margin: 0,
														color: "#c9d1d9",
														fontFamily: "var(--mono)",
													}}
												>
													{s.value}
												</dd>
											</Fragment>
										))}
									</dl>
								</div>
							</>
						)}

						<div
							style={{
								marginTop: 24,
								display: "flex",
								gap: 10,
								justifyContent: "flex-end",
							}}
						>
							<Link href="/enterprise" className="btn btn-ghost btn-sm">
								{copy.backToEnterprise}
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	background: "#0a0e15",
	color: "#f0f6fc",
	border: "1px solid #1c2530",
	borderRadius: 8,
	padding: "9px 11px",
	fontSize: 13,
	fontFamily: "var(--mono)",
	outline: "none",
};

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ marginBottom: 14 }}>
			<label
				style={{
					display: "block",
					fontSize: 11,
					letterSpacing: ".12em",
					textTransform: "uppercase",
					color: "#8b949e",
					fontFamily: "var(--mono)",
					marginBottom: 6,
				}}
			>
				{label}
			</label>
			{children}
		</div>
	);
}

function ReadOnly({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ marginBottom: 10 }}>
			<div
				style={{
					...muted,
					fontSize: 10,
					letterSpacing: ".12em",
					textTransform: "uppercase",
					fontFamily: "var(--mono)",
					marginBottom: 4,
				}}
			>
				{label}
			</div>
			<div
				style={{
					background: "#0a0e15",
					border: "1px solid #1c2530",
					borderRadius: 8,
					padding: "8px 10px",
					color: "#c9d1d9",
					fontFamily: "var(--mono)",
					fontSize: 12,
					wordBreak: "break-all",
				}}
			>
				{value}
			</div>
		</div>
	);
}
