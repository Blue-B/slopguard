import Link from "next/link";
import { INSTALL_URL } from "@/lib/config";
import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="card" style={{ textAlign: "center", flex: 1, margin: 0 }}>
			<div style={{ fontSize: 32, fontWeight: 800 }}>{value}</div>
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
		<main className="container">
			<Link href="/" style={{ fontSize: 13 }}>
				← SlopGuard
			</Link>
			<h1 style={{ marginBottom: 4 }}>
				🛡️ {owner}/{repo}
			</h1>
			<p style={{ color: "var(--muted)", marginTop: 0 }}>
				Slop history — read live from GitHub (no database).
			</p>

			{error && (
				<div className="card" style={{ borderColor: "var(--accent)" }}>
					<strong>Couldn&apos;t load data.</strong>
					<p style={{ color: "var(--muted)" }}>{error}</p>
					<p>
						Make sure SlopGuard is installed on this repo:{" "}
						<a href={INSTALL_URL}>install the App</a>.
					</p>
				</div>
			)}

			{stats && (
				<>
					<div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
						<Stat label="quarantined" value={stats.quarantined} />
						<Stat label="cleared" value={stats.cleared} />
						<Stat label="open" value={stats.open} />
						<Stat label="closed" value={stats.closed} />
					</div>

					<div className="card">
						<h3 style={{ marginTop: 0 }}>Recent items</h3>
						{stats.items.length === 0 ? (
							<p style={{ color: "var(--muted)" }}>
								No quarantined or cleared items yet. 🎉
							</p>
						) : (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ textAlign: "left", color: "var(--muted)" }}>
										<th style={{ padding: "6px 4px" }}>#</th>
										<th>Title</th>
										<th>Kind</th>
										<th>State</th>
										<th>Labels</th>
									</tr>
								</thead>
								<tbody>
									{stats.items.map((it) => (
										<tr
											key={it.number}
											style={{ borderTop: "1px solid var(--border)" }}
										>
											<td style={{ padding: "8px 4px" }}>
												<a href={it.url}>#{it.number}</a>
											</td>
											<td>{it.title}</td>
											<td>{it.kind === "pull_request" ? "PR" : "issue"}</td>
											<td>{it.state}</td>
											<td style={{ fontSize: 12, color: "var(--muted)" }}>
												{it.labels.join(", ")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</>
			)}
		</main>
	);
}
