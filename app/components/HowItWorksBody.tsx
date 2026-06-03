import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { EX } from "./Landing";
import MarketingNav from "./MarketingNav";
import PageHero from "./PageHero";
import HowPipeline from "./HowPipeline";
import SiteFooter from "./SiteFooter";

/** Dedicated /how-it-works page body, shared by the EN and KO routes. */
export default function HowItWorksBody({ lang }: { lang: Lang }) {
	const ko = lang === "ko";
	const x = EX[lang];
	const installHref = ko ? "/ko/install" : "/install";
	const t = ko
		? {
				eyebrow: "동작 방식",
				h1: "SlopGuard는 이렇게 동작합니다",
				sub: "웹훅이 들어오면 몇 초 안에 점수, 라벨, 리뷰 코멘트가 달립니다. 붙일 CI도, 돌릴 서버도 없습니다.",
				steps: "단계별로",
				cta: "GitHub 앱 설치",
				ctaSub: "공개 레포는 무료. 클릭 한 번, 설정 불필요.",
			}
		: {
				eyebrow: "how it works",
				h1: "How SlopGuard works",
				sub: "A webhook comes in; seconds later the PR has a score, a label, and a review comment. No CI to wire up, no server to run.",
				steps: "Step by step",
				cta: "Install the GitHub App",
				ctaSub: "Free for public repos. One click, no config.",
			};
	return (
		<>
			<MarketingNav
				lang={lang}
				enHref="/how-it-works"
				koHref="/ko/how-it-works"
				active="how"
			/>
			<main className="wide section" style={{ paddingTop: 8 }}>
				<PageHero
					path={
						ko
							? "// slopguard.app/ko/how-it-works"
							: "// slopguard.app/how-it-works"
					}
					eyebrow={t.eyebrow}
					title={t.h1}
					sub={t.sub}
				/>

				<div style={{ marginTop: 40 }}>
					<HowPipeline lang={lang} />
				</div>

				<h2 className="section-title" style={{ marginTop: 56 }}>
					{t.steps}
				</h2>
				<ol className="how-steps">
					{x.howDetail.map((s, i) => (
						<li key={s}>
							<span className="how-step-n mono">{i + 1}</span>
							<span>{s}</span>
						</li>
					))}
				</ol>

				<div
					className="btn-row"
					style={{ justifyContent: "center", marginTop: 40 }}
				>
					<Link className="btn btn-primary btn-lg" href={installHref}>
						{t.cta}
					</Link>
				</div>
				<p className="cta-note" style={{ textAlign: "center" }}>
					{t.ctaSub}
				</p>
			</main>
			<SiteFooter lang={lang} />
		</>
	);
}
