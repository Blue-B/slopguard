import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { PLAN_RANK, PLANS, type PlanId } from "@/lib/billing/plans";
import {
	cancelSubscriptionAtPeriodEnd,
	changeSubscriptionProduct,
	findProductId,
	findSubscriptionForOwner,
	invalidateEntitlements,
} from "@/lib/billing/polar";
import { PORTAL_URL } from "@/lib/config";
import { getAppBaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Change the CURRENT user's own subscription (keyed by their GitHub login):
//   upgrade   → applies now, prorated onto the next invoice
//   downgrade → scheduled for the next billing period (keep the higher tier
//               until then); downgrade to Free = cancel at period end
// This is the standard "manage your existing subscription" flow. Buying for a
// DIFFERENT org is a fresh checkout (a different Polar customer/email), handled
// by /api/billing/checkout.
export async function GET(req: Request) {
	const url = new URL(req.url);
	const target = (url.searchParams.get("plan") ?? "") as PlanId;
	const ko = url.searchParams.get("lang") === "ko";
	// Build redirects from the public base URL, NOT req.url: behind the Cloudtype
	// proxy req.url's host is the internal bind (0.0.0.0), which would produce a
	// dead Location header.
	const origin = getAppBaseUrl();
	const lang = ko ? "/ko" : "";
	const back = (status: string) =>
		NextResponse.redirect(`${origin}${lang}/account?billing=${status}`, {
			status: 302,
		});

	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.redirect(`${origin}${lang}/account`, { status: 302 });
	}

	if (!PLANS[target]) return back("invalid");

	let sub: Awaited<ReturnType<typeof findSubscriptionForOwner>> = null;
	try {
		sub = await findSubscriptionForOwner(session.login);
	} catch (err) {
		console.error("[billing] change-plan lookup failed:", err);
		return NextResponse.redirect(PORTAL_URL, { status: 302 });
	}

	// No managed subscription for this login (free user, code grant, or the
	// subscription is under a different org). Free→paid is a brand-new purchase.
	if (!sub) {
		if (target !== "free") {
			return NextResponse.redirect(
				`${origin}/api/billing/checkout?plan=${target}${ko ? "&lang=ko" : ""}`,
				{ status: 302 },
			);
		}
		return back("nosub");
	}

	const current = sub.plan;
	if (target === current) return back("same");

	try {
		if (target === "free") {
			// Downgrade to Free = keep access until the period ends, then cancel.
			await cancelSubscriptionAtPeriodEnd(sub.id);
			invalidateEntitlements();
			return back("scheduled-downgrade");
		}

		const productId = await findProductId(target, sub.interval);
		if (!productId) return back("noproduct");

		const upgrade = PLAN_RANK[target] > PLAN_RANK[current];
		await changeSubscriptionProduct(
			sub.id,
			productId,
			// Upgrade now (prorated onto the next invoice); schedule downgrades for
			// the next period so the customer keeps what they paid for until then.
			upgrade ? "prorate" : "next_period",
		);
		invalidateEntitlements();
		return back(upgrade ? "upgraded" : "scheduled-downgrade");
	} catch (err) {
		console.error("[billing] change-plan failed:", err);
		// Fall back to the portal where the customer can self-manage.
		return NextResponse.redirect(PORTAL_URL, { status: 302 });
	}
}
