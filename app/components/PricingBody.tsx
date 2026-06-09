import { cookies } from "next/headers";
import { PORTAL_URL, REPO_URL } from "@/lib/config";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import {
	getEntitlementMap,
	isPolarConfigured,
	normalizeGitHubOwner,
} from "@/lib/billing/polar";
import type { Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import RevealOnScroll from "./RevealOnScroll";
import PricingPlans from "./PricingPlans";
import SiteFooter from "./SiteFooter";

/** Dedicated pricing page body, shared by the EN and KO routes. */
export default async function PricingBody({ lang }: { lang: Lang }) {
	const ko = lang === "ko";
	// Personalize the plan grid for a signed-in user: their active tier renders as
	// "current" (not buyable) and other paid tiers route to the portal, so they
	// can never start a duplicate subscription from this page.
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const currentPlan = session ? await planForOwner(session.login) : undefined;
	// Whether the user has a real Polar subscription to change (vs an env/comp
	// grant). Only then do we show upgrade/downgrade controls; otherwise other
	// tiers stay normal checkouts. getEntitlementMap is cached, so this is cheap.
	let hasManagedSub = false;
	if (session && currentPlan && currentPlan !== "free" && isPolarConfigured()) {
		try {
			const map = await getEntitlementMap();
			hasManagedSub = map.has(normalizeGitHubOwner(session.login));
		} catch {
			hasManagedSub = false;
		}
	}
	const t = ko
		? {
				eyebrow: "가격",
				h1: "운영까지 맡기면,\n팀이 더 편해집니다",
				sub: "비공개 레포, 조직 기능, 서버와 LLM 운영까지 유료 플랜이 맡습니다. 소스가 공개돼 있어 직접 올려 써도 됩니다(본인 용도, Commons Clause).",
				addsTitle: "유료 플랜이 대신해주는 것",
				adds: [
					"매니지드 LLM, 서버와 API 비용 제로",
					"비공개 레포와 레포 교차 탐지",
					"조직 현황과 Slack 알림",
				],
				polar: "결제는 Polar(Merchant of Record)로 안전하게 처리됩니다.",
				whyTitle: "소스가 공개도인데 왜 결제하나요?",
				why: "셀프호스팅은 서버 운영, LLM API 비용, 유지보수를 직접 떠안는 겁니다. 유료 플랜은 그걸 전부 없애고, 단일 인스턴스로는 못 하는 것들을 더합니다. 전용 LLM 할당량, 레포 교차 봇 패턴 탐지, 활동 로그가 있는 조직 현황, Slack/Discord/웹훅 알림. Sentry, PostHog, Plausible과 같은 모델입니다. 코드는 무료이고, 호스팅과 인텔리전스, 편의가 제품입니다.",
				qPre: "궁금한 점이 있으면 ",
				qLink: "GitHub 이슈",
				qPost: "로 남겨주세요.",
			}
		: {
				eyebrow: "pricing",
				h1: "Stronger when\nwe run it for you.",
				sub: "Paid plans cover private repos, org features, and the server and LLM bill. The source is available (Commons Clause), so self-hosting for your own use is always an option too.",
				addsTitle: "What a paid plan handles for you",
				adds: [
					"Managed LLM (no server or API bill)",
					"Private repos and cross-repo detection",
					"Org overview and Slack alerts",
				],
				polar: "Checkout is handled securely by Polar (Merchant of Record).",
				whyTitle: "Why pay if the source is available?",
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
				<div className="grid-bg" aria-hidden="true" />
				<div className="pricing-hero-copy">
					<span className="eyebrow">{t.eyebrow}</span>
					<h1 className="page-h1" style={{ whiteSpace: "pre-line" }}>
						{t.h1}
					</h1>
					<p className="page-sub">{t.sub}</p>
					<div className="pricing-adds">
						<span className="pricing-adds-t">{t.addsTitle}</span>
						<ul>
							{t.adds.map((a) => (
								<li key={a}>{a}</li>
							))}
						</ul>
						<p className="pricing-polar">{t.polar}</p>
					</div>
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
				<PricingPlans
					lang={lang}
					currentPlan={currentPlan}
					hasManagedSub={hasManagedSub}
					portalUrl={PORTAL_URL}
				/>
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
