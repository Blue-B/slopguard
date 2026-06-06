"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { toneColor } from "./console-styles";

type DashboardResponse =
	| {
			installed: true;
			owner: string;
			repoCount: number;
			repos: Array<{ repo: string; quarantined: number; cleared: number }>;
	  }
	| { installed: false; owner: string; reason: string };

export type ReposFullViewCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	installCta: string;
	installHref: string;
	backHref: string;
	backLabel: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	columns: { repo: string; quarantined: string; cleared: string };
};

export default function ReposFullView({ copy }: { copy: ReposFullViewCopy }) {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/team/dashboard", { cache: "no-store" });
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as DashboardResponse);
			} catch (e) {
				setError(e instanceof Error ? e.message : "load failed");
			}
		})();
	}, []);

	const isLoading = data === null && error === null;
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;

	const totalRepos = live?.repoCount ?? 0;
	const totalQuarantined =
		live?.repos.reduce((s, r) => s + r.quarantined, 0) ?? 0;
	const totalCleared = live?.repos.reduce((s, r) => s + r.cleared, 0) ?? 0;
	const protectedPct =
		totalRepos > 0 ? Math.round((live!.repos.length / totalRepos) * 100) : 0;
	const isKo = copy.backHref.startsWith("/ko/");
	const metricLabels = isKo
		? {
				repos: "설치된 레포",
				protected: "보호 중",
				quarantined: "격리",
				cleared: "정상 확인",
				coverage:
					"Team 플랜의 실시간 레포 커버리지입니다. 설치 범위가 늘수록 보호 범위도 늘어납니다.",
			}
		: {
				repos: "Installed repos",
				protected: "Protected",
				quarantined: "Quarantined",
				cleared: "Cleared",
				coverage:
					"Live Team-plan repo coverage. Install SlopGuard on more repos to expand protection.",
			};

	return (
		<main
			style={{ maxWidth: 1480, margin: "0 auto", padding: "18px 32px 96px" }}
		>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "260px minmax(0, 1fr)",
					gap: 32,
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
					{/* Premium Hero with generated asset */}
					<div
						style={{
							position: "relative",
							borderRadius: 16,
							overflow: "hidden",
							border: "1px solid #1c2530",
							marginBottom: 28,
							minHeight: 168,
							background: "#0a0e15",
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/paid-console-premium-header.png"
							alt=""
							style={{
								position: "absolute",
								inset: 0,
								width: "100%",
								height: "100%",
								objectFit: "cover",
								opacity: 0.55,
							}}
						/>
						<div
							style={{
								position: "absolute",
								inset: 0,
								background:
									"linear-gradient(90deg, rgba(10,14,21,0.92) 0%, rgba(10,14,21,0.65) 45%, rgba(10,14,21,0.35) 100%)",
							}}
						/>
						<div style={{ position: "relative", padding: "28px 32px" }}>
							<div
								style={{
									color: "#3fb950",
									fontSize: 10,
									letterSpacing: ".2em",
									fontFamily: "var(--mono)",
									marginBottom: 8,
								}}
							>
								{copy.heroEyebrow}
							</div>
							<h1
								style={{
									margin: 0,
									fontSize: 26,
									fontWeight: 800,
									letterSpacing: "-0.035em",
									lineHeight: 1.1,
								}}
							>
								{copy.heroTitle}
							</h1>
							<p
								style={{
									maxWidth: 520,
									color: "#8b949e",
									fontSize: 13,
									marginTop: 10,
									lineHeight: 1.5,
								}}
							>
								{copy.heroBody}
							</p>
							<div style={{ marginTop: 14 }}>
								<Link href={copy.backHref} className="btn btn-ghost btn-sm">
									← {copy.backLabel}
								</Link>
							</div>
						</div>
					</div>

					{/* Live Metrics - premium row, no cards */}
					{live && (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(4, 1fr)",
								gap: 0,
								borderBottom: "1px solid #1c2530",
								marginBottom: 24,
							}}
						>
							{[
								{
									label: metricLabels.repos,
									value: totalRepos,
									tone: "ok" as const,
								},
								{
									label: metricLabels.protected,
									value: live.repos.length,
									detail: `${protectedPct}%`,
									tone: "ok" as const,
								},
								{
									label: metricLabels.quarantined,
									value: totalQuarantined,
									tone: "danger" as const,
								},
								{
									label: metricLabels.cleared,
									value: totalCleared,
									tone: "ok" as const,
								},
							].map((m, i) => (
								<div
									key={i}
									style={{
										padding: "18px 20px",
										borderRight: i < 3 ? "1px solid #1c2530" : "none",
									}}
								>
									<div
										style={{
											color: "#8b949e",
											fontSize: 10,
											letterSpacing: ".14em",
											fontFamily: "var(--mono)",
										}}
									>
										{m.label}
									</div>
									<div
										style={{
											fontSize: 28,
											fontWeight: 800,
											letterSpacing: "-0.03em",
											marginTop: 4,
											fontFamily: "var(--mono)",
											color: toneColor[m.tone],
										}}
									>
										{m.value}
										{m.detail && (
											<span
												style={{
													fontSize: 13,
													marginLeft: 6,
													color: "#8b949e",
												}}
											>
												{m.detail}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{isLoading && (
						<div
							style={{
								padding: "60px 0",
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

					{notInstalled && (
						<div style={{ padding: "56px 0", textAlign: "center" }}>
							<p style={{ fontSize: 14, color: "#8b949e", marginBottom: 18 }}>
								{copy.empty}
							</p>
							<Link href={copy.installHref} className="btn btn-primary btn-sm">
								{copy.installCta}
							</Link>
						</div>
					)}

					{live && live.repos.length === 0 && (
						<div
							style={{
								padding: "56px 0",
								textAlign: "center",
								color: "#8b949e",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{copy.empty}
						</div>
					)}

					{live && live.repos.length > 0 && (
						<>
							{/* Premium table */}
							<div
								style={{
									border: "1px solid #1c2530",
									borderRadius: 14,
									overflow: "hidden",
									background: "#0d141d",
								}}
							>
								<table
									style={{
										width: "100%",
										borderCollapse: "collapse",
										fontSize: 13,
									}}
								>
									<thead>
										<tr style={{ background: "rgba(255,255,255,0.015)" }}>
											<th
												style={{
													textAlign: "left",
													padding: "14px 20px",
													fontSize: 10,
													letterSpacing: ".14em",
													textTransform: "uppercase",
													fontWeight: 600,
													color: "#7d8590",
													fontFamily: "var(--mono)",
													borderBottom: "1px solid #1c2530",
												}}
											>
												{copy.columns.repo}
											</th>
											<th
												style={{
													textAlign: "right",
													padding: "14px 20px",
													fontSize: 10,
													letterSpacing: ".14em",
													textTransform: "uppercase",
													fontWeight: 600,
													color: "#7d8590",
													fontFamily: "var(--mono)",
													borderBottom: "1px solid #1c2530",
												}}
											>
												{copy.columns.quarantined}
											</th>
											<th
												style={{
													textAlign: "right",
													padding: "14px 20px",
													fontSize: 10,
													letterSpacing: ".14em",
													textTransform: "uppercase",
													fontWeight: 600,
													color: "#7d8590",
													fontFamily: "var(--mono)",
													borderBottom: "1px solid #1c2530",
												}}
											>
												{copy.columns.cleared}
											</th>
										</tr>
									</thead>
									<tbody>
										{live.repos.map((row, idx) => (
											<tr
												key={row.repo}
												style={{
													borderTop: idx > 0 ? "1px solid #1c2530" : "none",
													transition: "background .1s ease",
												}}
											>
												<td
													style={{
														padding: "16px 20px",
														fontFamily: "var(--mono)",
														color: "#c9d1d9",
														fontWeight: 500,
													}}
												>
													{row.repo}
												</td>
												<td
													style={{
														padding: "16px 20px",
														textAlign: "right",
														fontFamily: "var(--mono)",
														color: row.quarantined > 0 ? "#f85149" : "#8b949e",
														fontWeight: 600,
													}}
												>
													{row.quarantined}
												</td>
												<td
													style={{
														padding: "16px 20px",
														textAlign: "right",
														fontFamily: "var(--mono)",
														color: row.cleared > 0 ? "#3fb950" : "#8b949e",
														fontWeight: 600,
													}}
												>
													{row.cleared}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div
								style={{
									marginTop: 16,
									fontSize: 11,
									color: "#8b949e",
									fontFamily: "var(--mono)",
								}}
							>
								{metricLabels.coverage}
							</div>
						</>
					)}
				</section>
			</div>
		</main>
	);
}
