"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { toneColor } from "./console-styles";

type SsoState = {
	provider: string;
	status: "active" | "pending" | "unconfigured";
	lastSync: string;
};
type AuditEntry = {
	id: string;
	owner: string;
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

type StateResponse = {
	owner: string;
	sso: SsoState;
	audit: AuditEntry[];
	integrations: Integration[];
};

function formatLastSync(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const m = Math.floor(ms / 60000);
	if (m < 1) return "now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return new Date(iso).toISOString().slice(0, 10);
}

export type EnterpriseConsoleCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	backToOrg: string;
	contactSales: string;
	accountHref: string;
	orgHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	heroCta: string;
	heroCtaHref: string;
	ssoTitle: string;
	ssoSubtitle: string;
	auditTitle: string;
	auditSubtitle: string;
	auditViewAll: string;
	auditViewAllHref: string;
	integrationsTitle: string;
	integrationsSubtitle: string;
	integrationsViewAll: string;
	integrationsViewAllHref: string;
	supportTitle: string;
	supportSubtitle: string;
	supportSla: string;
	supportHours: string;
	supportAccountMgr: string;
};

export default function EnterpriseConsole({
	copy,
}: {
	copy: EnterpriseConsoleCopy;
}) {
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

	const metrics = useMemo(() => {
		if (!data) {
			return [
				{
					label: "Audit entries",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "Integrations",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "SSO provider",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
				{
					label: "SSO status",
					value: "-",
					detail: "loading",
					tone: "neutral" as const,
				},
			];
		}
		const connected = data.integrations.filter(
			(i) => i.status === "connected",
		).length;
		return [
			{
				label: "Audit entries",
				value: String(data.audit.length),
				detail: "most recent 20",
				tone: "ok" as const,
			},
			{
				label: "Integrations",
				value: String(data.integrations.length),
				detail: `${connected} connected`,
				tone: "ok" as const,
			},
			{
				label: "SSO provider",
				value: data.sso.provider,
				detail: `last sync ${formatLastSync(data.sso.lastSync)}`,
				tone: "ok" as const,
			},
			{
				label: "SSO status",
				value: data.sso.status,
				detail: "SAML 2.0 ready",
				tone:
					data.sso.status === "active" ? ("ok" as const) : ("warn" as const),
			},
		];
	}, [data]);

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
							display: "grid",
							gridTemplateColumns: "1.2fr 1fr",
							gap: 16,
							padding: "0 0 24px",
							borderBottom: "1px solid #1c2530",
							marginBottom: 0,
						}}
					>
						<div style={{ padding: "8px 0" }}>
							<div
								style={{
									color: "#3fb950",
									fontSize: 10,
									letterSpacing: ".18em",
									textTransform: "uppercase",
									fontFamily: "var(--mono)",
									marginBottom: 10,
								}}
							>
								{copy.heroEyebrow}
							</div>
							<h1
								style={{
									margin: 0,
									fontSize: 26,
									letterSpacing: "-.035em",
									fontWeight: 800,
									lineHeight: 1.15,
								}}
							>
								{copy.heroTitle}
							</h1>
							<p
								style={{
									color: "#8b949e",
									margin: "10px 0 14px",
									maxWidth: 540,
									fontSize: 13,
									lineHeight: 1.55,
								}}
							>
								{copy.heroBody}
							</p>
							<Link href={copy.heroCtaHref} className="btn btn-primary btn-sm">
								{copy.heroCta}
							</Link>
						</div>
						<div
							style={{
								position: "relative",
								borderRadius: 12,
								overflow: "hidden",
								minHeight: 160,
								background: "#0a0e15",
								border: "1px solid #1c2530",
							}}
						>
							<Image
								src="/paid-command-mesh.png"
								alt="Enterprise integrations"
								fill
								style={{ objectFit: "cover", opacity: 0.7 }}
								sizes="(max-width: 1280px) 100vw, 480px"
							/>
							<div
								style={{
									position: "absolute",
									inset: 0,
									background:
										"linear-gradient(180deg, rgba(10,14,21,.4) 0%, rgba(10,14,21,.92) 100%)",
								}}
							/>
							<div
								style={{
									position: "absolute",
									bottom: 12,
									left: 14,
									right: 14,
									fontFamily: "var(--mono)",
									fontSize: 11,
									color: "#8b949e",
									letterSpacing: ".05em",
								}}
							>
								<div style={{ color: "#f0f6fc", fontWeight: 700 }}>
									Compliance / Audit / SSO
								</div>
								<div style={{ marginTop: 4 }}>
									{data
										? `${data.audit.length} audit / ${data.integrations.length} integrations`
										: copy.loading}
								</div>
							</div>
						</div>
					</header>

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
					) : error ? (
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
					) : (
						<>
							{/* Metrics row */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 0,
									borderBottom: "1px solid #1c2530",
								}}
							>
								{metrics.map((metric, i) => (
									<div
										key={metric.label}
										style={{
											padding: "20px 16px",
											borderRight:
												i < metrics.length - 1 ? "1px solid #1c2530" : "none",
										}}
									>
										<div
											style={{
												color: "#8b949e",
												fontSize: 10,
												letterSpacing: ".14em",
												textTransform: "uppercase",
												fontFamily: "var(--mono)",
											}}
										>
											{metric.label}
										</div>
										<div
											style={{
												fontSize: metric.label === "SSO provider" ? 16 : 24,
												fontWeight: 800,
												letterSpacing: "-.03em",
												marginTop: 6,
												color: toneColor[metric.tone ?? "neutral"],
												fontFamily: "var(--mono)",
											}}
										>
											{metric.value}
										</div>
										<div
											style={{
												color: "#8b949e",
												fontSize: 11,
												marginTop: 4,
											}}
										>
											{metric.detail}
										</div>
									</div>
								))}
							</div>

							{/* SSO + Support side by side, no card boxes */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 0,
									borderBottom: "1px solid #1c2530",
								}}
							>
								<div
									style={{
										padding: "20px 16px 20px 0",
										borderRight: "1px solid #1c2530",
									}}
								>
									<div
										style={{
											color: "#3fb950",
											fontSize: 10,
											letterSpacing: ".14em",
											textTransform: "uppercase",
											fontFamily: "var(--mono)",
											marginBottom: 8,
										}}
									>
										{copy.ssoTitle}
									</div>
									<h3
										style={{
											margin: 0,
											fontSize: 14,
											letterSpacing: "-.02em",
											color: "#c9d1d9",
										}}
									>
										{copy.ssoSubtitle}
									</h3>
									<div
										style={{
											marginTop: 14,
											display: "grid",
											gap: 8,
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											<span style={{ color: "#8b949e" }}>Provider</span>
											<span style={{ color: "#f0f6fc" }}>
												{data?.sso.provider}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											<span style={{ color: "#8b949e" }}>Status</span>
											<span
												style={{
													color: "#3fb950",
													fontWeight: 600,
												}}
											>
												{data?.sso.status}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											<span style={{ color: "#8b949e" }}>Last sync</span>
											<span style={{ color: "#f0f6fc" }}>
												{data ? formatLastSync(data.sso.lastSync) : "-"}
											</span>
										</div>
									</div>
								</div>

								<div style={{ padding: "20px 0 20px 16px" }}>
									<div
										style={{
											color: "#3fb950",
											fontSize: 10,
											letterSpacing: ".14em",
											textTransform: "uppercase",
											fontFamily: "var(--mono)",
											marginBottom: 8,
										}}
									>
										{copy.supportTitle}
									</div>
									<h3
										style={{
											margin: 0,
											fontSize: 14,
											letterSpacing: "-.02em",
											color: "#c9d1d9",
										}}
									>
										{copy.supportSubtitle}
									</h3>
									<div
										style={{
											marginTop: 14,
											display: "grid",
											gridTemplateColumns: "1fr 1fr 1fr",
											gap: 0,
										}}
									>
										{[
											{ label: copy.supportSla, value: "1h P1" },
											{ label: copy.supportHours, value: "24 / 7" },
											{
												label: copy.supportAccountMgr,
												value: "assigned",
											},
										].map((row, i) => (
											<div
												key={row.label}
												style={{
													padding: "0 12px",
													borderRight: i < 2 ? "1px solid #1c2530" : "none",
												}}
											>
												<div
													style={{
														color: "#8b949e",
														fontSize: 10,
														letterSpacing: ".14em",
														textTransform: "uppercase",
														fontFamily: "var(--mono)",
													}}
												>
													{row.label}
												</div>
												<div
													style={{
														fontSize: 16,
														fontWeight: 800,
														fontFamily: "var(--mono)",
														color: "#f0f6fc",
														marginTop: 4,
													}}
												>
													{row.value}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Quick links - Audit / Integrations */}
							<div
								style={{
									padding: "20px 0 0",
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 0,
								}}
							>
								<Link
									href={copy.auditViewAllHref}
									style={{
										padding: "20px 16px 20px 0",
										borderTop: "1px solid #1c2530",
										borderRight: "1px solid #1c2530",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										textDecoration: "none",
										color: "#f0f6fc",
									}}
								>
									<div>
										<div
											style={{
												fontSize: 14,
												fontWeight: 700,
												marginBottom: 4,
											}}
										>
											{copy.auditTitle}
										</div>
										<div
											style={{
												fontSize: 12,
												color: "#8b949e",
											}}
										>
											{copy.auditSubtitle}
										</div>
									</div>
									<span
										style={{
											color: "#3fb950",
											fontFamily: "var(--mono)",
											fontSize: 12,
										}}
									>
										{copy.auditViewAll} →
									</span>
								</Link>
								<Link
									href={copy.integrationsViewAllHref}
									style={{
										padding: "20px 0 20px 16px",
										borderTop: "1px solid #1c2530",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										textDecoration: "none",
										color: "#f0f6fc",
									}}
								>
									<div>
										<div
											style={{
												fontSize: 14,
												fontWeight: 700,
												marginBottom: 4,
											}}
										>
											{copy.integrationsTitle}
										</div>
										<div
											style={{
												fontSize: 12,
												color: "#8b949e",
											}}
										>
											{copy.integrationsSubtitle}
										</div>
									</div>
									<span
										style={{
											color: "#3fb950",
											fontFamily: "var(--mono)",
											fontSize: 12,
										}}
									>
										{copy.integrationsViewAll} →
									</span>
								</Link>
							</div>
						</>
					)}
				</section>
			</div>
		</main>
	);
}
