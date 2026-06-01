import Link from "next/link";

export const metadata = {
	title: "SlopGuard — Subscription active",
	description: "Thanks for subscribing. Install SlopGuard on your repo or org.",
};

// Public install URL for the hosted SlopGuard GitHub App.
const INSTALL_URL =
	"https://github.com/apps/slopguard-blue-b-2026/installations/new";

export default function CheckoutSuccess() {
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
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 680, paddingTop: 64 }}>
				<span className="eyebrow">● payment confirmed</span>
				<h1
					style={{
						fontSize: 34,
						letterSpacing: "-0.02em",
						margin: "14px 0 10px",
					}}
				>
					Subscription active — thank you!
				</h1>
				<p className="muted" style={{ fontSize: 17, marginTop: 0 }}>
					Your plan unlocks automatically for the GitHub account you entered at
					checkout, usually within a minute. Two quick steps to start guarding
					your repo:
				</p>

				<div className="steps" style={{ marginTop: 28 }}>
					<div className="step">
						<span className="num" />
						<p>
							<b>Install the SlopGuard app</b> on the{" "}
							<b>same GitHub org or username</b> you typed in the checkout
							field. That match is what activates your paid features.
						</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>
							Pick the repositories to guard. SlopGuard starts scoring new PRs
							and issues immediately — quarantine label + review comment, never
							an auto-close.
						</p>
					</div>
				</div>

				<div className="btn-row" style={{ marginTop: 24 }}>
					<a className="btn btn-primary" href={INSTALL_URL}>
						Install SlopGuard on GitHub
					</a>
					<Link className="btn btn-ghost" href="/">
						Back to home
					</Link>
				</div>

				<div className="card" style={{ marginTop: 32 }}>
					<h3 style={{ marginTop: 0, fontSize: 15 }}>Good to know</h3>
					<ul style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
						<li>
							Drop a <code>.github/SLOP_POLICY.yml</code> to tune thresholds,
							labels, and allowlists — every field is optional.
						</li>
						<li>
							Billing runs through Polar (Merchant of Record). Manage or cancel
							anytime from the receipt email&rsquo;s customer portal link.
						</li>
						<li>
							Stuck? Open an issue on{" "}
							<a href="https://github.com/Blue-B/slopguard/issues">GitHub</a>.
						</li>
					</ul>
				</div>
			</main>

			<footer className="site">
				<p>
					SlopGuard · MIT ·{" "}
					<a href="https://github.com/Blue-B/slopguard">
						github.com/Blue-B/slopguard
					</a>
				</p>
			</footer>
		</>
	);
}
