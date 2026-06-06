"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";

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
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connectedLabel: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	backHref: string;
	backLabel: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	connect: string;
	disconnect: string;
	pending: string;
	available: string;
	connected: string;
};

function statusColor(s: Integration["status"]): string {
	return s === "connected"
		? "#3fb950"
		: s === "pending"
			? "#d29922"
			: "#8b949e";
}

function statusLabel(
	s: Integration["status"],
	copy: IntegrationsFullViewCopy,
): string {
	return s === "connected"
		? copy.connected
		: s === "pending"
			? copy.pending
			: copy.available;
}

export default function IntegrationsFullView({
	copy,
}: {
	copy: IntegrationsFullViewCopy;
}) {
	const [data, setData] = useState<IntegrationsResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<string | null>(null);
	const [flash, setFlash] = useState<string>("");

	async function load() {
		try {
			const res = await fetch("/api/enterprise/integrations", {
				cache: "no-store",
			});
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
		const action = currentStatus === "connected" ? "disconnect" : "connect";
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
					connected={copy.connectedLabel}
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
								"linear-gradient(90deg, rgba(10,14,21,0.97) 0%, rgba(10,14,21,0.78) 52%, rgba(10,14,21,0.46) 100%), url('/paid-feature-evidence-visual.png')",
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
							{flash && (
								<span
									style={{
										color: "#3fb950",
										fontFamily: "var(--mono)",
										fontSize: 11,
									}}
								>
									{flash}
								</span>
							)}
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

					{!isLoading && items.length === 0 && (
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

					{items.length > 0 && (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
								gap: 0,
								borderTop: "1px solid #1c2530",
							}}
						>
							{items.map((integration) => {
								const isConnected = integration.status === "connected";
								return (
									<div
										key={integration.name}
										style={{
											padding: "20px 16px",
											borderBottom: "1px solid #1c2530",
											borderRight: "1px solid #1c2530",
											display: "flex",
											flexDirection: "column",
											gap: 10,
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<div
												style={{
													fontSize: 15,
													fontWeight: 700,
													color: "#f0f6fc",
												}}
											>
												{integration.name}
											</div>
											<span
												style={{
													fontSize: 10,
													padding: "2px 8px",
													borderRadius: 99,
													fontFamily: "var(--mono)",
													textTransform: "uppercase",
													letterSpacing: ".08em",
													color: statusColor(integration.status),
													background: `${statusColor(integration.status)}20`,
												}}
											>
												{statusLabel(integration.status, copy)}
											</span>
										</div>
										<div
											style={{
												color: "#8b949e",
												fontSize: 12,
												fontFamily: "var(--mono)",
											}}
										>
											{integration.scope}
										</div>
										<button
											type="button"
											className={
												isConnected
													? "btn btn-ghost btn-sm"
													: "btn btn-primary btn-sm"
											}
											disabled={busy === integration.name}
											onClick={() =>
												toggle(integration.name, integration.status)
											}
											style={{ alignSelf: "flex-start" }}
										>
											{busy === integration.name
												? "..."
												: isConnected
													? copy.disconnect
													: copy.connect}
										</button>
									</div>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
