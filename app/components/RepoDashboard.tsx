import Link from "next/link";
import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";
import type { Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import SiteFooter from "./SiteFooter";

const T = {
	en: {
		eyebrow: "repository",
		sub: "Slop history, read live from GitHub (no database).",
		viewGithub: "View on GitHub",
		cantLoad: "Couldn't load data.",
		installNote: "Make sure SlopGuard is installed on this repo:",
		installApp: "install the App",
		recent: "Recent items",
		noItems: "No quarantined or cleared items yet.",
		colItem: "Item",
		colKind: "Kind",
		colState: "State",
		colStatus: "Status",
		quarantined: "quarantined",
		cleared: "cleared",
		allRepos: "My Account",
		stats: { q: "quarantined", c: "cleared", o: "open", x: "closed" },
		legend:
			"Quarantined = SlopGuard flagged it for review. Cleared = a maintainer marked it OK. Open / closed is the GitHub state. State and Status are separate columns below.",
		install: "install the App",
	},
	ko: {
		eyebrow: "레포지토리",
		sub: "슬롭 기록입니다. GitHub에서 실시간으로 읽어옵니다 (DB 없음).",
		viewGithub: "GitHub에서 보기",
		cantLoad: "데이터를 불러오지 못했습니다.",
		installNote: "이 레포에 SlopGuard가 설치되어 있는지 확인하세요:",
		installApp: "앱 설치하기",
		recent: "최근 항목",
		noItems: "아직 격리되거나 정상 확인된 항목이 없습니다.",
		colItem: "항목",
		colKind: "종류",
		colState: "상태",
		colStatus: "처리",
		quarantined: "격리됨",
		cleared: "정상 확인",
		allRepos: "마이페이지",
		stats: { q: "격리", c: "정상 확인", o: "열림", x: "닫힘" },
		legend:
			"격리는 SlopGuard가 슬롭으로 의심해 검토용으로 표시한 항목이고, 정상 확인은 관리자가 검토 후 정상으로 풀어준 항목입니다. 열림과 닫힘은 그 PR이나 이슈의 GitHub 상태로, 격리나 정상 확인과는 별개입니다.",
		install: "앱 설치하기",
	},
} as const;

function Stat({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone?: "warn" | "ok";
}) {
	return (
		<div className="ministat">
			<div className={`ministat-n${tone ? ` ${tone}` : ""}`}>{value}</div>
			<div className="ministat-l">{label}</div>
		</div>
	);
}

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
	const backHref = lang === "ko" ? "/ko/account" : "/account";
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
			<MarketingNav
				lang={lang}
				enHref={`/dashboard/${full}`}
				koHref={`/ko/dashboard/${full}`}
			/>

			<main className="wide" style={{ maxWidth: 920, paddingTop: 32 }}>
				<header className="docs-hero">
					<div className="grid-bg" aria-hidden="true" />
					<div className="docs-hero-copy">
						<span className="eyebrow">{t.eyebrow}</span>
						<h1 className="page-h1" style={{ wordBreak: "break-all" }}>
							{full}
						</h1>
						<p className="page-sub">
							{t.sub}{" "}
							<a href={`https://github.com/${full}`}>{t.viewGithub} &rarr;</a>
						</p>
					</div>
					<figure className="plate docs-hero-plate">
						<figcaption className="plate-bar">
							<span>{lang === "ko" ? "슬롭 기록" : "slop history"}</span>
							<span className="plate-coord">live</span>
						</figcaption>
						<div className="plate-art">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/radar-circuit.png" alt="" />
							<span className="plate-scan" aria-hidden="true" />
						</div>
					</figure>
				</header>

				{error && (
					<div className="dash-error">
						<strong>{t.cantLoad}</strong>
						<p className="muted" style={{ fontSize: 14, margin: "6px 0 8px" }}>
							{error}
						</p>
						<p style={{ fontSize: 14, margin: 0 }}>
							{t.installNote} <Link href={installHref}>{t.installApp}</Link>.
						</p>
					</div>
				)}

				{stats && (
					<>
						<div className="ministats" style={{ marginTop: 20 }}>
							<Stat label={t.stats.q} value={stats.quarantined} tone="warn" />
							<Stat label={t.stats.c} value={stats.cleared} tone="ok" />
							<Stat label={t.stats.o} value={stats.open} />
							<Stat label={t.stats.x} value={stats.closed} />
						</div>
						{stats.quarantined + stats.cleared > 0 && (
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
						)}
						<p className="lookup-legend" style={{ marginTop: 14 }}>
							{t.legend}
						</p>

						<h2 className="dash-recent">{t.recent}</h2>
						{stats.items.length === 0 ? (
							<p className="muted">{t.noItems}</p>
						) : (
							<ul className="lookup-items">
								{stats.items.map((it) => (
									<li key={it.number}>
										<a href={it.url}>
											{it.kind === "pull_request" ? "PR" : "#"}
											{it.number}
										</a>{" "}
										<span className="muted lookup-title">{it.title}</span>
										<span className="lookup-state">{it.state}</span>
										<span
											className={`lookup-tag ${it.labels.includes("slop-cleared") ? "tag-c" : "tag-q"}`}
										>
											{it.labels.includes("slop-cleared")
												? t.cleared
												: t.quarantined}
										</span>
									</li>
								))}
							</ul>
						)}

						<p style={{ marginTop: 24 }}>
							<Link className="muted" href={backHref} style={{ fontSize: 14 }}>
								&larr; {t.allRepos}
							</Link>
						</p>
					</>
				)}
			</main>
			<SiteFooter lang={lang} />
		</>
	);
}
