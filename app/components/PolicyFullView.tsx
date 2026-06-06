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
	const total = live?.repoCount ?? 0;
	const covered = live?.repos.length ?? 0;
	const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
	const quarantined = live?.quarantined ?? 0;
	const cleared = live?.cleared ?? 0;
	const isKo = copy.backHref.startsWith("/ko/");
	const labels = isKo
		? {
				installed: "설치 레포",
				applied: "정책 적용",
				quarantined: "격리",
				cleared: "정상화",
				docs: "문서 열기",
				coverage: "레포가 팀 정책 신호로 보호 중입니다.",
				gap: "아직 격리 활동이 없는 레포는 첫 활동 발생 시 자동으로 보호 상태에 포함됩니다.",
			}
		: {
				installed: "Installed repos",
				applied: "Policy applied",
				quarantined: "Quarantined",
				cleared: "Cleared",
				docs: "Open docs",
				coverage: "repos currently covered by Team policy signals.",
				gap: "Repos without quarantine activity are included automatically when their first protected activity appears.",
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
							<span>{labels.installed}</span>
							<b>{live ? total : "-"}</b>
						</li>
						<li>
							<span>{labels.applied}</span>
							<b style={{ color: toneColor.ok }}>{live ? `${pct}%` : "-"}</b>
						</li>
						<li>
							<span>{labels.quarantined}</span>
							<b style={{ color: toneColor.danger }}>
								{live ? quarantined : "-"}
							</b>
						</li>
						<li>
							<span>{labels.cleared}</span>
							<b style={{ color: toneColor.ok }}>{live ? cleared : "-"}</b>
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
						<div className="org-mini-panel plate org-policy-main">
							<div className="org-section-head">
								<div>
									<h2>{copy.policyFileTitle}</h2>
									<p>{copy.policyFileBody}</p>
								</div>
								<Link href={copy.docsHref}>
									{labels.docs} <span>→</span>
								</Link>
							</div>
							<div className="org-policy-readout large">
								<b>{pct}%</b>
								<span>
									{covered}/{total} {labels.coverage}
								</span>
							</div>
							{covered < total && (
								<div className="org-empty-line mono warn">
									{total - covered} · {labels.gap}
								</div>
							)}
						</div>
						<aside className="org-side-stack">
							{[
								{
									label: labels.installed,
									value: total,
									tone: "neutral" as const,
								},
								{
									label: labels.quarantined,
									value: quarantined,
									tone: "danger" as const,
								},
								{ label: labels.cleared, value: cleared, tone: "ok" as const },
							].map((m) => (
								<div
									className="org-mini-panel plate org-metric-card"
									key={m.label}
								>
									<span className="mono">{m.label}</span>
									<b style={{ color: toneColor[m.tone] }}>{m.value}</b>
								</div>
							))}
						</aside>
					</section>
				)}
			</div>
		</main>
	);
}
