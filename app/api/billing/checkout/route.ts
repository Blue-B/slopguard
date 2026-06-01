import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Checkout via Polar (Merchant of Record). Set POLAR_LINK_PRO / POLAR_LINK_TEAM
// to the hosted Checkout Link URLs from your Polar dashboard
// (https://polar.sh → Products → Checkout Links). No SDK or secret key needed
// at runtime. If unset, we return guidance instead of failing — the free tier
// works without any billing setup.
function linkFor(plan: PlanId): string | undefined {
	if (plan === "pro") return process.env.POLAR_LINK_PRO;
	if (plan === "team") return process.env.POLAR_LINK_TEAM;
	return undefined;
}

export function GET(req: Request) {
	const url = new URL(req.url);
	const plan = (url.searchParams.get("plan") ?? "pro") as PlanId;

	if (!PLANS[plan] || plan === "free") {
		return NextResponse.json({ error: "invalid plan" }, { status: 400 });
	}

	const link = linkFor(plan);
	if (!link) {
		return NextResponse.json(
			{
				error: "billing not configured",
				hint: `Set POLAR_LINK_${plan.toUpperCase()} to a Polar Checkout Link URL to enable checkout. The free tier works without any billing setup.`,
				plan: PLANS[plan],
			},
			{ status: 501 },
		);
	}

	// Redirect straight to the hosted Polar checkout.
	return NextResponse.redirect(link, { status: 302 });
}
