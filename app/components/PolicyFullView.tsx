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
			quarantined: number;
			cleared: number;
			repos: Array<{ repo: string; quarantined: number; cleared: number }>;
	  }
	| { installed: false; owner: string; reason: string };

export type PolicyFullViewCopy = {
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
	policyFileTitle: string;
	policyFileBody: string;
	docsHref: string;
};

export default function PolicyFullView({ copy }: { copy: PolicyFullViewCopy }) {
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

	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
	const quarantined = live?.quarantined ?? 0;
	const cleared = live?.cleared ?? 0;

	return (
		<main
			style={{ maxWidth: 1480, margin: "0 auto", padding: "18px 32px 96px" }}
		>
			<div
				style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 32 }}
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
					{/* Premium Hero */}
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
							src="/paid-command-mesh.png"
							alt=""
							style={{
								position: "absolute",
								inset: 0,
								width: "100%",
								height: "100%",
								objectFit: "cover",
								opacity: 0.5,
							}}
						/>
						<div
							style={{
								position: "absolute",
								inset: 0,
								background:
									"linear-gradient(90deg, rgba(10,14,21,0.92) 0%, rgba(10,14,21,0.6) 50%, rgba(10,14,21,0.3) 100%)",
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
									maxWidth: 540,
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

					{live && (
						<>
							{/* Coverage metrics - premium */}
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
										label: "설치 레포",
										value: total,
										tone: "neutral" as const,
									},
									{
										label: "정책 적용",
										value: covered,
										detail: `${pct}%`,
										tone: "ok" as const,
									},
									{
										label: "격리",
										value: quarantined,
										tone: "danger" as const,
									},
									{ label: "정상 확인", value: cleared, tone: "ok" as const },
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

							<div
								style={{
									border: "1px solid #1c2530",
									borderRadius: 14,
									padding: "24px 28px",
									background: "#0d141d",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div>
										<div style={{ fontSize: 15, fontWeight: 600 }}>
											{copy.policyFileTitle}
										</div>
										<p
											style={{
												color: "#8b949e",
												fontSize: 13,
												marginTop: 6,
												maxWidth: 520,
											}}
										>
											{copy.policyFileBody}
										</p>
									</div>
									<Link href={copy.docsHref} className="btn btn-ghost btn-sm">
										Open docs →
									</Link>
								</div>
							</div>

							{covered < total && (
								<div
									style={{
										marginTop: 16,
										fontSize: 12,
										color: "#d29922",
										fontFamily: "var(--mono)",
									}}
								>
									{total - covered}개 레포는 아직 격리 활동이 없어 보호 상태로
									표시되지 않았습니다. 첫 활동 발생 시 자동 보호됩니다.
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</main>
	);
}
