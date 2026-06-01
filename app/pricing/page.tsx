import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

export const metadata = {
	title: "SlopGuard — Pricing",
	description:
		"Free to self-host. Paid tiers cover managed LLM and org features.",
};

export default function Pricing() {
	return (
		<>
			<nav className="nav">
				<Link className="brand" href="/">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/bot-logo-512.png" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<a href="https://github.com/Blue-B/slopguard">GitHub</a>
					<Link className="btn btn-primary" href="/setup">
						Install
					</Link>
				</span>
			</nav>

			<header style={{ textAlign: "center", padding: "64px 24px 8px" }}>
				<span className="eyebrow">● pricing</span>
				<h1 style={{ fontSize: 38, letterSpacing: "-0.02em", margin: "12px 0" }}>
					Free to self-host. Pay only for managed.
				</h1>
				<p className="section-sub">
					SlopGuard is open source (MIT) — run it yourself for free, forever.
					Paid tiers exist so you don&apos;t have to manage the LLM bill or
					org-wide controls.
				</p>
			</header>

			<section className="wide">
				<div className="grid">
					{PLAN_ORDER.map((id) => {
						const p = PLANS[id];
						return (
							<div
								className={`card plan${id === "pro" ? " featured" : ""}`}
								key={id}
							>
								{id === "pro" && <span className="ribbon">most popular</span>}
							<h3 style={{ margin: 0 }}>{p.name}</h3>
								<div className="price">
									<span className="amt">${p.priceMonthly}</span>
									<span className="per">/ month</span>
								</div>
								<p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
									{p.tagline}
								</p>
								<ul>
									{p.features.map((feat) => (
										<li key={feat}>{feat}</li>
									))}
								</ul>
								{id === "free" ? (
									<Link className="btn btn-ghost" href="/setup">
										Get started
									</Link>
								) : (
									<a
										className="btn btn-primary"
										href={`/api/billing/checkout?plan=${id}`}
									>
										Choose {p.name}
									</a>
								)}
							</div>
						);
					})}
				</div>
			</section>

			<section className="wide" style={{ marginTop: 32 }}>
				<div className="card">
					<h3 style={{ marginTop: 0 }}>Why pay if it&apos;s open source?</h3>
					<p className="muted" style={{ fontSize: 14 }}>
						Self-hosting means running the server, paying the LLM API bill, and
						maintaining it yourself. Pro removes all of that: we host it, we pay
						the model bill, and you get higher-recall detection plus private
						repos. Team adds org-wide visibility and controls. Same model as
						Sentry, PostHog, and Plausible — the code is free; the hosting and
						convenience are the product.
					</p>
				</div>
				<p className="section-sub" style={{ fontSize: 13 }}>
					Questions? Open an issue on{" "}
					<a href="https://github.com/Blue-B/slopguard/issues">GitHub</a>.
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
