import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { EX } from "./Landing";
import MarketingNav from "./MarketingNav";
import PageHero from "./PageHero";
import RevealOnScroll from "./RevealOnScroll";
import SectionHead from "./SectionHead";
import HowPipeline from "./HowPipeline";
import SlopMeter from "./SlopMeter";
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
			<RevealOnScroll />
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

				<section className="section">
					<SectionHead
						no="01"
						kicker={ko ? "파이프라인" : "the pipeline"}
						title={ko ? "이벤트에서 조치까지" : "From event to action"}
					/>
					<HowPipeline lang={lang} />
				</section>

				<section className="section">
					<SectionHead
						no="02"
						kicker={ko ? "해 볼 수 있어요" : "try it"}
						title={
							ko ? "임계값은 당신이 정합니다" : "You set the threshold"
						}
					/>
					<figure className="plate" style={{ maxWidth: 760 }}>
						<figcaption className="plate-bar">
							<span>
								{ko
									? "라이브 데모: 슬롭 점수 게이트"
									: "live demo: the slop-score gate"}
							</span>
							<span className="plate-coord">fig.02</span>
						</figcaption>
						<div className="plate-pad">
							<SlopMeter lang={lang} />
						</div>
					</figure>
				</section>

				<section className="section">
					<SectionHead
						no="03"
						kicker={ko ? "단계별로" : "step by step"}
						title={ko ? "전체 흐름" : "The full flow"}
					/>
					<ol className="how-steps">
						{x.howDetail.map((s, i) => (
							<li key={s}>
								<span className="how-step-n mono">{i + 1}</span>
								<span>{s}</span>
							</li>
						))}
					</ol>
				</section>

				<div className="btn-row" style={{ marginTop: 48 }}>
					<Link className="btn btn-primary btn-lg" href={installHref}>
						{t.cta}
					</Link>
				</div>
				<p className="cta-note">{t.ctaSub}</p>
			</main>
			<SiteFooter lang={lang} />
		</>
	);
}
