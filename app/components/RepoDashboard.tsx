import Link from "next/link";
import { getRepoSlopStats, type RepoSlopStats } from "@/lib/github/storage";
import type { Lang } from "@/lib/i18n";
import AppNav from "./AppNav";

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
			"격리는 SlopGuard가 슬롭으로 의심해 검토용으로 표시한 항목이고, 정상 확인은 메인테이너가 검토 후 정상으로 풀어준 항목입니다. 열림과 닫힘은 그 PR이나 이슈의 GitHub 상태로, 격리나 정상 확인과는 별개입니다.",
		install: "앱 설치하기",
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
			<AppNav
				lang={lang}
				enHref={`/dashboard/${full}`}
				koHref={`/ko/dashboard/${full}`}
			/>

			<main className="wide" style={{ maxWidth: 880, paddingTop: 44 }}>
				<span className="eyebrow">{t.eyebrow}</span>
				<h1
					style={{
						fontSize: 26,
						letterSpacing: "-0.02em",
						margin: "14px 0 4px",
					}}
				>
					{full}
				</h1>
				<p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
					{t.sub}{" "}
					<a href={`https://github.com/${full}`}>{t.viewGithub} &rarr;</a>
				</p>

				{error && (
					<div
						className="card"
						style={{
							borderColor: "rgba(210,153,34,0.4)",
							background: "rgba(210,153,34,0.06)",
							marginTop: 18,
						}}
					>
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
						<div
							style={{
								display: "flex",
								gap: 12,
								margin: "20px 0 0",
								flexWrap: "wrap",
							}}
						>
							<Stat label={t.stats.q} value={stats.quarantined} />
							<Stat label={t.stats.c} value={stats.cleared} />
							<Stat label={t.stats.o} value={stats.open} />
							<Stat label={t.stats.x} value={stats.closed} />
						</div>
						<p className="lookup-legend" style={{ marginTop: 10 }}>
							{t.legend}
						</p>

						<h2 style={{ fontSize: 16, margin: "26px 0 8px" }}>{t.recent}</h2>
						<div className="card" style={{ padding: 0, overflow: "hidden" }}>
							{stats.items.length === 0 ? (
								<p className="muted" style={{ padding: 16, margin: 0 }}>
									{t.noItems}
								</p>
							) : (
								<table className="dash-table">
									<thead>
										<tr>
											<th>{t.colItem}</th>
											<th>{t.colKind}</th>
											<th>{t.colState}</th>
											<th>{t.colStatus}</th>
										</tr>
									</thead>
									<tbody>
										{stats.items.map((it) => (
											<tr key={it.number}>
												<td style={{ maxWidth: 380 }}>
													<a href={it.url}>#{it.number}</a>{" "}
													<span className="muted">{it.title}</span>
												</td>
												<td>{it.kind === "pull_request" ? "PR" : "issue"}</td>
												<td>{it.state}</td>
												<td>
													<span className="mono" style={{ fontSize: 12 }}>
														{it.labels.includes("slop-cleared")
															? t.cleared
															: t.quarantined}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						<p style={{ marginTop: 18 }}>
							<Link className="muted" href={backHref} style={{ fontSize: 14 }}>
								&larr; {t.allRepos}
							</Link>
						</p>
					</>
				)}
			</main>
		</>
	);
}
