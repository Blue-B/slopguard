import { NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Checkout via Stripe Payment Links (no SDK, no secret key needed at runtime).
// Set STRIPE_LINK_PRO / STRIPE_LINK_TEAM to your Stripe Payment Link URLs.
// If unset, we return guidance instead of failing — keeps the free app intact.
function linkFor(plan: PlanId): string | undefined {
  if (plan === "pro") return process.env.STRIPE_LINK_PRO;
  if (plan === "team") return process.env.STRIPE_LINK_TEAM;
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
        hint: `Set STRIPE_LINK_${plan.toUpperCase()} to a Stripe Payment Link URL to enable checkout. The free tier works without any billing setup.`,
        plan: PLANS[plan],
      },
      { status: 501 },
    );
  }

  // Redirect straight to the hosted Stripe Payment Link.
  return NextResponse.redirect(link, { status: 302 });
}
