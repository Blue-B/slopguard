"use client";

import { useEffect, useState } from "react";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import Link from "next/link";
import type { SidebarItem } from "./ConsoleSidebar";
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
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	installCta: string;
	installHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	labels: {
		installed: string;
		coverage: string;
		quarantined: string;
		cleared: string;
		coverageNote: string;
	};
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
	const notInstalled = data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;
	const totalRepos = live?.repoCount ?? 0;
	const totalQuarantined = live?.repos.reduce((s, r) => s + r.quarantined, 0) ?? 0;
	const totalCleared = live?.repos.reduce((s, r) => s + r.cleared, 0) ?? 0;
	const protectedPct =
		totalRepos > 0 && live ? Math.round((live.repos.length / totalRepos) * 100) : 0;
	const l = copy.labels;

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-command.png"
				imageAlt="Repository protection scope"
				plateLabel="repository scope"
				connected={copy.connected}
				metrics={[
					{ label: l.installed, value: live ? totalRepos : "-" },
					{ label: l.coverage, value: live ? `${protectedPct}%` : "-", tone: "ok" },
					{ label: l.quarantined, value: live ? totalQuarantined : "-", tone: "danger" },
					{ label: l.cleared, value: live ? totalCleared : "-", tone: "ok" },
				]}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && <ConsoleStatus danger>{error}</ConsoleStatus>}
			{notInstalled && (
				<div className="plate console-empty">
					<p>{copy.empty}</p>
					<Link href={copy.installHref} className="btn btn-primary btn-sm">
						{copy.installCta}
					</Link>
				</div>
			)}

			{live && (
				<section className="console-section console-grid">
					<div className="plate console-table">
						<ConsoleSectionHead title={copy.columns.repo} sub={l.coverageNote} />
						<div className="console-th" style={{ gridTemplateColumns: "minmax(0,1fr) 110px 110px" }}>
							<span>{copy.columns.repo}</span>
							<span style={{ textAlign: "right" }}>{copy.columns.quarantined}</span>
							<span style={{ textAlign: "right" }}>{copy.columns.cleared}</span>
						</div>
						{live.repos.length === 0 ? (
							<div className="console-empty-line">{copy.empty}</div>
						) : (
							live.repos.map((repo) => (
								<div
									className="console-tr"
									key={repo.repo}
									style={{ gridTemplateColumns: "minmax(0,1fr) 110px 110px" }}
								>
									<span style={{ fontFamily: "var(--mono)" }}>{repo.repo}</span>
									<b style={{ fontFamily: "var(--mono)", color: toneColor.danger, textAlign: "right" }}>
										{repo.quarantined}
									</b>
									<b style={{ fontFamily: "var(--mono)", color: toneColor.ok, textAlign: "right" }}>
										{repo.cleared}
									</b>
								</div>
							))
						)}
					</div>
					<aside className="console-side-stack">
						<div className="plate console-metric">
							<span>{l.coverage}</span>
							<b style={{ color: toneColor.ok }}>{protectedPct}%</b>
							<p style={{ color: "var(--muted)", fontSize: 13, margin: "12px 0 0", lineHeight: 1.5 }}>
								{l.coverageNote}
							</p>
						</div>
					</aside>
				</section>
			)}
		</ConsoleShell>
	);
}
