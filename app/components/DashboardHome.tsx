import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import { PLANS } from "@/lib/billing/plans";
import {
	getOwnerSlopStats,
	listOwnerRepos,
	type OwnerRepo,
	type OwnerSlopStats,
} from "@/lib/github/storage";
import type { Lang } from "@/lib/i18n";
import AppNav from "./AppNav";
import RepoLookup from "../dashboard/RepoLookup";

const T = {
	en: {
		eyebrow: "dashboard",
		title: "Dashboard",
		sub: "The repositories SlopGuard watches for you, and their slop activity.",
		yourRepos: "Your repositories",
		history: "Slop history",
		privateTag: "private",
		noRepos: "SlopGuard isn't watching any of your repositories yet.",
		install: "Install SlopGuard",
		orgTitle: "Organization activity",
		activity: "Recent activity",
		activitySub: "who cleared what, when (live from GitHub)",
		stats: { q: "quarantined", c: "cleared", o: "open", r: "repos" },
		colItem: "Item",
		colAuthor: "Author",
		colStatus: "Status",
		colWhen: "When",
		quarantined: "quarantined",
		cleared: "cleared",
		noActivity: "No activity yet.",
		orgErr: "Couldn't load your organization data.",
		orgErrSub: "Make sure SlopGuard is installed on your account:",
		installApp: "install the App",
		upsellTitle: "Want the org-wide view?",
		upsellSub:
			"Team aggregates every repo into one activity log and sends Slack, Discord, and webhook alerts on quarantine.",
		seeTeam: "See Team",
		signedOutTitle: "Sign in to see your dashboard",
		signedOutSub:
			"Sign in with GitHub to see the repositories SlopGuard watches and their slop activity.",
		signin: "Sign in with GitHub",
		lookupTitle: "Look up a public repo",
		lookupSub:
			"View the slop history of any public repo where SlopGuard is installed.",
	},
	ko: {
		eyebrow: "대시보드",
		title: "대시보드",
		sub: "SlopGuard가 감시 중인 레포와 그 슬롭 활동입니다.",
		yourRepos: "내 레포지토리",
		history: "슬롭 기록",
		privateTag: "비공개",
		noRepos: "아직 SlopGuard가 감시 중인 레포가 없습니다.",
		install: "SlopGuard 설치",
		orgTitle: "조직 활동",
		activity: "최근 활동",
		activitySub: "누가 언제 무엇을 처리했는지 (GitHub에서 실시간)",
		stats: { q: "격리", c: "해제", o: "열림", r: "레포" },
		colItem: "항목",
		colAuthor: "작성자",
		colStatus: "처리",
		colWhen: "시점",
		quarantined: "격리됨",
		cleared: "해제됨",
		noActivity: "아직 활동이 없습니다.",
		orgErr: "조직 데이터를 불러오지 못했습니다.",
		orgErrSub: "내 계정에 SlopGuard가 설치되어 있는지 확인하세요:",
		installApp: "앱 설치하기",
		upsellTitle: "조직 전체 뷰가 필요하세요?",
		upsellSub:
			"Team은 모든 레포를 하나의 활동 로그로 모으고, 격리 시 Slack, Discord, Webhook 알림을 보냅니다.",
		seeTeam: "Team 보기",
		signedOutTitle: "로그인하면 대시보드가 보입니다",
		signedOutSub:
			"GitHub으로 로그인하면 SlopGuard가 감시 중인 레포와 슬롭 활동을 볼 수 있습니다.",
		signin: "GitHub으로 로그인",
		lookupTitle: "공개 레포 조회",
		lookupSub:
			"SlopGuard가 설치된 공개 레포라면 어떤 레포든 슬롭 기록을 볼 수 있습니다.",
	},
} as const;

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="card" style={{ textAlign: "center", flex: 1, margin: 0 }}>
			<div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
			<div style={{ color: "var(--muted)", fontSize: 13 }}>{label}</div>
		</div>
	);
}

export default async function DashboardHome({ lang }: { lang: Lang }) {
	const t = T[lang];
	const ko = lang === "ko";
	const dashBase = ko ? "/ko/dashboard" : "/dashboard";
	const installHref = ko ? "/ko/install" : "/install";
	const pricingHref = ko ? "/ko#pricing" : "/#pricing";
	const loginHref = ko ? "/api/auth/login?lang=ko" : "/api/auth/login";

	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan = session ? PLANS[await planForOwner(session.login)] : null;
	const canOrg = Boolean(plan?.orgDashboard);

	let repos: OwnerRepo[] = [];
	let orgStats: OwnerSlopStats | null = null;
	let orgError: string | null = null;
	if (session) {
		try {
			repos = await listOwnerRepos(session.login);
		} catch {
			repos = [];
		}
		if (canOrg) {
			try {
				orgStats = await getOwnerSlopStats(session.login, plan!.maxRepos);
			} catch (e) {
				orgError = e instanceof Error ? e.message : String(e);
			}
		}
	}

	return (
		<>
			<AppNav lang={lang} enHref="/dashboard" koHref="/ko/dashboard" />

			<main className="wide" style={{ maxWidth: 880, paddingTop: 40 }}>
				<span className="eyebrow">
					<span className="dot" /> {t.eyebrow}
				</span>
				<h1
					style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "14px 0 4px" }}
				>
					{t.title}
				</h1>
				<p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
					{session ? t.sub : t.signedOutSub}
				</p>

				{!session ? (
					<div className="card" style={{ marginTop: 18, maxWidth: 460 }}>
						<b style={{ fontSize: 15 }}>{t.signedOutTitle}</b>
						<div style={{ marginTop: 12 }}>
							<a className="btn btn-primary" href={loginHref}>
								{t.signin}
							</a>
						</div>
					</div>
				) : (
					<>
						{/* your repositories */}
						<h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>{t.yourRepos}</h2>
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
											{t.history} &rarr;
										</Link>
									</li>
								))}
							</ul>
						) : (
							<div className="card">
								<p className="muted" style={{ fontSize: 14, margin: "0 0 12px" }}>
									{t.noRepos}
								</p>
								<Link className="btn btn-primary" href={installHref}>
									{t.install}
								</Link>
							</div>
						)}

						{/* Team: org-wide activity */}
						{canOrg ? (
							<>
								<h2 style={{ fontSize: 16, margin: "28px 0 8px" }}>
									{t.orgTitle}
								</h2>
								{orgError ? (
									<div className="card">
										<strong>{t.orgErr}</strong>
										<p style={{ fontSize: 14, margin: "6px 0 0" }}>
											{t.orgErrSub}{" "}
											<Link href={installHref}>{t.installApp}</Link>
										</p>
									</div>
								) : (
									orgStats && (
										<>
											<div
												style={{
													display: "flex",
													gap: 12,
													margin: "0 0 18px",
													flexWrap: "wrap",
												}}
											>
												<Stat label={t.stats.q} value={orgStats.quarantined} />
												<Stat label={t.stats.c} value={orgStats.cleared} />
												<Stat label={t.stats.o} value={orgStats.open} />
												<Stat label={t.stats.r} value={orgStats.repoCount} />
											</div>
											<h3
												style={{
													fontSize: 14,
													margin: "0 0 8px",
													color: "var(--muted)",
													fontWeight: 600,
												}}
											>
												{t.activity}{" "}
												<span style={{ fontWeight: 400 }}>
													({t.activitySub})
												</span>
											</h3>
											<div
												className="card"
												style={{ padding: 0, overflow: "hidden" }}
											>
												{orgStats.recent.length === 0 ? (
													<p className="muted" style={{ padding: 16, margin: 0 }}>
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
																	<td style={{ maxWidth: 340 }}>
																		<a href={it.url}>
																			{it.kind === "pull_request" ? "PR" : "#"}
																			{it.number}
																		</a>{" "}
																		<span className="muted">{it.title}</span>
																	</td>
																	<td>@{it.author}</td>
																	<td>
																		<span className="mono" style={{ fontSize: 12 }}>
																			{it.labels.includes("slop-cleared")
																				? t.cleared
																				: t.quarantined}
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
										</>
									)
								)}
							</>
						) : (
							<div
								className="card"
								style={{
									marginTop: 24,
									borderColor: "rgba(63,185,80,0.4)",
									background: "rgba(63,185,80,0.06)",
								}}
							>
								<b>{t.upsellTitle}</b>
								<p className="muted" style={{ fontSize: 14, margin: "6px 0 12px" }}>
									{t.upsellSub}
								</p>
								<Link className="btn btn-primary" href={pricingHref}>
									{t.seeTeam}
								</Link>
							</div>
						)}
					</>
				)}

				{/* look up any public repo (secondary) */}
				<h2 style={{ fontSize: 16, margin: "30px 0 6px" }}>{t.lookupTitle}</h2>
				<p className="muted" style={{ fontSize: 13.5, margin: "0 0 10px" }}>
					{t.lookupSub}
				</p>
				<RepoLookup lang={lang} />
			</main>
		</>
	);
}
