"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
	const pathname = usePathname() ?? "";

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
		totalRepos > 0 && live
			? Math.round((live.repos.length / totalRepos) * 100)
			: 0;
	const isKo = copy.backHref.startsWith("/ko/");
	const metricLabels = isKo
		? {
				repos: "설치 레포",
				protected: "보호 커버리지",
				quarantined: "격리",
				cleared: "정상화",
				coverage:
					"이 화면은 팀 운영 범위입니다. 어떤 레포가 보호 중이고 어디에서 격리/정상화가 발생했는지 확인합니다.",
			}
		: {
				repos: "Installed repos",
				protected: "Coverage",
				quarantined: "Quarantined",
				cleared: "Cleared",
				coverage:
					"This is the team operations scope: which repos are protected and where quarantine/cleared activity happened.",
			};
	const activeBase = copy.nav.reduce<string | null>((best, item) => {
		const base = item.href.split("#")[0];
		const match = pathname === base || pathname.startsWith(`${base}/`);
		if (!match) return best;
		return !best || base.length > best.length ? base : best;
	}, null);

	return (
		<main className="org-experience">
			<div className="grid-bg" aria-hidden="true" />
			<div className="wide org-wide">
				<nav className="org-console-nav" aria-label="Team console sections">
					<div>
						<span className="org-nav-kicker mono">SlopGuard Team</span>
						<strong>{copy.workspace}</strong>
					</div>
					<div className="org-nav-links">
						{copy.nav.map((item) => {
							const base = item.href.split("#")[0];
							const active = activeBase === base;
							return (
								<Link
									key={item.label}
									href={item.href}
									className={active ? "active" : ""}
								>
									{item.label}
									{item.external ? <span>↗</span> : null}
								</Link>
							);
						})}
					</div>
				</nav>

				<header className="org-page-hero">
					<div>
						<div className="eyebrow mono">{copy.heroEyebrow}</div>
						<h1>{copy.heroTitle}</h1>
						<p>{copy.heroBody}</p>
					</div>
					<ul className="hero-spec org-page-spec">
						<li>
							<span>{metricLabels.repos}</span>
							<b>{live ? totalRepos : "-"}</b>
						</li>
						<li>
							<span>{metricLabels.protected}</span>
							<b>{live ? `${protectedPct}%` : "-"}</b>
						</li>
						<li>
							<span>{metricLabels.quarantined}</span>
							<b style={{ color: toneColor.danger }}>
								{live ? totalQuarantined : "-"}
							</b>
						</li>
						<li>
							<span>{metricLabels.cleared}</span>
							<b style={{ color: toneColor.ok }}>{live ? totalCleared : "-"}</b>
						</li>
					</ul>
				</header>

				{isLoading && <div className="org-status mono">{copy.loading}</div>}
				{error && <div className="org-status danger mono">{error}</div>}
				{notInstalled && (
					<div className="org-empty plate">
						<p>{copy.empty}</p>
						<Link href={copy.installHref} className="btn btn-primary btn-sm">
							{copy.installCta}
						</Link>
					</div>
				)}

				{live && (
					<section className="org-page-layout section">
						<div className="org-review-plate plate org-page-table">
							<div className="org-section-head">
								<div>
									<h2>{copy.columns.repo}</h2>
									<p>{metricLabels.coverage}</p>
								</div>
								<Link href={copy.backHref}>
									{copy.backLabel} <span>→</span>
								</Link>
							</div>
							<div className="org-repo-head mono">
								<span>{copy.columns.repo}</span>
								<span>{copy.columns.quarantined}</span>
								<span>{copy.columns.cleared}</span>
							</div>
							{live.repos.length === 0 ? (
								<div className="org-empty-line mono">{copy.empty}</div>
							) : (
								live.repos.map((repo) => (
									<div className="org-repo-row" key={repo.repo}>
										<span>{repo.repo}</span>
										<b>{repo.quarantined}</b>
										<em>{repo.cleared}</em>
									</div>
								))
							)}
						</div>
						<aside className="org-side-stack">
							<div className="org-mini-panel plate">
								<div className="org-section-head">
									<div>
										<h2>{metricLabels.protected}</h2>
										<p>{copy.connected}</p>
									</div>
								</div>
								<div className="org-policy-readout">
									<b>{protectedPct}%</b>
									<span>{metricLabels.coverage}</span>
								</div>
							</div>
						</aside>
					</section>
				)}
			</div>
		</main>
	);
}
