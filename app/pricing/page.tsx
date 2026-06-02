import type { Metadata } from "next";
import Link from "next/link";
import PricingPlans from "../components/PricingPlans";
import { REPO_URL } from "@/lib/config";

export const metadata: Metadata = {
	title: "SlopGuard Pricing",
	description:
		"Free to self-host. Paid tiers cover managed LLM, private repos, cross-repo campaign detection, org dashboards, and alerting.",
	alternates: { canonical: "/pricing" },
};

export default function Pricing() {
	return (
		<>
			<nav className="nav">
				<Link className="brand" href="/">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<Link href="/#how">How it works</Link>
					<a href={REPO_URL}>GitHub</a>
					<Link className="btn btn-primary" href="/install">
						Install
					</Link>
				</span>
			</nav>

			<header style={{ textAlign: "center", padding: "64px 24px 8px" }}>
				<span className="eyebrow">
					<span className="dot" /> pricing
				</span>
				<h1
					style={{ fontSize: 38, letterSpacing: "-0.02em", margin: "12px 0" }}
				>
					Free to self-host. Pay only for managed.
				</h1>
				<p className="section-sub">
					SlopGuard is open source (MIT), run it yourself for free, forever.
					Paid tiers cover the managed LLM bill, private repos, cross-repo
					intelligence, org-wide visibility, and alerting. Checkout via Polar as
					Merchant of Record.
				</p>
			</header>

			<section className="wide" style={{ marginTop: 8 }}>
				<PricingPlans lang="en" />
			</section>

			<section className="wide" style={{ marginTop: 32 }}>
				<div className="card">
					<h3 style={{ marginTop: 0 }}>Why pay if it&apos;s open source?</h3>
					<p className="muted" style={{ fontSize: 14 }}>
						Self-hosting means running the server, paying the LLM API bill, and
						maintaining it yourself. Paid tiers remove all of that and add
						things a single self-hosted instance can&apos;t do on its own: a
						dedicated LLM quota, cross-repo bot-campaign detection, an org-wide
						dashboard with an activity log, and Slack/Discord/webhook alerts.
						Same model as Sentry, PostHog, and Plausible. The code is free; the
						hosting, intelligence, and convenience are the product.
					</p>
				</div>
				<p className="section-sub" style={{ fontSize: 13 }}>
					Questions? Open an issue on <a href={`${REPO_URL}/issues`}>GitHub</a>.
				</p>
			</section>

			<footer
				className="wide"
				style={{
					textAlign: "center",
					padding: "48px 24px",
					color: "var(--muted)",
					fontSize: 13,
				}}
			>
				<Link href="/">← Back to home</Link>
			</footer>
		</>
	);
}
