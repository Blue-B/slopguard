import { cookies } from "next/headers";
import Link from "next/link";
import { INSTALL_URL, REPO_URL } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = {
	title: "SlopGuard: subscription active",
	description: "Thanks for subscribing. Install SlopGuard on your repo or org.",
};

const T = {
	en: {
		home: "/",
		confirmed: "payment confirmed",
		title: "Subscription active, thank you!",
		sub: "Your plan unlocks automatically for the GitHub account you entered at checkout, usually within a minute. Two quick steps to start guarding your repo:",
		s1: "Install the SlopGuard app on the same GitHub org or username you typed in the checkout field. That match is what activates your paid features.",
		s2: "Pick the repositories to guard. SlopGuard starts scoring new PRs and issues immediately with a quarantine label and a review comment, never an auto-close.",
		install: "Install SlopGuard on GitHub",
		back: "Back to home",
		good: "Good to know",
		g1a: "Drop a",
		g1b: "to tune thresholds, labels, and allowlists. Every field is optional.",
		g2: "Billing runs through Polar (Merchant of Record). Manage or cancel anytime from the customer portal link in your receipt email.",
		g3a: "Stuck? Open an issue on",
	},
	ko: {
		home: "/ko",
		confirmed: "결제 완료",
		title: "구독이 활성화됐습니다. 감사합니다!",
		sub: "결제 시 입력한 GitHub 계정으로 플랜이 보통 1분 안에 자동 활성화됩니다. 레포 보호를 시작하려면 두 단계만:",
		s1: "결제 칸에 입력한 GitHub 조직이나 사용자명과 같은 곳에 SlopGuard 앱을 설치하세요. 그 일치가 유료 기능을 켜는 조건입니다.",
		s2: "보호할 레포를 고르세요. SlopGuard가 새 PR과 이슈를 바로 점수화해 격리 라벨과 리뷰 코멘트를 답니다. 자동으로 닫지 않습니다.",
		install: "GitHub에 SlopGuard 설치",
		back: "홈으로",
		good: "참고",
		g1a: "임계값, 라벨, 허용 목록을 조정하려면",
		g1b: "을 추가하세요. 모든 항목은 선택입니다.",
		g2: "결제는 Polar(Merchant of Record)가 처리합니다. 영수증 이메일의 고객 포털 링크에서 언제든 관리·해지할 수 있습니다.",
		g3a: "막히면 GitHub에 이슈를 남겨주세요:",
	},
} as const;

export default async function CheckoutSuccess() {
	const store = await cookies();
	const lang = store.get("sg_lang")?.value === "ko" ? "ko" : "en";
	const t = T[lang];

	return (
		<>
			<nav className="nav">
				<Link className="brand" href={t.home}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<a href={REPO_URL}>GitHub</a>
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 680, paddingTop: 64 }}>
				<span className="eyebrow">
					<span className="dot" /> {t.confirmed}
				</span>
				<h1 style={{ fontSize: 34, letterSpacing: "-0.02em", margin: "14px 0 10px" }}>
					{t.title}
				</h1>
				<p className="muted" style={{ fontSize: 17, marginTop: 0 }}>
					{t.sub}
				</p>

				<div className="steps" style={{ marginTop: 28 }}>
					<div className="step">
						<span className="num" />
						<p>{t.s1}</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>{t.s2}</p>
					</div>
				</div>

				<div className="btn-row" style={{ marginTop: 24 }}>
					<a className="btn btn-primary" href={INSTALL_URL}>
						{t.install}
					</a>
					<Link className="btn btn-ghost" href={t.home}>
						{t.back}
					</Link>
				</div>

				<div className="card" style={{ marginTop: 32 }}>
					<h3 style={{ marginTop: 0, fontSize: 15 }}>{t.good}</h3>
					<ul style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
						<li>
							{t.g1a} <code>.github/SLOP_POLICY.yml</code> {t.g1b}
						</li>
						<li>{t.g2}</li>
						<li>
							{t.g3a} <a href={`${REPO_URL}/issues`}>GitHub</a>.
						</li>
					</ul>
				</div>
			</main>

			<footer className="site">
				<div className="footer-bottom" style={{ borderTop: 0, marginTop: 0 }}>
					<span>
						SlopGuard | MIT | <a href={REPO_URL}>github.com/Blue-B/slopguard</a>
					</span>
				</div>
			</footer>
		</>
	);
}
