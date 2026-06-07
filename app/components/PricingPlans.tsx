"use client";

import Link from "next/link";
import { useState } from "react";
import { REPO_URL } from "@/lib/config";
import {
	PLANS,
	PLAN_ORDER,
	PLAN_RANK,
	type PlanId,
	yearlySavings,
} from "@/lib/billing/plans";
import { messages, type Lang } from "@/lib/i18n";

const T = {
	en: {
		monthly: "Monthly",
		yearly: "Yearly",
		save: "2 months free",
		perMo: "/mo",
		perYr: "/yr",
		free: "$0",
		contactNote: "from, invoiced annually",
		contact: "Contact sales",
		getStarted: "Get started",
		current: "Current",
		manage: "Manage plan",
		upgrade: "Upgrade",
		downgrade: "Schedule downgrade",
		billedYr: (p: number) => `billed $${p}/yr`,
		saveAmt: (n: number) => `save $${n}/yr`,
		popular: "most popular",
	},
	ko: {
		monthly: "월간",
		yearly: "연간",
		save: "2개월 무료",
		perMo: "/월",
		perYr: "/년",
		free: "$0",
		contactNote: "부터, 세금계산서 연간 청구",
		contact: "문의하기",
		getStarted: "시작하기",
		current: "현재",
		manage: "구독 관리",
		upgrade: "업그레이드",
		downgrade: "다운그레이드 예약",
		billedYr: (p: number) => `연 $${p} 청구`,
		saveAmt: (n: number) => `연 $${n} 절약`,
		popular: "가장 인기",
	},
} as const;

const CONTACT_URL = `${REPO_URL}/issues/new?labels=enterprise&title=Enterprise%20inquiry`;

export default function PricingPlans({
	lang,
	currentPlan,
	portalUrl,
}: {
	lang: Lang;
	/** the logged-in user's active tier (keyed by their GitHub login). The card
	 *  for it is marked "current"; for a PAID current tier the other tiers become
	 *  upgrade (applies now) / downgrade (scheduled next period) of the existing
	 *  subscription. A logged-out / free user sees normal new-purchase checkouts. */
	currentPlan?: string;
	portalUrl?: string;
}) {
	const [yearly, setYearly] = useState(false);
	const t = T[lang];
	// A signed-in customer already on a paid tier manages their existing
	// subscription (upgrade/downgrade) rather than starting a new checkout.
	const paidCurrent = !!currentPlan && currentPlan !== "free";
	const curRank = currentPlan ? PLAN_RANK[currentPlan as PlanId] : -1;
	// Annual billing ships only once the Polar annual checkout links exist and
	// are verified (NEXT_PUBLIC_ANNUAL_BILLING="1"). Until then we never show a
	// yearly toggle that could dead-end or mis-charge.
	const annualEnabled = process.env.NEXT_PUBLIC_ANNUAL_BILLING === "1";
	const pm = messages[lang].pricing;
	const installHref = lang === "ko" ? "/ko/install" : "/install";
	const langQ = lang === "ko" ? "&lang=ko" : "";

	return (
		<>
			{annualEnabled && (
				<div className="cycle-toggle" role="tablist" aria-label="billing cycle">
					<button
						type="button"
						role="tab"
						aria-selected={!yearly}
						className={!yearly ? "on" : ""}
						onClick={() => setYearly(false)}
					>
						{t.monthly}
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={yearly}
						className={yearly ? "on" : ""}
						onClick={() => setYearly(true)}
					>
						{t.yearly}
						<span className="save-pill">{t.save}</span>
					</button>
				</div>
			)}

			<div className="plans-4">
				{PLAN_ORDER.map((id) => {
					const plan = PLANS[id];
					const copy = pm.plans[id];
					const isCurrent = currentPlan === id;
					const isFree = id === "free";
					const isContact = plan.contactSales === true;
					const price = yearly ? plan.priceYearly : plan.priceMonthly;
					const per = yearly ? t.perYr : t.perMo;
					const savings = yearlySavings(plan);

					return (
						<div
							className={`card plan${id === "pro" ? " featured" : ""}${isCurrent ? " current" : ""}`}
							key={id}
						>
							{id === "pro" && <span className="ribbon">{t.popular}</span>}
							<h3>{copy.name}</h3>

							<div className="price">
								{isContact ? (
									<>
										<span className="amt">${plan.priceFrom ?? ""}</span>
										<span className="per">{t.perMo}</span>
									</>
								) : isFree ? (
									<span className="amt">{t.free}</span>
								) : (
									<>
										<span className="amt">${price}</span>
										<span className="per">{per}</span>
									</>
								)}
							</div>
							{isContact && <p className="price-note">{t.contactNote}</p>}
							{!isContact && !isFree && yearly && (
								<p className="price-note">
									{t.billedYr(plan.priceYearly ?? 0)}, {t.saveAmt(savings)}
								</p>
							)}

							<p className="muted plan-tagline">{copy.tagline}</p>

							<ul>
								{copy.features.map((feat) => (
									<li key={feat}>{feat}</li>
								))}
							</ul>

							{isCurrent ? (
								isFree || isContact ? (
									// Free/Enterprise have no self-serve Polar subscription to
									// manage, so just mark the tier as current.
									<span className="btn btn-ghost plan-cta is-current">
										{t.current}
									</span>
								) : (
									// Current paid tier: manage/change it in the portal instead of
									// re-checking out (which would create a duplicate subscription).
									<a
										className="btn btn-ghost plan-cta is-current"
										href={portalUrl ?? "/account"}
									>
										{t.manage}
									</a>
								)
							) : isContact ? (
								<a className="btn btn-ghost plan-cta" href={CONTACT_URL}>
									{t.contact}
								</a>
							) : paidCurrent ? (
								// Signed-in paid user: change the EXISTING subscription.
								// Upgrade applies now; downgrade is scheduled for next period.
								PLAN_RANK[id] > curRank ? (
									<a
										className="btn btn-primary plan-cta"
										href={`/api/billing/change-plan?plan=${id}${langQ}`}
									>
										{t.upgrade}
									</a>
								) : (
									<a
										className="btn btn-ghost plan-cta"
										href={`/api/billing/change-plan?plan=${id}${langQ}`}
									>
										{t.downgrade}
									</a>
								)
							) : isFree ? (
								<Link className="btn btn-ghost plan-cta" href={installHref}>
									{t.getStarted}
								</Link>
							) : (
								<a
									className="btn btn-primary plan-cta"
									href={`/api/billing/checkout?plan=${id}${yearly ? "&cycle=yearly" : ""}${langQ}`}
								>
									{pm.choose(copy.name)}
								</a>
							)}
						</div>
					);
				})}
			</div>
		</>
	);
}
