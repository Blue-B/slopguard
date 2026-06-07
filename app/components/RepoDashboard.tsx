import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";
import type { Lang } from "@/lib/i18n";
import Link from "next/link";
import MarketingNav from "./MarketingNav";
import SiteFooter from "./SiteFooter";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";

const T = {
	en: {
		eyebrow: "REPOSITORY",
		kicker: "SlopGuard",
		sub: "Slop history, read live from GitHub (no database).",
		viewGithub: "View on GitHub",
		cantLoad: "Couldn't load data.",
		installNote: "Make sure SlopGuard is installed on this repo:",
		installApp: "install the App",
		recent: "Recent items",
		recentSub: "Quarantined and cleared issues/PRs for this repository.",
		noItems: "No quarantined or cleared items yet.",
		colItem: "Item",
		colState: "State",
		colStatus: "Status",
		quarantined: "quarantined",
		cleared: "cleared",
		stats: { q: "Quarantined", c: "Cleared", o: "Open", x: "Closed" },
		legend:
			"Quarantined = SlopGuard flagged it for review. Cleared = a maintainer marked it OK. Open / closed is the GitHub state.",
	},
	ko: {
		eyebrow: "REPOSITORY",
		kicker: "SlopGuard",
		sub: "슬롭 기록입니다. GitHub에서 실시간으로 읽어옵니다 (DB 없음).",
		viewGithub: "GitHub에서 보기",
		cantLoad: "데이터를 불러오지 못했습니다.",
		installNote: "이 레포에 SlopGuard가 설치되어 있는지 확인하세요:",
		installApp: "앱 설치하기",
		recent: "최근 항목",
		recentSub: "이 레포의 격리/정상 확인된 이슈·PR 목록입니다.",
		noItems: "아직 격리되거나 정상 확인된 항목이 없습니다.",
		colItem: "항목",
		colState: "상태",
		colStatus: "처리",
		quarantined: "격리됨",
		cleared: "정상 확인",
		stats: { q: "격리", c: "정상 확인", o: "열림", x: "닫힘" },
		legend:
			"격리는 SlopGuard가 슬롭으로 의심해 검토용으로 표시한 항목이고, 정상 확인은 관리자가 검토 후 정상으로 풀어준 항목입니다. 열림/닫힘은 GitHub 상태로 별개입니다.",
	},
} as const;

const GRID = "minmax(0,1fr) 90px 110px";

export default async function RepoDashboard({
	lang,
	owner,
	repo,
}: {
	lang: Lang;
	owner: string;
	repo: string;
}) {
	const t = T[lang];
	const installHref = lang === "ko" ? "/ko/install" : "/install";
	const full = `${owner}/${repo}`;

	let stats: RepoSlopStats | null = null;
	let error: string | null = null;
	try {
		stats = await getRepoSlopStats(owner, repo);
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
	}

	return (
		<>
			<MarketingNav lang={lang} enHref={`/dashboard/${full}`} koHref={`/ko/dashboard/${full}`} />
			<ConsoleShell kicker={t.kicker} workspace={full} nav={[]}>
				<ConsoleHero
					eyebrow={t.eyebrow}
					title={full}
					body={t.sub}
					image="/console-radar.png"
					imageAlt="Repository slop history"
					plateLabel="slop history"
					connected={lang === "ko" ? "실시간" : "live"}
					actions={
						<a
							className="btn btn-ghost btn-sm"
							href={`https://github.com/${full}`}
							target="_blank"
							rel="noreferrer"
						>
							{t.viewGithub}
						</a>
					}
					metrics={
						stats
							? [
									{ label: t.stats.q, value: stats.quarantined, tone: "danger" },
									{ label: t.stats.c, value: stats.cleared, tone: "ok" },
									{ label: t.stats.o, value: stats.open, tone: "neutral" },
									{ label: t.stats.x, value: stats.closed, tone: "neutral" },
								]
							: undefined
					}
				/>

				{error && (
					<ConsoleStatus danger>
						{t.cantLoad} {error} — {t.installNote}{" "}
						<Link href={installHref}>{t.installApp}</Link>
					</ConsoleStatus>
				)}

				{stats && (
					<>
						{stats.quarantined + stats.cleared > 0 && (
							<section className="console-section">
								<div className="plate console-panel">
									<div className="slop-ratio" aria-hidden="true">
										<div className="ratio-bar">
											<span className="seg q" style={{ flexGrow: stats.quarantined || 0 }} />
											<span className="seg c" style={{ flexGrow: stats.cleared || 0 }} />
										</div>
										<div className="ratio-legend">
											<span className="q">{t.quarantined} {stats.quarantined}</span>
											<span className="c">{t.cleared} {stats.cleared}</span>
										</div>
									</div>
									<p style={{ color: "var(--muted)", fontSize: 12.5, lineHeight: 1.55, margin: "14px 0 0" }}>
										{t.legend}
									</p>
								</div>
							</section>
						)}

						<section className="console-section">
							<ConsoleSectionHead title={t.recent} sub={t.recentSub} />
							<div className="plate console-table">
								<div className="console-th" style={{ gridTemplateColumns: GRID }}>
									<span>{t.colItem}</span>
									<span>{t.colState}</span>
									<span style={{ textAlign: "right" }}>{t.colStatus}</span>
								</div>
								{stats.items.length === 0 ? (
									<div className="console-empty-line">{t.noItems}</div>
								) : (
									stats.items.map((it) => {
										const isCleared = it.labels.includes("slop-cleared");
										return (
											<div className="console-tr" key={it.number} style={{ gridTemplateColumns: GRID }}>
												<a href={it.url} target="_blank" rel="noreferrer">
													<b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
														{it.kind === "pull_request" ? "PR" : "#"}
														{it.number} {it.title}
													</b>
												</a>
												<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 12 }}>{it.state}</span>
												<span
													className="console-pill"
													style={{
														justifySelf: "end",
														color: isCleared ? "var(--green)" : "var(--danger)",
														background: isCleared ? "rgba(63,185,80,0.12)" : "rgba(248,81,73,0.12)",
													}}
												>
													{isCleared ? t.cleared : t.quarantined}
												</span>
											</div>
										);
									})
								)}
							</div>
						</section>
					</>
				)}
			</ConsoleShell>
			<SiteFooter lang={lang} />
		</>
	);
}
