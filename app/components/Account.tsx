import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import type { Lang } from "@/lib/i18n";

import { INSTALL_URL, PORTAL_URL } from "@/lib/config";
import { listOwnerRepos, type OwnerRepo } from "@/lib/github/storage";
import PricingPlans from "./PricingPlans";

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
		planFreeNote: "You are on the Free plan. Upgrade any time below.",
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
		planFreeNote:
			"현재 Free 플랜입니다. 아래에서 언제든 업그레이드할 수 있습니다.",
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

export default async function Account({
	lang,
	error,
}: {
	lang: Lang;
	error?: string;
}) {
	const t = T[lang];
	const home = lang === "ko" ? "/ko" : "/";
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan: PlanId | null = session
		? await planForOwner(session.login)
		: null;
	let repos: OwnerRepo[] = [];
	if (session) {
		try {
			repos = await listOwnerRepos(session.login);
		} catch {
			repos = [];
		}
	}

	return (
		<>
			<nav className="nav">
				<Link className="brand" href={home}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<Link href={home}>{t.home}</Link>
					{session && <a href="/api/auth/logout">{t.logout}</a>}
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 1040, paddingTop: 52 }}>
				{!session || !plan ? (
					<div style={{ maxWidth: 480 }}>
						<span className="eyebrow">
							<span className="dot" /> account
						</span>
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
								margin: "0 0 20px",
							}}
						>
							{t.myAccount}
						</h1>

						{/* profile */}
						<div className="card account-narrow" style={{ marginBottom: 18 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={session.avatar}
									alt=""
									width={52}
									height={52}
									referrerPolicy="no-referrer"
									style={{
										borderRadius: "50%",
										border: "1px solid var(--border)",
									}}
								/>
								<div style={{ minWidth: 0 }}>
									<div style={{ fontWeight: 700, fontSize: 17 }}>
										{session.name || session.login}
									</div>
									<div className="muted mono" style={{ fontSize: 13 }}>
										{session.email || `@${session.login}`}
									</div>
								</div>
								<span style={{ marginLeft: "auto" }}>
									<PlanBadge plan={plan} />
								</span>
							</div>
						</div>

						{/* current plan + billing */}
						<h2 style={{ fontSize: 16, margin: "26px 0 10px" }}>
							{t.yourPlan}
						</h2>
						<div className="card account-narrow" style={{ marginBottom: 8 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<span style={{ fontSize: 22, fontWeight: 800 }}>
									{PLANS[plan].name}
								</span>
								{plan !== "free" && PLANS[plan].priceMonthly != null && (
									<span className="muted mono" style={{ fontSize: 14 }}>
										${PLANS[plan].priceMonthly}
										{t.per}
									</span>
								)}
								<PlanBadge plan={plan} label={t.current} />
							</div>
							<p className="muted" style={{ fontSize: 13, margin: "10px 0 0" }}>
								{plan === "free" ? t.planFreeNote : t.planPaidNote}
							</p>
							{plan !== "free" && (
								<div style={{ marginTop: 14 }}>
									<a className="btn btn-ghost" href={PORTAL_URL}>
										{t.manageBilling}
									</a>
								</div>
							)}
						</div>

						{/* plans / upgrade inline */}
						<h2 style={{ fontSize: 16, margin: "26px 0 10px" }}>
							{t.plansTitle}
						</h2>
						<PricingPlans lang={lang} currentPlan={plan} />
						<p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
							{t.downgradeNote}
						</p>

						{/* repositories */}
						<h2 style={{ fontSize: 16, margin: "26px 0 10px" }}>
							{t.reposTitle}
						</h2>
						<div className="card account-narrow">
							<p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
								{t.reposNote}
							</p>
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
												href={`/dashboard/${r.fullName}`}
											>
												{t.viewHistory} &rarr;
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p className="muted" style={{ fontSize: 13.5, margin: "0 0 14px" }}>
									{t.noRepos}
								</p>
							)}
							<a className="btn btn-ghost" href={INSTALL_URL}>
								{t.manageRepos}
							</a>
						</div>

						<div style={{ marginTop: 28 }}>
							<a className="btn btn-ghost" href="/api/auth/logout">
								{t.logout}
							</a>
						</div>
					</>
				)}
			</main>

			<footer className="site">
				<p>
					SlopGuard | MIT |{" "}
					<a href="https://github.com/Blue-B/slopguard">
						github.com/Blue-B/slopguard
					</a>
				</p>
			</footer>
		</>
	);
}
