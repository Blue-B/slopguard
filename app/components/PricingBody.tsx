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
				whyTitle: "셀프호스팅 되는데 왜 결제하나요?",
				selfTitle: "직접 셀프호스팅 (무료)",
				selfItems: [
					"GitHub 키 직접 발급, 서버 직접 운영, LLM API 비용 직접 결제",
					"고장나면 직접 고치고, 업데이트도 직접",
					"자기 레포만 봅니다. 다른 곳에서 걸린 슬롭은 모릅니다",
				],
				hostedTitle: "호스팅 결제",
				hostedItems: [
					"클릭 한 번 설치. 서버도, LLM API 키도, 비용도 우리가 전부 부담합니다",
					"다른 레포에서 이미 슬롭으로 걸린 패턴을, 당신 레포에 처음 들어온 순간 바로 차단합니다. 셀프호스팅은 자기 레포만 봐서 이게 불가능합니다",
					"비공개 레포, 조직 전체 대시보드와 장기 추세, Slack/Discord/웹훅 알림, SSO",
				],
				whyPunch: "정리하면, 셀프호스팅은 \"내가 다 알아서 한다\"이고, 결제는 \"우리가 비용과 운영을 대신 지고, 전체 네트워크가 본 슬롭까지 막아준다\"입니다.",
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
				whyTitle: "Self-hostable. So why pay?",
				selfTitle: "Self-host (free)",
				selfItems: [
					"Issue your own GitHub keys, run your own server, pay the LLM API bill yourself",
					"When it breaks, you fix it; you handle every update",
					"Only sees your own repos. It never knows what slop was caught elsewhere",
				],
				hostedTitle: "Hosted (paid)",
				hostedItems: [
					"One-click install. We run the server and pay the LLM API bill for you",
					"The moment a slop pattern that was already caught on another repo hits yours, it is blocked. A self-hosted instance only sees its own repos, so it cannot do this",
					"Private repos, an org-wide dashboard with long-term trends, Slack/Discord/webhook alerts, and SSO",
				],
				whyPunch: "In short: self-hosting is \"I run everything myself\"; paying is \"we carry the cost and the ops, and block slop the whole network has already seen.\"",
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
				<h2>{t.whyTitle}</h2>
				<div className="why-grid">
					<div className="why-col why-self">
						<h3>{t.selfTitle}</h3>
						<ul>
							{t.selfItems.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					</div>
					<div className="why-col why-hosted">
						<h3>{t.hostedTitle}</h3>
						<ul>
							{t.hostedItems.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					</div>
				</div>
				<p className="why-punch">{t.whyPunch}</p>
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
