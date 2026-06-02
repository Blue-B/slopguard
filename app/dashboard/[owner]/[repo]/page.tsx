import Link from "next/link";
import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="card" style={{ textAlign: "center", flex: 1, margin: 0 }}>
			<div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
			<div style={{ color: "var(--muted)", fontSize: 13 }}>{label}</div>
		</div>
	);
}

export default async function RepoDashboard({
	params,
}: {
	params: Promise<{ owner: string; repo: string }>;
}) {
	const { owner, repo } = await params;

	let stats: RepoSlopStats | null = null;
	let error: string | null = null;
	try {
		stats = await getRepoSlopStats(owner, repo);
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
	}

	return (
		<>
			<nav className="nav">
				<Link className="brand" href="/">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<Link href="/dashboard">Dashboard</Link>
					<Link href="/account">Account</Link>
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 880, paddingTop: 40 }}>
				<span className="eyebrow">
					<span className="dot" /> repository
				</span>
				<h1
					style={{
						fontSize: 26,
						letterSpacing: "-0.02em",
						margin: "14px 0 4px",
					}}
				>
					{owner}/{repo}
				</h1>
				<p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
					Slop history, read live from GitHub (no database).{" "}
					<a href={`https://github.com/${owner}/${repo}`}>View on GitHub &rarr;</a>
				</p>

				{error && (
					<div
						className="card"
						style={{
							borderColor: "rgba(210,153,34,0.4)",
							background: "rgba(210,153,34,0.06)",
							marginTop: 18,
						}}
					>
						<strong>Couldn&apos;t load data.</strong>
						<p className="muted" style={{ fontSize: 14, margin: "6px 0 8px" }}>
							{error}
						</p>
						<p style={{ fontSize: 14, margin: 0 }}>
							Make sure SlopGuard is installed on this repo:{" "}
							<Link href="/install">install the App</Link>.
						</p>
					</div>
				)}

				{stats && (
					<>
						<div
							style={{
								display: "flex",
								gap: 12,
								margin: "20px 0 0",
								flexWrap: "wrap",
							}}
						>
							<Stat label="quarantined" value={stats.quarantined} />
							<Stat label="cleared" value={stats.cleared} />
							<Stat label="open" value={stats.open} />
							<Stat label="closed" value={stats.closed} />
						</div>

						<h2 style={{ fontSize: 16, margin: "26px 0 8px" }}>Recent items</h2>
						<div className="card" style={{ padding: 0, overflow: "hidden" }}>
							{stats.items.length === 0 ? (
								<p className="muted" style={{ padding: 16, margin: 0 }}>
									No quarantined or cleared items yet.
								</p>
							) : (
								<table className="dash-table">
									<thead>
										<tr>
											<th>Item</th>
											<th>Kind</th>
											<th>State</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{stats.items.map((it) => (
											<tr key={it.number}>
												<td style={{ maxWidth: 380 }}>
													<a href={it.url}>#{it.number}</a>{" "}
													<span className="muted">{it.title}</span>
												</td>
												<td>{it.kind === "pull_request" ? "PR" : "issue"}</td>
												<td>{it.state}</td>
												<td>
													<span className="mono" style={{ fontSize: 12 }}>
														{it.labels.includes("slop-cleared")
															? "cleared"
															: "quarantined"}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						<p style={{ marginTop: 18 }}>
							<Link className="muted" href="/dashboard" style={{ fontSize: 14 }}>
								&larr; All repositories
							</Link>
						</p>
					</>
				)}
			</main>
		</>
	);
}
