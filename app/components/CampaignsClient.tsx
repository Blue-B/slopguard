"use client";

import { useState } from "react";

type Commit = {
	repo: string;
	sha: string;
	title: string;
	author: string;
	when: string;
};

type Detail = {
	id: string;
	fingerprint: string;
	repoCount: number;
	totalCount: number;
	authorCount: number;
	firstSeen: string;
	repos: string[];
	authors: string[];
	commits: Commit[];
	repoImpact: Array<{ repo: string; quarantined: number; cleared: number }>;
};

type Props = {
	clusters: Array<{ id: string; fingerprint: string; risk: string }>;
	investigateLabel: string;
	loadingLabel: string;
	closeLabel: string;
	emptyCommitsLabel: string;
};

export default function CampaignsClient(props: Props) {
	const [open, setOpen] = useState<string | null>(null);
	const [detail, setDetail] = useState<Detail | null>(null);
	const [error, setError] = useState<string | null>(null);

	function investigate(id: string) {
		setOpen(id);
		setDetail(null);
		setError(null);
		fetch(`/api/campaigns/${encodeURIComponent(id)}`)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json();
			})
			.then((d) => setDetail(d as Detail))
			.catch((e) =>
				setError(e instanceof Error ? e.message : "failed to load"),
			);
	}

	return (
		<>
			{props.clusters.map((c) => (
				<div
					key={c.id}
					style={{
						borderTop: "1px solid #26313d",
						padding: "10px 0",
						display: "flex",
						justifyContent: "space-between",
						gap: 12,
						alignItems: "center",
					}}
				>
					<div style={{ ...{ fontFamily: "var(--mono)", fontSize: 13, color: "#c9d1d9" } }}>
						{c.fingerprint}
					</div>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => investigate(c.id)}
					>
						{props.investigateLabel}
					</button>
				</div>
			))}

			{open && (
				<div
					role="dialog"
					aria-modal="true"
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.6)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: 20,
						zIndex: 50,
					}}
					onClick={() => setOpen(null)}
				>
					<div
						style={{
							background: "#0b1016",
							border: "1px solid #26313d",
							borderRadius: 16,
							padding: 20,
							maxWidth: 720,
							width: "100%",
							maxHeight: "80vh",
							overflow: "auto",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 12,
							}}
						>
							<h3 style={{ margin: 0, fontSize: 18 }}>Campaign detail</h3>
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={() => setOpen(null)}
							>
								{props.closeLabel}
							</button>
						</div>
						{error && (
							<div style={{ color: "#f85149", fontSize: 13 }}>✗ {error}</div>
						)}
						{!detail && !error && (
							<div style={{ color: "#8b949e", fontSize: 13 }}>
								{props.loadingLabel}
							</div>
						)}
						{detail && (
							<>
								<div
									style={{
										fontFamily: "var(--mono)",
										fontSize: 13,
										color: "#c9d1d9",
										marginBottom: 12,
									}}
								>
									{detail.fingerprint}
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(4, 1fr)",
										gap: 8,
										marginBottom: 12,
									}}
								>
									<Stat label="Repos" value={detail.repoCount} />
									<Stat label="Hits" value={detail.totalCount} />
									<Stat label="Authors" value={detail.authorCount} />
									<Stat label="First seen" value={detail.firstSeen} />
								</div>
								<div style={{ fontSize: 12, color: "#8b949e", marginBottom: 6 }}>
									Repos
								</div>
								<ul style={{ margin: 0, paddingLeft: 18, marginBottom: 12 }}>
									{detail.repos.map((r) => (
										<li key={r} style={{ fontSize: 13, color: "#c9d1d9" }}>
											{r}
										</li>
									))}
								</ul>
								<div style={{ fontSize: 12, color: "#8b949e", marginBottom: 6 }}>
									Commits
								</div>
								{detail.commits.length === 0 ? (
									<div style={{ color: "#8b949e", fontSize: 13 }}>
										{props.emptyCommitsLabel}
									</div>
								) : (
									<table
										style={{
											width: "100%",
											borderCollapse: "collapse",
											fontSize: 12,
										}}
									>
										<tbody>
											{detail.commits.map((c) => (
												<tr
													key={c.repo + c.sha}
													style={{ borderBottom: "1px solid #18222e" }}
												>
													<td
														style={{
															padding: "8px",
															fontFamily: "var(--mono)",
															color: "#8b949e",
														}}
													>
														{c.repo}
													</td>
													<td style={{ padding: "8px", color: "#c9d1d9" }}>
														{c.title}
													</td>
													<td style={{ padding: "8px", color: "#8b949e" }}>
														{c.author}
													</td>
													<td
														style={{
															padding: "8px",
															color: "#8b949e",
															textAlign: "right",
														}}
													>
														{c.when}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div
			style={{
				border: "1px solid #26313d",
				borderRadius: 10,
				padding: 10,
				background: "#0f1620",
			}}
		>
			<div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
			<div style={{ color: "#8b949e", fontSize: 11 }}>{label}</div>
		</div>
	);
}
