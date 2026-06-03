import { REPO_URL } from "@/lib/config";
import type { Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import RevealOnScroll from "./RevealOnScroll";
import PricingPlans from "./PricingPlans";
import SiteFooter from "./SiteFooter";

/** Dedicated pricing page body, shared by the EN and KO routes. */
export default function PricingBody({ lang }: { lang: Lang }) {
	const ko = lang === "ko";
	const t = ko
		? {
				eyebrow: "가격",
				h1: "셀프호스팅은 무료, 매니지드만 결제",
				sub: "SlopGuard는 오픈소스(MIT)입니다. 직접 돌리면 영원히 무료. 유료 플랜은 매니지드 LLM 비용, 비공개 레포, 레포 교차 분석, 조직 전체 가시성, 알림을 포함합니다. 결제는 Polar(Merchant of Record)를 통해 진행됩니다.",
				whyTitle: "오픈소스인데 왜 결제하나요?",
				why: "셀프호스팅은 서버 운영, LLM API 비용, 유지보수를 직접 떠안는 겁니다. 유료 플랜은 그걸 전부 없애고, 단일 인스턴스로는 못 하는 것들을 더합니다. 전용 LLM 할당량, 레포 교차 봇 캠페인 탐지, 활동 로그가 있는 조직 대시보드, Slack/Discord/웹훅 알림. Sentry, PostHog, Plausible과 같은 모델입니다. 코드는 무료이고, 호스팅과 인텔리전스, 편의가 제품입니다.",
				qPre: "궁금한 점이 있으면 ",
				qLink: "GitHub 이슈",
				qPost: "로 남겨주세요.",
			}
		: {
				eyebrow: "pricing",
				h1: "Free to self-host. Pay only for managed.",
				sub: "SlopGuard is open source (MIT), run it yourself for free, forever. Paid tiers cover the managed LLM bill, private repos, cross-repo intelligence, org-wide visibility, and alerting. Checkout via Polar as Merchant of Record.",
				whyTitle: "Why pay if it is open source?",
				why: "Self-hosting means running the server, paying the LLM API bill, and maintaining it yourself. Paid tiers remove all of that and add things a single self-hosted instance cannot do on its own: a dedicated LLM quota, cross-repo bot-campaign detection, an org-wide dashboard with an activity log, and Slack/Discord/webhook alerts. Same model as Sentry, PostHog, and Plausible. The code is free; the hosting, intelligence, and convenience are the product.",
				qPre: "Questions? Open an issue on ",
				qLink: "GitHub",
				qPost: ".",
			};
	return (
		<>
			<MarketingNav
				lang={lang}
				enHref="/pricing"
				koHref="/ko/pricing"
				active="pricing"
			/>
			<RevealOnScroll />
			<header className="wide pricing-hero">
				<div className="pricing-hero-copy">
					<span className="eyebrow">{t.eyebrow}</span>
					<h1 className="page-h1">{t.h1}</h1>
					<p className="page-sub">{t.sub}</p>
				</div>
				<figure className="plate pricing-plate">
					<figcaption className="plate-bar">
						<span>{ko ? "공정한 가치 교환" : "fair value exchange"}</span>
						<span className="plate-coord">fig.03</span>
					</figcaption>
					<div className="plate-art">
						<span className="plate-tag">FREE / PRO / TEAM / ENTERPRISE</span>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/scale-circuit.png" alt="" />
						<span className="plate-scan" aria-hidden="true" />
					</div>
				</figure>
			</header>

			<section className="wide" style={{ marginTop: 56 }}>
				<PricingPlans lang={lang} />
			</section>

			<section className="wide why-pay">
				<h3>{t.whyTitle}</h3>
				<p>{t.why}</p>
				<p className="why-q">
					{t.qPre}
					<a href={`${REPO_URL}/issues`}>{t.qLink}</a>
					{t.qPost}
				</p>
			</section>

			<SiteFooter lang={lang} />
		</>
	);
}
