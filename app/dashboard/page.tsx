import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import { PLANS } from "@/lib/billing/plans";
import { getOwnerSlopStats, type OwnerSlopStats } from "@/lib/github/storage";
import RepoLookup from "./RepoLookup";

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

function OrgOverview({ stats }: { stats: OwnerSlopStats }) {
	return (
		<>
			<div
				style={{
					display: "flex",
					gap: 12,
					margin: "8px 0 18px",
					flexWrap: "wrap",
				}}
			>
				<Stat label="quarantined" value={stats.quarantined} />
				<Stat label="cleared" value={stats.cleared} />
				<Stat label="open" value={stats.open} />
				<Stat label="repos watched" value={stats.repoCount} />
			</div>

			<h2 style={{ fontSize: 16, margin: "20px 0 8px" }}>Per-repo</h2>
			<div className="card" style={{ padding: 0, overflow: "hidden" }}>
				{stats.repos.length === 0 ? (
					<p className="muted" style={{ padding: 16 }}>
						No quarantined or cleared items across your repos yet. 🎉
					</p>
				) : (
					<table className="dash-table">
						<thead>
							<tr>
								<th>Repository</th>
								<th>Quarantined</th>
								<th>Cleared</th>
							</tr>
						</thead>
						<tbody>
							{stats.repos.map((r) => (
								<tr key={r.repo}>
									<td>
										<Link href={`/dashboard/${r.repo}`}>{r.repo}</Link>
									</td>
									<td>{r.quarantined}</td>
									<td>{r.cleared}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>
				Activity log{" "}
				<span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>
					(who/what/when, read live from GitHub)
				</span>
			</h2>
			<div className="card" style={{ padding: 0, overflow: "hidden" }}>
				{stats.recent.length === 0 ? (
					<p className="muted" style={{ padding: 16 }}>
						No activity yet.
					</p>
				) : (
					<table className="dash-table">
						<thead>
							<tr>
								<th>Item</th>
								<th>Author</th>
								<th>Status</th>
								<th>When</th>
							</tr>
						</thead>
						<tbody>
							{stats.recent.map((it) => (
								<tr key={it.url}>
									<td style={{ maxWidth: 360 }}>
										<a href={it.url}>
											{it.kind === "pull_request" ? "PR" : "#"}
											{it.number}
										</a>{" "}
										<span className="muted">{it.title}</span>
									</td>
									<td>@{it.author}</td>
									<td>
										<span className="mono" style={{ fontSize: 12 }}>
											{it.labels.includes("slop-cleared")
												? "cleared"
												: "quarantined"}
										</span>
									</td>
									<td className="muted" style={{ fontSize: 12 }}>
										{new Date(it.updatedAt).toISOString().slice(0, 10)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
}

export default async function DashboardIndex() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan = session ? PLANS[await planForOwner(session.login)] : null;
	const canOrg = Boolean(plan?.orgDashboard);

	let orgStats: OwnerSlopStats | null = null;
	let orgError: string | null = null;
	if (session && canOrg) {
		try {
			orgStats = await getOwnerSlopStats(session.login, plan!.maxRepos);
		} catch (e) {
			orgError = e instanceof Error ? e.message : String(e);
		}
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
					<Link href="/">Home</Link>
					<Link href="/account">Account</Link>
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 880, paddingTop: 40 }}>
				<h1
					style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 6px" }}
				>
					🛡️ Dashboard
				</h1>

				{session && canOrg ? (
					<>
						<p className="muted" style={{ marginTop: 0 }}>
							Org-wide view for <b>@{session.login}</b> across every repo
							SlopGuard watches.
						</p>
						{orgError ? (
							<div className="card">
								<strong>Couldn&apos;t load org data.</strong>
								<p className="muted">{orgError}</p>
								<p>
									Make sure SlopGuard is installed on your account:{" "}
									<Link href="/install">install the App</Link>.
								</p>
							</div>
						) : (
							orgStats && <OrgOverview stats={orgStats} />
						)}
						<h2 style={{ fontSize: 16, margin: "28px 0 8px" }}>
							Open a single repo
						</h2>
						<RepoLookup />
					</>
				) : (
					<>
						<p className="muted" style={{ marginTop: 0 }}>
							Enter an <code>owner/repo</code> where SlopGuard is installed to
							see its slop history.
						</p>
						<RepoLookup />
						{session ? (
							<div
								className="card"
								style={{
									marginTop: 20,
									borderColor: "rgba(63,185,80,0.4)",
									background: "rgba(63,185,80,0.06)",
								}}
							>
								<b>Want the org-wide dashboard?</b>
								<p
									className="muted"
									style={{ fontSize: 14, margin: "6px 0 12px" }}
								>
									Team aggregates every repo, adds an activity/audit log, and
									sends Slack/Discord alerts on quarantine.
								</p>
								<Link className="btn btn-primary" href="/pricing">
									See Team
								</Link>
							</div>
						) : (
							<p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
								<Link href="/account">Sign in</Link> to see your org-wide
								dashboard (Team plan).
							</p>
						)}
					</>
				)}
			</main>
		</>
	);
}
