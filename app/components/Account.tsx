import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import type { Lang } from "@/lib/i18n";

import { INSTALL_URL } from "@/lib/config";
import {
	getOwnerSlopStats,
	listOwnerRepos,
	type OwnerRepo,
	type OwnerSlopStats,
} from "@/lib/github/storage";
import MarketingNav from "./MarketingNav";
import SiteFooter from "@/app/components/SiteFooter";
import PublicRepoLookup from "./PublicRepoLookup";
import { toneColor } from "./console-styles";

const T = {
	en: {
		signedOutTitle: "Sign in to SlopGuard",
		signedOutSub:
			"Use your GitHub account to see the repositories SlopGuard watches and their recent activity.",
		signin: "Sign in with GitHub",
		myAccount: "My account",
		identSub: "Signed in with your GitHub account.",
		live: "Live",
		reposTitle: "Repositories",
		reposBig: "Watched repositories",
		manageRepos: "Add or remove repos on GitHub",
		viewHistory: "Slop history",
		privateTag: "private",
		noRepos: "SlopGuard isn't installed on any of your repositories yet.",
		errorNote: "Sign-in did not complete. Please try again.",
		activityTitle: "Activity",
		activityBig: "Recent activity",
		statQ: "Quarantined",
		statC: "Cleared",
		statO: "Open",
		statR: "Repos",
		colItem: "Item",
		colAuthor: "Author",
		colStatus: "Status",
		colWhen: "When",
		statusQ: "quarantined",
		statusC: "cleared",
		noActivity: "No activity yet.",
		lookupTitle: "Lookup",
		lookupBig: "Look up a public repo",
	},
	ko: {
		signedOutTitle: "SlopGuard 로그인",
		signedOutSub:
			"GitHub 계정으로 로그인하면 SlopGuard가 감시하는 레포와 최근 처리 내역을 볼 수 있습니다.",
		signin: "GitHub으로 로그인",
		myAccount: "마이페이지",
		identSub: "GitHub 계정으로 로그인되어 있습니다.",
		live: "실시간",
		reposTitle: "레포지토리",
		reposBig: "감시 중인 레포",
		manageRepos: "GitHub에서 레포 추가/제거",
		viewHistory: "슬롭 기록",
		privateTag: "비공개",
		noRepos: "아직 어느 레포에도 SlopGuard가 설치되어 있지 않습니다.",
		errorNote: "로그인이 완료되지 않았습니다. 다시 시도해 주세요.",
		activityTitle: "활동",
		activityBig: "최근 처리 내역",
		statQ: "격리",
		statC: "정상 확인",
		statO: "열림",
		statR: "레포",
		colItem: "항목",
		colAuthor: "작성자",
		colStatus: "처리",
		colWhen: "시점",
		statusQ: "격리됨",
		statusC: "정상 확인",
		noActivity: "아직 활동이 없습니다.",
		lookupTitle: "조회",
		lookupBig: "공개 레포 조회",
	},
} as const;

const ACT_GRID = "minmax(0,1fr) 120px 96px 96px";

export default async function Account({
	lang,
	error,
}: {
	lang: Lang;
	error?: string;
}) {
	const t = T[lang];
	const dashBase = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	let repos: OwnerRepo[] = [];
	let orgStats: OwnerSlopStats | null = null;
	if (session) {
		try {
			repos = await listOwnerRepos(session.login);
		} catch {
			repos = [];
		}
		try {
			orgStats = await getOwnerSlopStats(session.login);
		} catch {
			orgStats = null;
		}
	}

	if (!session) {
		return (
			<>
				<MarketingNav lang={lang} enHref="/account" koHref="/ko/account" />
				<main className="console-experience">
					<div className="grid-bg" aria-hidden="true" />
					<div className="wide console-wide" style={{ maxWidth: 560 }}>
						<div className="eyebrow mono">{t.myAccount}</div>
						<h1 style={{ fontSize: "clamp(32px,5vw,52px)", letterSpacing: "-0.04em", margin: "10px 0 12px" }}>
							{t.signedOutTitle}
						</h1>
						<p style={{ color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>
							{t.signedOutSub}
						</p>
						{error && (
							<p style={{ color: "var(--danger)", fontSize: 14 }}>{t.errorNote}</p>
						)}
						<a
							className="btn btn-primary btn-lg"
							href={lang === "ko" ? "/api/auth/login?lang=ko" : "/api/auth/login"}
						>
							{t.signin}
						</a>
					</div>
				</main>
				<SiteFooter lang={lang} />
			</>
		);
	}

	const ledger = [
		{ label: t.statR, value: repos.length, tone: "neutral" as const },
		...(orgStats
			? [
					{ label: t.statQ, value: orgStats.quarantined, tone: "danger" as const },
					{ label: t.statC, value: orgStats.cleared, tone: "ok" as const },
				]
			: []),
	];

	return (
		<>
			<MarketingNav lang={lang} enHref="/account" koHref="/ko/account" />

			<header className="acct-ident">
				<span className="acct-ident-glow" aria-hidden="true" />
				<div className="wide acct-ident-inner">
					<div className="acct-ident-seal">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/account-emblem.png" alt="" />
					</div>
					<div className="acct-ident-id">
						<p className="acct-ident-eyebrow mono">{t.myAccount}</p>
						<div className="acct-ident-handle">
							<h1 className="at">@{session.login}</h1>
							<span className="acct-live">
								<i aria-hidden="true" />
								{t.live}
							</span>
						</div>
						{session.name && (
							<div className="acct-ident-name">{session.name}</div>
						)}
						<p className="acct-ident-meta">{t.identSub}</p>
					</div>
				</div>
				{ledger.length > 1 && (
					<div className="wide acct-ledger">
						{ledger.map((m) => (
							<div className="acct-ledger-cell" key={m.label}>
								<b style={m.tone ? { color: toneColor[m.tone] } : undefined}>
									{m.value}
								</b>
								<span>{m.label}</span>
							</div>
						))}
					</div>
				)}
			</header>

			<div className="wide acct-grid">
			<section className="plate acct-panel pan-repos">
				<div className="acct-panel-head">
					<span className="no">01</span>
					<div className="ttl">
						<h2>{t.reposBig}</h2>
						<span className="k">{t.reposTitle}</span>
					</div>
				</div>
				<div className="acct-panel-body">
				{repos.length > 0 ? (
					<div className="acct-list">
						{repos.map((r) => (
							<div className="acct-list-row" key={r.fullName}>
								<a className="name" href={r.htmlUrl} target="_blank" rel="noreferrer">
									{r.fullName}
									{r.private ? <small>{t.privateTag}</small> : null}
								</a>
								<Link className="go" href={`${dashBase}/${r.fullName}`}>
									{t.viewHistory} →
								</Link>
							</div>
						))}
					</div>
				) : (
					<p className="acct-empty">{t.noRepos}</p>
				)}
				<a className="btn btn-ghost btn-sm" href={INSTALL_URL} style={{ marginTop: 16 }}>
					{t.manageRepos}
				</a>
				</div>
			</section>
			<section className="plate acct-panel pan-lookup">
				<div className="acct-panel-head">
					<span className="no">02</span>
					<div className="ttl">
						<h2>{t.lookupBig}</h2>
						<span className="k">{t.lookupTitle}</span>
					</div>
				</div>
				<div className="acct-panel-body">
					<PublicRepoLookup lang={lang} />
				</div>
			</section>
			{orgStats && (
				<section className="plate acct-panel pan-activity">
					<div className="acct-panel-head">
						<span className="no">03</span>
						<div className="ttl">
							<h2>{t.activityBig}</h2>
							<span className="k">{t.activityTitle}</span>
						</div>
					</div>
					<div className="console-table">
						<div className="console-th" style={{ gridTemplateColumns: ACT_GRID }}>
								<span>{t.colItem}</span>
								<span>{t.colAuthor}</span>
								<span>{t.colStatus}</span>
								<span style={{ textAlign: "right" }}>{t.colWhen}</span>
							</div>
							{orgStats.recent.length === 0 ? (
								<div className="console-empty-line">{t.noActivity}</div>
							) : (
								orgStats.recent.map((it) => (
									<div className="console-tr" key={it.url} style={{ gridTemplateColumns: ACT_GRID }}>
										<a href={it.url} target="_blank" rel="noreferrer">
											<b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
												{it.kind === "pull_request" ? "PR" : "#"}
												{it.number} {it.title}
											</b>
										</a>
										<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
											@{it.author}
										</span>
										<span className="console-pill" style={{ color: it.labels.includes("slop-cleared") ? "var(--green)" : "var(--danger)", background: it.labels.includes("slop-cleared") ? "rgba(63,185,80,0.12)" : "rgba(248,81,73,0.12)" }}>
											{it.labels.includes("slop-cleared") ? t.statusC : t.statusQ}
										</span>
										<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 12, textAlign: "right" }}>
											{new Date(it.updatedAt).toISOString().slice(0, 10)}
										</span>
									</div>
							))
						)}
					</div>
				</section>
			)}
			</div>

			<SiteFooter lang={lang} />
		</>
	);
}
