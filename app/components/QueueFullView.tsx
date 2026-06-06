"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";

type RecentItem = {
	number: number;
	title: string;
	url: string;
	kind: "issue" | "pull_request";
	state: "open" | "closed";
	author: string;
	labels: string[];
	createdAt: string;
	updatedAt: string;
};

type DashboardResponse =
	| {
			installed: true;
			owner: string;
			repoCount: number;
			quarantined: number;
			cleared: number;
			open: number;
			closed: number;
			recent: RecentItem[];
			repos: Array<{ repo: string; quarantined: number; cleared: number }>;
	  }
	| { installed: false; owner: string; reason: string };

function deriveStatus(labels: string[]): string {
	if (labels.some((l) => l.toLowerCase().includes("quarantine")))
		return "Quarantined";
	if (labels.some((l) => l.toLowerCase().includes("cleared"))) return "Cleared";
	return "Watching";
}
function deriveScore(labels: string[]): number {
	const l = labels.map((x) => x.toLowerCase()).join(" ");
	if (l.includes("quarantine")) return 78;
	if (l.includes("cleared")) return 24;
	return 46;
}
function formatAge(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const m = Math.floor(ms / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	return `${Math.floor(h / 24)}d`;
}
function extractRepo(url: string): string {
	const m =
		url.match(/repos\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/\d+/) ??
		url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/\d+/);
	return m ? `${m[1]}/${m[2]}` : "-";
}

export type QueueFullViewCopy = {
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
	columns: {
		item: string;
		repo: string;
		score: string;
		status: string;
		owner: string;
		age: string;
	};
};

export default function QueueFullView({ copy }: { copy: QueueFullViewCopy }) {
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

	const isKo = copy.backHref.startsWith("/ko/");
	const queueEmpty = isKo
		? "아직 격리 항목이 없습니다. 새 활동이 생기면 여기에 표시됩니다."
		: "No quarantine items yet. New activity shows up here.";

	const rows = (live?.recent ?? []).map((it) => ({
		key: `${it.url}#${it.number}`,
		item: it.title,
		repo: extractRepo(it.url),
		score: deriveScore(it.labels),
		status: deriveStatus(it.labels),
		owner: `@${it.author}`,
		age: formatAge(it.updatedAt),
		href: it.url
			.replace("api.github.com", "github.com")
			.replace(/\/repos\//, "/"),
	}));

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

					{live && rows.length === 0 && (
						<div
							style={{
								padding: "56px 0",
								textAlign: "center",
								color: "#8b949e",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{queueEmpty}
						</div>
					)}

					{live && rows.length > 0 && (
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
										{(
											[
												"item",
												"repo",
												"score",
												"status",
												"owner",
												"age",
											] as const
										).map((k) => (
											<th
												key={k}
												style={{
													textAlign:
														k === "score" || k === "age" ? "right" : "left",
													padding: "14px 18px",
													fontSize: 10,
													letterSpacing: ".14em",
													textTransform: "uppercase",
													fontWeight: 600,
													color: "#7d8590",
													fontFamily: "var(--mono)",
													borderBottom: "1px solid #1c2530",
												}}
											>
												{copy.columns[k]}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rows.map((row) => (
										<tr
											key={row.key}
											style={{ borderTop: "1px solid #1c2530" }}
										>
											<td
												style={{
													padding: "14px 18px",
													fontFamily: "var(--mono)",
													color: "#c9d1d9",
												}}
											>
												<Link
													href={row.href}
													target="_blank"
													rel="noreferrer"
													style={{ color: "#c9d1d9", textDecoration: "none" }}
												>
													{row.item}
												</Link>
											</td>
											<td
												style={{
													padding: "14px 18px",
													color: "#c9d1d9",
													fontFamily: "var(--mono)",
												}}
											>
												{row.repo}
											</td>
											<td
												style={{
													padding: "14px 18px",
													textAlign: "right",
													fontFamily: "var(--mono)",
													color:
														row.score >= 70
															? "#f85149"
															: row.score >= 50
																? "#d29922"
																: "#3fb950",
													fontWeight: 600,
												}}
											>
												{row.score}
											</td>
											<td style={{ padding: "14px 18px" }}>
												<span
													style={{
														fontSize: 11,
														padding: "2px 10px",
														borderRadius: 999,
														background:
															row.status === "Quarantined"
																? "rgba(248,81,73,0.12)"
																: row.status === "Cleared"
																	? "rgba(63,185,80,0.12)"
																	: "rgba(210,153,34,0.12)",
														color:
															row.status === "Quarantined"
																? "#f85149"
																: row.status === "Cleared"
																	? "#3fb950"
																	: "#d29922",
														fontFamily: "var(--mono)",
													}}
												>
													{row.status}
												</span>
											</td>
											<td
												style={{
													padding: "14px 18px",
													color: "#8b949e",
													fontFamily: "var(--mono)",
												}}
											>
												{row.owner}
											</td>
											<td
												style={{
													padding: "14px 18px",
													textAlign: "right",
													color: "#8b949e",
													fontFamily: "var(--mono)",
												}}
											>
												{row.age}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
