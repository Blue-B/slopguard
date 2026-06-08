import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";
import type { Lang } from "@/lib/i18n";
import Link from "next/link";
import MarketingNav from "./MarketingNav";
import SiteFooter from "./SiteFooter";
import { toneColor } from "./console-styles";

const T = {
	en: {
		eyebrow: "REPOSITORY",
		sub: "Slop history, read live from GitHub (no database).",
		viewGithub: "View on GitHub",
		cantLoad: "Couldn't load data.",
		installNote: "Make sure SlopGuard is installed on this repo:",
		installApp: "install the App",
		distTitle: "Distribution",
		distKicker: "RATIO",
		recent: "Recent items",
		recentKicker: "LOG",
		noItems: "No quarantined or cleared items yet.",
		colItem: "Item",
		colState: "State",
		colStatus: "Status",
		quarantined: "quarantined",
		cleared: "cleared",
		live: "live",
		stats: { q: "Quarantined", c: "Cleared", o: "Open", x: "Closed" },
		legend:
			"Quarantined = SlopGuard flagged it for review. Cleared = a maintainer marked it OK. Open / closed is the GitHub state.",
	},
	ko: {
		eyebrow: "REPOSITORY",
		sub: "슬롭 기록입니다. GitHub에서 실시간으로 읽어옵니다 (DB 없음).",
		viewGithub: "GitHub에서 보기",
		cantLoad: "데이터를 불러오지 못했습니다.",
		installNote: "이 레포에 SlopGuard가 설치되어 있는지 확인하세요:",
		installApp: "앱 설치하기",
		distTitle: "분포",
		distKicker: "RATIO",
		recent: "최근 항목",
		recentKicker: "LOG",
		noItems: "아직 격리되거나 정상 확인된 항목이 없습니다.",
		colItem: "항목",
		colState: "상태",
		colStatus: "처리",
		quarantined: "격리됨",
		cleared: "정상 확인",
		live: "실시간",
		stats: { q: "격리", c: "정상 확인", o: "열림", x: "닫힘" },
		legend:
			"격리는 SlopGuard가 슬롭으로 의심해 검토용으로 표시한 항목이고, 정상 확인은 관리자가 검토 후 정상으로 풀어준 항목입니다. 열림/닫힘은 GitHub 상태로 별개입니다.",
	},
} as const;

const GRID = "minmax(0,1fr) 88px 104px";

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

	const ledger = stats
		? [
				{ label: t.stats.q, value: stats.quarantined, tone: "danger" as const },
				{ label: t.stats.c, value: stats.cleared, tone: "ok" as const },
				{ label: t.stats.o, value: stats.open, tone: "neutral" as const },
				{ label: t.stats.x, value: stats.closed, tone: "neutral" as const },
			]
		: [];
	const hasRatio = !!stats && stats.quarantined + stats.cleared > 0;

	return (
		<>
			<MarketingNav
				lang={lang}
				enHref={`/dashboard/${full}`}
				koHref={`/ko/dashboard/${full}`}
			/>

			<header className="acct-ident">
				<span className="acct-ident-glow" aria-hidden="true" />
				<div className="wide acct-ident-inner">
					<div className="acct-ident-seal">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/dash-emblem.png" alt="" />
					</div>
					<div className="acct-ident-id">
						<p className="acct-ident-eyebrow mono">{t.eyebrow}</p>
						<div className="acct-ident-handle">
							<h1 className="at">{full}</h1>
							<span className="acct-live">
								<i aria-hidden="true" />
								{t.live}
							</span>
						</div>
						<p className="acct-ident-meta">{t.sub}</p>
					</div>
					<div className="acct-ident-side">
						<a
							className="btn btn-ghost btn-sm"
							href={`https://github.com/${full}`}
							target="_blank"
							rel="noreferrer"
						>
							{t.viewGithub}
						</a>
					</div>
				</div>
				{ledger.length > 0 && (
					<div className="wide acct-ledger">
						{ledger.map((m) => (
							<div className="acct-ledger-cell" key={m.label}>
								<b style={{ color: toneColor[m.tone] }}>{m.value}</b>
								<span>{m.label}</span>
							</div>
						))}
					</div>
				)}
			</header>

			{error && (
				<section className="wide" style={{ marginTop: 22 }}>
					<div
						className="plate"
						style={{ padding: "16px 20px", borderLeft: "3px solid var(--danger)" }}
					>
						<p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
							{t.cantLoad} {error} — {t.installNote}{" "}
							<Link href={installHref}>{t.installApp}</Link>
						</p>
					</div>
				</section>
			)}

			{stats && (
				<div className="wide dash-grid">
					{hasRatio && (
						<section className="plate acct-panel dash-dist">
							<div className="acct-panel-head">
								<span className="no">01</span>
								<div className="ttl">
									<h2>{t.distTitle}</h2>
									<span className="k">{t.distKicker}</span>
								</div>
							</div>
							<div className="acct-panel-body">
								<div className="slop-ratio" aria-hidden="true">
									<div className="ratio-bar">
										<span className="seg q" style={{ flexGrow: stats.quarantined || 0 }} />
										<span className="seg c" style={{ flexGrow: stats.cleared || 0 }} />
									</div>
									<div className="ratio-legend">
										<span className="q">
											{t.quarantined} {stats.quarantined}
										</span>
										<span className="c">
											{t.cleared} {stats.cleared}
										</span>
									</div>
								</div>
								<p className="dash-legend">{t.legend}</p>
							</div>
						</section>
					)}

					<section
						className={`plate acct-panel ${hasRatio ? "dash-items" : "dash-items-wide"}`}
					>
						<div className="acct-panel-head">
							<span className="no">{hasRatio ? "02" : "01"}</span>
							<div className="ttl">
								<h2>{t.recent}</h2>
								<span className="k">{t.recentKicker}</span>
							</div>
						</div>
						<div className="console-table">
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
										<div
											className="console-tr"
											key={it.number}
											style={{ gridTemplateColumns: GRID }}
										>
											<a href={it.url} target="_blank" rel="noreferrer">
												<b
													style={{
														display: "block",
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{it.kind === "pull_request" ? "PR" : "#"}
													{it.number} {it.title}
												</b>
											</a>
											<span
												style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 12 }}
											>
												{it.state}
											</span>
											<span
												className="console-pill"
												style={{
													justifySelf: "end",
													color: isCleared ? "var(--green)" : "var(--danger)",
													background: isCleared
														? "rgba(63,185,80,0.12)"
														: "rgba(248,81,73,0.12)",
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
				</div>
			)}

			<SiteFooter lang={lang} />
		</>
	);
}
