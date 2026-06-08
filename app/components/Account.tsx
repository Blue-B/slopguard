import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import type { Lang } from "@/lib/i18n";

import { INSTALL_URL, PORTAL_URL } from "@/lib/config";
import {
	getOwnerSlopStats,
	listOwnerRepos,
	type OwnerRepo,
	type OwnerSlopStats,
} from "@/lib/github/storage";
import MarketingNav from "./MarketingNav";
import SiteFooter from "@/app/components/SiteFooter";
import PublicRepoLookup from "./PublicRepoLookup";
import SectionHead from "./SectionHead";
import { toneColor } from "./console-styles";

const T = {
	en: {
		signedOutTitle: "Sign in to SlopGuard",
		signedOutSub:
			"Use your GitHub account to see your plan, manage billing, and the repositories SlopGuard watches.",
		signin: "Sign in with GitHub",
		myAccount: "My account",
		planFreeNote: "You are on the Free plan. Upgrade any time.",
		planPaidNote: "Active, matched to your GitHub account from checkout.",
		manageBilling: "Manage billing & invoices",
		live: "Live",
		upgrade: "Upgrade",
		per: "/ mo",
		yourPlan: "Plan",
		planBig: "Your plan & billing",
		reposTitle: "Repositories",
		reposBig: "Watched repositories",
		manageRepos: "Add or remove repos on GitHub",
		viewHistory: "Slop history",
		privateTag: "private",
		noRepos: "SlopGuard isn't installed on any of your repositories yet.",
		errorNote: "Sign-in did not complete. Please try again.",
		billingNote: {
			upgraded:
				"Plan upgraded. The prorated difference is added to your next invoice.",
			"scheduled-downgrade":
				"Downgrade scheduled. You keep your current plan until the end of this billing period, then it changes.",
			same: "You are already on that plan.",
			contact: "Enterprise is arranged with our team. Open a sales inquiry.",
			nosub: "No managed subscription found for your account.",
			noproduct: "Could not change the plan. Try the customer portal.",
			invalid: "Could not change the plan. Try the customer portal.",
		} as Record<string, string>,
		activityTitle: "Activity",
		activityBig: "Recent activity",
		activitySub: "who cleared what, when (live from GitHub)",
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
		lookupSub:
			"View the slop history of any public repo where SlopGuard is installed.",
	},
	ko: {
		signedOutTitle: "SlopGuard 로그인",
		signedOutSub:
			"GitHub 계정으로 로그인하면 내 플랜 확인, 결제 관리, SlopGuard가 감시할 레포 관리를 할 수 있습니다.",
		signin: "GitHub으로 로그인",
		myAccount: "마이페이지",
		planFreeNote: "현재 Free 플랜입니다. 언제든 업그레이드할 수 있습니다.",
		planPaidNote: "활성화됨. 결제 시 입력한 GitHub 계정과 연결되어 있습니다.",
		manageBilling: "결제 / 영수증 관리",
		live: "실시간",
		upgrade: "업그레이드",
		per: "/ 월",
		yourPlan: "내 플랜",
		planBig: "내 플랜과 결제",
		reposTitle: "레포지토리",
		reposBig: "감시 중인 레포",
		manageRepos: "GitHub에서 레포 추가/제거",
		viewHistory: "슬롭 기록",
		privateTag: "비공개",
		noRepos: "아직 어느 레포에도 SlopGuard가 설치되어 있지 않습니다.",
		errorNote: "로그인이 완료되지 않았습니다. 다시 시도해 주세요.",
		billingNote: {
			upgraded:
				"플랜이 업그레이드되었습니다. 차액은 다음 인보이스에 비례정산으로 청구됩니다.",
			"scheduled-downgrade":
				"다운그레이드가 예약되었습니다. 이번 결제기간 종료 시점에 적용되며, 그때까지는 현재 플랜이 유지됩니다.",
			same: "이미 해당 플랜을 사용 중입니다.",
			contact: "Enterprise는 영업팀을 통해 설정됩니다. 문의를 남겨주세요.",
			nosub: "계정에 연결된 관리 가능한 구독이 없습니다.",
			noproduct: "플랜 변경에 실패했습니다. 고객 포털에서 다시 시도해 주세요.",
			invalid: "플랜 변경에 실패했습니다. 고객 포털에서 다시 시도해 주세요.",
		} as Record<string, string>,
		activityTitle: "활동",
		activityBig: "최근 처리 내역",
		activitySub: "누가 언제 무엇을 처리했는지 (GitHub에서 실시간)",
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
		lookupSub:
			"SlopGuard가 설치된 공개 레포라면 어떤 레포든 슬롭 기록을 볼 수 있습니다.",
	},
} as const;

const ACT_GRID = "minmax(0,1fr) 120px 96px 96px";

export default async function Account({
	lang,
	error,
	billing,
}: {
	lang: Lang;
	error?: string;
	billing?: string;
}) {
	const t = T[lang];
	const dashBase = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const pricingHref = lang === "ko" ? "/ko/pricing" : "/pricing";
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan: PlanId | null = session ? await planForOwner(session.login) : null;
	let repos: OwnerRepo[] = [];
	const canOrg = plan ? PLANS[plan].orgDashboard : false;
	let orgStats: OwnerSlopStats | null = null;
	if (session) {
		try {
			repos = await listOwnerRepos(session.login);
		} catch {
			repos = [];
		}
		if (canOrg && plan) {
			try {
				orgStats = await getOwnerSlopStats(session.login, PLANS[plan].maxRepos);
			} catch {
				orgStats = null;
			}
		}
	}

	if (!session || !plan) {
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

	const planName = PLANS[plan].name;
	const price = plan !== "free" ? PLANS[plan].priceMonthly : null;
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
						<p className="acct-ident-meta">
							{plan === "free" ? t.planFreeNote : t.planPaidNote}
						</p>
					</div>
					<div className="acct-ident-side">
						<span className="acct-plan-chip">{planName}</span>
						{plan !== "free" ? (
							<a className="btn btn-ghost btn-sm" href={PORTAL_URL}>
								{t.manageBilling}
							</a>
						) : (
							<Link className="btn btn-primary btn-sm" href={pricingHref}>
								{t.upgrade}
							</Link>
						)}
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

			{billing && t.billingNote[billing] && (
				<section className="wide" style={{ marginTop: 26 }}>
					<div
						className="plate"
						style={{ padding: "14px 18px", borderLeft: "3px solid var(--green)" }}
					>
						<p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
							{t.billingNote[billing]}
						</p>
					</div>
				</section>
			)}

			<section className="wide section">
				<SectionHead no="01" kicker={t.yourPlan} title={t.planBig} />
				<div className="acct-band">
					<div>
						<div className="acct-band-plan">
							<b>{planName}</b>
							{price != null && (
								<span className="price">
									${price}
									{t.per}
								</span>
							)}
						</div>
						<small>{plan === "free" ? t.planFreeNote : t.planPaidNote}</small>
					</div>
					<div className="acct-band-actions">
						{plan !== "free" && (
							<a className="btn btn-ghost btn-sm" href={PORTAL_URL}>
								{t.manageBilling}
							</a>
						)}
						<Link className="btn btn-primary btn-sm" href={pricingHref}>
							{t.upgrade}
						</Link>
					</div>
				</div>
			</section>

			<section className="wide section">
				<SectionHead no="02" kicker={t.reposTitle} title={t.reposBig} />
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
			</section>

			{canOrg && orgStats && (
				<section className="wide section">
					<SectionHead
						no="03"
						kicker={t.activityTitle}
						title={t.activityBig}
						sub={t.activitySub}
					/>
					<div className="plate console-table">
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

			<section className="wide section">
				<SectionHead no={canOrg && orgStats ? "04" : "03"} kicker={t.lookupTitle} title={t.lookupBig} sub={t.lookupSub} />
				<div className="plate plate-pad">
					<PublicRepoLookup lang={lang} />
				</div>
			</section>

			<SiteFooter lang={lang} />
		</>
	);
}
