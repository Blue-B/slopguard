import type { Metadata } from "next";
import PricingBody from "@/app/components/PricingBody";

export const metadata: Metadata = {
	title: "SlopGuard Pricing",
	description:
		"Free to self-host. Paid tiers cover managed LLM, private repos, cross-repo pattern detection, org dashboards, and alerting.",
	alternates: { canonical: "/pricing" },
};

export default function Page() {
	return <PricingBody lang="en" />;
}
