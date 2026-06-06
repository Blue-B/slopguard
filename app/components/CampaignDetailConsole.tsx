"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConsoleSidebar, { type SidebarItem } from "./ConsoleSidebar";
import { muted, toneColor } from "./console-styles";

type Detail = {
	id: string;
	fingerprint: string;
	repoCount: number;
	totalCount: number;
	authorCount: number;
	firstSeen: string;
	repos: string[];
	authors: string[];
	commits: Array<{
		repo: string;
		sha: string;
		title: string;
		author: string;
		when: string;
	}>;
	repoImpact: Array<{ repo: string; quarantined: number; cleared: number }>;
};

export type CampaignDetailCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	backHref: string;
	backLabel: string;
	loading: string;
	error: string;
	heading: string;
	subhead: string;
	metrics: { repos: string; hits: string; authors: string; firstSeen: string };
	commitsTitle: string;
	impactTitle: string;
};

export default function CampaignDetailConsole({
	id,
	copy,
}: {
	id: string;
	copy: CampaignDetailCopy;
}) {
	const [data, setData] = useState<Detail | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`, {
					cache: "no-store",
				});
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as Detail);
				setError(null);
			} catch (e) {
				setError(e instanceof Error ? e.message : copy.error);
			}
		})();
	}, [copy.error, id]);

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
					activeNav="Campaigns"
				/>
				<section>
					<header
						style={{
							position: "relative",
							overflow: "hidden",
							border: "1px solid #1c2530",
							borderRadius: 18,
							padding: "34px 38px",
							marginBottom: 30,
							backgroundImage:
								"linear-gradient(90deg, rgba(10,14,21,0.97), rgba(10,14,21,0.72)), url('/paid-feature-evidence-visual.png')",
							backgroundSize: "cover",
							backgroundPosition: "center right",
						}}
					>
						<div
							style={{
								color: "#3fb950",
								fontSize: 10,
								letterSpacing: ".18em",
								fontFamily: "var(--mono)",
								marginBottom: 10,
							}}
						>
							{copy.heading}
						</div>
						<h1
							style={{
								margin: 0,
								fontSize: 32,
								lineHeight: 1.05,
								letterSpacing: "-.04em",
								maxWidth: 720,
							}}
						>
							{data?.fingerprint ?? id.replaceAll("_", " ")}
						</h1>
						<p
							style={{
								...muted,
								maxWidth: 620,
								margin: "12px 0 0",
								fontSize: 14,
								lineHeight: 1.55,
							}}
						>
							{copy.subhead}
						</p>
						<Link
							href={copy.backHref}
							className="btn btn-ghost btn-sm"
							style={{ marginTop: 18 }}
							prefetch={false}
						>
							← {copy.backLabel}
						</Link>
					</header>

					{!data && !error && (
						<div
							style={{
								...muted,
								padding: "42px 0",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{copy.loading}
						</div>
					)}
					{error && (
						<div
							style={{
								color: "#f85149",
								padding: "16px 0",
								fontFamily: "var(--mono)",
								fontSize: 12,
							}}
						>
							{copy.error}: {error}
						</div>
					)}

					{data && (
						<>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									borderTop: "1px solid #1c2530",
									borderBottom: "1px solid #1c2530",
									marginBottom: 30,
								}}
							>
								{[
									{
										label: copy.metrics.repos,
										value: data.repoCount,
										tone: "ok" as const,
									},
									{
										label: copy.metrics.hits,
										value: data.totalCount,
										tone: "danger" as const,
									},
									{
										label: copy.metrics.authors,
										value: data.authorCount,
										tone: "neutral" as const,
									},
									{
										label: copy.metrics.firstSeen,
										value: data.firstSeen,
										tone: "neutral" as const,
									},
								].map((m, i) => (
									<div
										key={m.label}
										style={{
											padding: "18px 18px 18px 0",
											borderRight: i < 3 ? "1px solid #1c2530" : "none",
										}}
									>
										<div
											style={{
												...muted,
												fontSize: 10,
												letterSpacing: ".14em",
												fontFamily: "var(--mono)",
											}}
										>
											{m.label}
										</div>
										<div
											style={{
												color: toneColor[m.tone],
												fontSize: 24,
												fontWeight: 800,
												fontFamily: "var(--mono)",
												marginTop: 5,
											}}
										>
											{m.value}
										</div>
									</div>
								))}
							</div>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1.15fr .85fr",
									gap: 28,
								}}
							>
								<section>
									<h2 style={{ margin: "0 0 12px", fontSize: 15 }}>
										{copy.commitsTitle}
									</h2>
									<div style={{ borderTop: "1px solid #1c2530" }}>
										{data.commits.map((commit) => (
											<div
												key={`${commit.repo}-${commit.sha}`}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr auto",
													gap: 16,
													padding: "14px 0",
													borderBottom: "1px solid #1c2530",
												}}
											>
												<div>
													<div style={{ color: "#f0f6fc", fontSize: 13 }}>
														{commit.title}
													</div>
													<div
														style={{
															...muted,
															fontSize: 12,
															fontFamily: "var(--mono)",
															marginTop: 3,
														}}
													>
														{commit.repo} / {commit.author}
													</div>
												</div>
												<div
													style={{
														...muted,
														fontSize: 12,
														fontFamily: "var(--mono)",
														textAlign: "right",
													}}
												>
													{commit.when}
												</div>
											</div>
										))}
									</div>
								</section>
								<section>
									<h2 style={{ margin: "0 0 12px", fontSize: 15 }}>
										{copy.impactTitle}
									</h2>
									<div style={{ borderTop: "1px solid #1c2530" }}>
										{data.repoImpact.map((repo) => (
											<div
												key={repo.repo}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr auto",
													gap: 12,
													padding: "14px 0",
													borderBottom: "1px solid #1c2530",
												}}
											>
												<div
													style={{
														color: "#f0f6fc",
														fontFamily: "var(--mono)",
														fontSize: 12,
													}}
												>
													{repo.repo}
												</div>
												<div
													style={{
														color: "#8b949e",
														fontFamily: "var(--mono)",
														fontSize: 12,
													}}
												>
													{repo.quarantined} / {repo.cleared}
												</div>
											</div>
										))}
									</div>
								</section>
							</div>
						</>
					)}
				</section>
			</div>
		</main>
	);
}
