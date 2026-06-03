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
import AppNav from "./AppNav";
import SiteFooter from "@/app/components/SiteFooter";
import PublicRepoLookup from "./PublicRepoLookup";

const T = {
	en: {
		home: "Home",
		signedOutTitle: "Sign in to SlopGuard",
		signedOutSub:
			"Use your GitHub account to see your plan, manage billing, and the repositories SlopGuard watches.",
		signin: "Sign in with GitHub",
		myAccount: "My account",
		account: "GitHub account",
		email: "Email",
		notProvided: "not provided",
		yourPlan: "Your plan",
		current: "Current plan",
		planFreeNote: "You are on the Free plan. Use Compare plans to upgrade.",
		planPaidNote:
			"Active and matched to the GitHub account you entered at checkout.",
		manageBilling: "Manage billing & invoices",
		plansTitle: "Plans",
		upgrade: "Upgrade",
		downgradeNote: "To change or cancel a paid plan, use Manage billing.",
		per: "/ mo",
		reposTitle: "Repositories",
		reposNote:
			"The repositories SlopGuard is watching for you. Adding or removing repos runs through GitHub's app-permission screen, so that one step stays on GitHub.",
		manageRepos: "Add or remove repos on GitHub",
		viewHistory: "Slop history",
		privateTag: "private",
		noRepos: "SlopGuard isn't installed on any of your repositories yet.",
		logout: "Sign out",
		errorNote: "Sign-in did not complete. Please try again.",
		activityTitle: "Activity",
		activitySub: "who cleared what, when (live from GitHub)",
		statQ: "quarantined",
		statC: "cleared",
		statO: "open",
		statR: "repos",
		colItem: "Item",
		colAuthor: "Author",
		colStatus: "Status",
		colWhen: "When",
		statusQ: "quarantined",
		statusC: "cleared",
		noActivity: "No activity yet.",
		lookupTitle: "Look up a public repo",
		lookupSub:
			"View the slop history of any public repo where SlopGuard is installed.",
		comparePlans: "Compare plans",
	},
	ko: {
		home: "홈",
		signedOutTitle: "SlopGuard 로그인",
		signedOutSub:
			"GitHub 계정으로 로그인하면 내 플랜 확인, 결제 관리, SlopGuard가 감시할 레포 관리를 할 수 있습니다.",
		signin: "GitHub으로 로그인",
		myAccount: "마이페이지",
		account: "GitHub 계정",
		email: "이메일",
		notProvided: "미제공",
		yourPlan: "내 플랜",
		current: "현재 플랜",
		planFreeNote: "현재 Free 플랜입니다. 업그레이드는 요금제 비교에서.",
		planPaidNote: "활성화됨. 결제 시 입력한 GitHub 계정과 연결되어 있습니다.",
		manageBilling: "결제 / 영수증 관리",
		plansTitle: "요금제",
		upgrade: "업그레이드",
		downgradeNote: "유료 플랜 변경이나 해지는 결제 관리에서 할 수 있습니다.",
		per: "/ 월",
		reposTitle: "레포지토리",
		reposNote:
			"SlopGuard가 감시 중인 레포 목록입니다. 레포 추가나 제거는 GitHub 앱 권한 화면을 거쳐야 해서 그 단계만 GitHub에서 진행됩니다.",
		manageRepos: "GitHub에서 레포 추가/제거",
		viewHistory: "슬롭 기록",
		privateTag: "비공개",
		noRepos: "아직 어느 레포에도 SlopGuard가 설치되어 있지 않습니다.",
		logout: "로그아웃",
		errorNote: "로그인이 완료되지 않았습니다. 다시 시도해 주세요.",
		activityTitle: "활동",
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
		lookupTitle: "공개 레포 조회",
		lookupSub:
			"SlopGuard가 설치된 공개 레포라면 어떤 레포든 슬롭 기록을 볼 수 있습니다.",
		comparePlans: "요금제 비교",
	},
} as const;

function PlanBadge({ plan, label }: { plan: PlanId; label?: string }) {
	const color = plan === "team" ? "#a371f7" : "var(--green)";
	const bg =
		plan === "team" ? "rgba(163,113,247,0.12)" : "rgba(63,185,80,0.12)";
	const border =
		plan === "team" ? "rgba(163,113,247,0.4)" : "rgba(63,185,80,0.4)";
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				color,
				background: bg,
				border: `1px solid ${border}`,
				borderRadius: 999,
				padding: "3px 11px",
				fontSize: 12,
				fontWeight: 700,
				fontFamily: "var(--mono)",
				textTransform: "uppercase",
			}}
		>
			{label ?? PLANS[plan].name}
		</span>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="card" style={{ textAlign: "center", flex: 1, margin: 0 }}>
			<div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
			<div style={{ color: "var(--muted)", fontSize: 13 }}>{label}</div>
		</div>
	);
}

export default async function Account({
	lang,
	error,
}: {
	lang: Lang;
	error?: string;
}) {
	const t = T[lang];
	const dashBase = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const pricingHref = lang === "ko" ? "/ko#pricing" : "/#pricing";
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan: PlanId | null = session
		? await planForOwner(session.login)
		: null;
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

	return (
		<>
			<AppNav lang={lang} enHref="/account" koHref="/ko/account" />

			<main className="wide" style={{ maxWidth: 1040, paddingTop: 32 }}>
				<div className="mono-rule">
					<span>
						//{" "}
						{lang === "ko"
							? "slopguard.app/ko/account"
							: "slopguard.app/account"}
					</span>
					<span className="mono-rule-end">[ slopguard ]</span>
				</div>
				{!session || !plan ? (
					<div style={{ maxWidth: 480 }}>
						<span className="eyebrow">account</span>
						<h1
							style={{
								fontSize: 32,
								letterSpacing: "-0.02em",
								margin: "14px 0 8px",
							}}
						>
							{t.signedOutTitle}
						</h1>
						<p className="muted" style={{ marginTop: 0 }}>
							{t.signedOutSub}
						</p>
						{error && (
							<p style={{ color: "var(--danger)", fontSize: 14 }}>
								{t.errorNote}
							</p>
						)}
						<a
							className="btn btn-primary btn-lg"
							href={
								lang === "ko" ? "/api/auth/login?lang=ko" : "/api/auth/login"
							}
						>
							{t.signin}
						</a>
					</div>
				) : (
					<>
						<h1
							style={{
								fontSize: 28,
								letterSpacing: "-0.02em",
								margin: "0 0 18px",
							}}
						>
							{t.myAccount}
						</h1>

						{/* profile header */}
						<div className="card account-profile">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={session.avatar}
								alt=""
								width={48}
								height={48}
								referrerPolicy="no-referrer"
								style={{
									borderRadius: "50%",
									border: "1px solid var(--border)",
								}}
							/>
							<div style={{ minWidth: 0 }}>
								<div style={{ fontWeight: 700, fontSize: 16 }}>
									{session.name || session.login}
								</div>
								<div className="muted mono" style={{ fontSize: 12.5 }}>
									{session.email || `@${session.login}`}
								</div>
							</div>
							<span style={{ marginLeft: "auto" }}>
								<PlanBadge plan={plan} />
							</span>
						</div>

						<div className="account-grid">
							<div className="account-main">
								<div className="card">
									<div className="card-head">
										<h3>{t.reposTitle}</h3>
										{repos.length > 0 && (
											<span className="card-meta">{repos.length}</span>
										)}
									</div>
									{repos.length > 0 ? (
										<ul className="repo-list">
											{repos.map((r) => (
												<li className="repo-row" key={r.fullName}>
													<span className="repo-name">
														<a href={r.htmlUrl}>{r.fullName}</a>
														{r.private && (
															<span className="repo-tag">{t.privateTag}</span>
														)}
													</span>
													<Link
														className="repo-link"
														href={`${dashBase}/${r.fullName}`}
													>
														{t.viewHistory} &rarr;
													</Link>
												</li>
											))}
										</ul>
									) : (
										<p
											className="muted"
											style={{ fontSize: 13.5, margin: "0 0 14px" }}
										>
											{t.noRepos}
										</p>
									)}
									<a className="btn btn-ghost btn-sm" href={INSTALL_URL}>
										{t.manageRepos}
									</a>
								</div>

								{canOrg && orgStats && (
									<div className="card">
										<div className="card-head">
											<h3>{t.activityTitle}</h3>
											<span className="card-meta">{t.activitySub}</span>
										</div>
										<div
											style={{
												display: "flex",
												gap: 12,
												margin: "0 0 14px",
												flexWrap: "wrap",
											}}
										>
											<Stat label={t.statQ} value={orgStats.quarantined} />
											<Stat label={t.statC} value={orgStats.cleared} />
											<Stat label={t.statO} value={orgStats.open} />
											<Stat label={t.statR} value={orgStats.repoCount} />
										</div>
										<div className="dash-table-wrap">
											{orgStats.recent.length === 0 ? (
												<p className="muted" style={{ margin: 0 }}>
													{t.noActivity}
												</p>
											) : (
												<table className="dash-table">
													<thead>
														<tr>
															<th>{t.colItem}</th>
															<th>{t.colAuthor}</th>
															<th>{t.colStatus}</th>
															<th>{t.colWhen}</th>
														</tr>
													</thead>
													<tbody>
														{orgStats.recent.map((it) => (
															<tr key={it.url}>
																<td style={{ maxWidth: 300 }}>
																	<a href={it.url}>
																		{it.kind === "pull_request" ? "PR" : "#"}
																		{it.number}
																	</a>{" "}
																	<span className="muted">{it.title}</span>
																</td>
																<td>@{it.author}</td>
																<td>
																	<span
																		className="mono"
																		style={{ fontSize: 12 }}
																	>
																		{it.labels.includes("slop-cleared")
																			? t.statusC
																			: t.statusQ}
																	</span>
																</td>
																<td className="muted" style={{ fontSize: 12 }}>
																	{new Date(it.updatedAt)
																		.toISOString()
																		.slice(0, 10)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											)}
										</div>
									</div>
								)}
							</div>

							<aside className="account-side">
								<div className="card">
									<div className="card-head">
										<h3>{t.yourPlan}</h3>
										<PlanBadge plan={plan} label={t.current} />
									</div>
									<div
										style={{ display: "flex", alignItems: "baseline", gap: 8 }}
									>
										<span style={{ fontSize: 24, fontWeight: 800 }}>
											{PLANS[plan].name}
										</span>
										{plan !== "free" && PLANS[plan].priceMonthly != null && (
											<span className="muted mono" style={{ fontSize: 14 }}>
												${PLANS[plan].priceMonthly}
												{t.per}
											</span>
										)}
									</div>
									<p
										className="muted"
										style={{ fontSize: 13, margin: "10px 0 14px" }}
									>
										{plan === "free" ? t.planFreeNote : t.planPaidNote}
									</p>
									<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
										{plan !== "free" && (
											<a className="btn btn-ghost btn-sm" href={PORTAL_URL}>
												{t.manageBilling}
											</a>
										)}
										<Link className="btn btn-ghost btn-sm" href={pricingHref}>
											{t.comparePlans}
										</Link>
									</div>
								</div>
							</aside>
						</div>

						<section className="card lookup-section">
							<div className="card-head">
								<h3>{t.lookupTitle}</h3>
							</div>
							<p className="muted lookup-section-sub">{t.lookupSub}</p>
							<PublicRepoLookup lang={lang} />
						</section>
					</>
				)}
			</main>

			<SiteFooter lang={lang} />
		</>
	);
}
