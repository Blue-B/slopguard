import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

const FEATURES = [
	{
		ico: "$ gh app install",
		t: "One-click GitHub App",
		d: "Install on a repo or org in one click. No Action YAML, no CI config, no secrets to wire.",
	},
	{
		ico: "/slop approve",
		t: "Human-in-the-loop",
		d: "Quarantine label and a review comment only. Nothing is closed without an explicit maintainer command.",
	},
	{
		ico: "provenance:",
		t: "Provenance tagging",
		d: "Flags generator hints, a prompt fingerprint, and leaked assistant phrases like “As an AI model”.",
	},
	{
		ico: "SLOP_POLICY.yml",
		t: "Policy-as-code",
		d: "Thresholds, labels, allowlists, and comment templates live in your repo, reviewed like any other change.",
	},
	{
		ico: "if no LLM key:",
		t: "Works without an LLM",
		d: "Heuristics-only mode runs with zero API keys, and still hits 100% precision on the golden set.",
	},
	{
		ico: "db: null",
		t: "No database",
		d: "State lives in GitHub labels and issues. Self-host the entire thing, it is MIT licensed.",
	},
];

function ScoreRing({ score }: { score: number }) {
	const r = 56;
	const c = 2 * Math.PI * r;
	const dash = (score / 100) * c;
	return (
		<svg className="ring" viewBox="0 0 132 132" role="img" aria-label={`Slop score ${score} of 100`}>
			<circle cx="66" cy="66" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
			<circle
				cx="66"
				cy="66"
				r={r}
				fill="none"
				stroke="var(--danger)"
				strokeWidth="9"
				strokeLinecap="round"
				strokeDasharray={`${dash} ${c}`}
				transform="rotate(-90 66 66)"
			/>
			<text className="num" x="66" y="64" textAnchor="middle" fontSize="30">
				{score}
			</text>
			<text className="den" x="66" y="86" textAnchor="middle" fontSize="13">
				/ 100
			</text>
		</svg>
	);
}

export default function Home() {
	return (
		<>
			<nav className="nav">
				<span className="brand">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/bot-logo-512.png" alt="SlopGuard" />
					SlopGuard
				</span>
				<span className="nav-links">
					<a href="#how">How it works</a>
					<a href="#pricing">Pricing</a>
					<a href="https://github.com/Blue-B/slopguard">GitHub</a>
					<Link className="btn btn-primary" href="/setup">
						Install
					</Link>
				</span>
			</nav>

			<header className="hero">
				<div>
					<span className="eyebrow">
						<span className="dot" /> maintainer burnout, contained
					</span>
					<h1>
						Stop AI slop from
						<br />
						drowning your <span className="hl">repo</span>
					</h1>
					<p className="sub">
						SlopGuard scores every incoming PR and issue for low-effort,
						machine-generated slop, tags its provenance, and quarantines it,
						then leaves the final call to a human.
					</p>
					<div className="btn-row">
						<Link className="btn btn-primary btn-lg" href="/setup">
							Install the GitHub App
						</Link>
						<a className="btn btn-ghost btn-lg" href="#pricing">
							See pricing
						</a>
					</div>
					<p className="fineprint">
						# open source, MIT, never auto-closes, free for public repos
					</p>
				</div>

				<div className="hero-emblem">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/hero-emblem.png"
						alt="SlopGuard shield: a code-bracket emblem scanning pull requests"
					/>
				</div>
			</header>

			<section className="wide">
				<div className="stats">
					<div className="stat">
						<div className="n">100%</div>
						<div className="l">precision (golden set)</div>
					</div>
					<div className="stat">
						<div className="n">92%</div>
						<div className="l">recall, heuristics-only</div>
					</div>
					<div className="stat">
						<div className="n">0</div>
						<div className="l">auto-closed PRs, ever</div>
					</div>
					<div className="stat">
						<div className="n">MIT</div>
						<div className="l">self-host for free</div>
					</div>
				</div>
			</section>

			<section id="demo" className="wide section">
				<h2 className="section-title">What a maintainer sees</h2>
				<p className="section-sub">
					Every contribution gets a 0 to 100 slop score, the reasons behind it,
					and a provenance trail. SlopGuard labels and comments. You decide.
				</p>
				<div className="card verdict">
					<ScoreRing score={96} />
					<div>
						<div className="v-head">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/bot-logo-512.png" alt="" />
							<b>SlopGuard</b>
							<span className="badge">likely slop</span>
						</div>
						<ul className="reasons">
							<li>Chat-assistant boilerplate phrases (3)</li>
							<li>Leaked phrase “Certainly! Here is the updated code”</li>
							<li>Generic auto-generated title, empty description</li>
							<li>Provenance: prompt fingerprint b01706d4, machine-generated</li>
						</ul>
						<div className="chips">
							<span className="label quarantine">slop-quarantine</span>
							<span className="label cleared">slop-cleared</span>
							<span className="label fp">slopguard-feedback</span>
						</div>
						<p className="cmd-row">
							maintainer replies <code>/slop approve</code>,{" "}
							<code>/slop reject</code>, or <code>/slop false-positive</code>
						</p>
					</div>
				</div>
			</section>

			<section id="pricing" className="wide section">
				<h2 className="section-title">Pricing</h2>
				<p className="section-sub">
					Free to self-host forever (MIT). Paid tiers cover the managed LLM
					bill, private repos, and org controls. Checkout via Polar as Merchant
					of Record.
				</p>
				<div className="grid">
					{PLAN_ORDER.map((id) => {
						const p = PLANS[id];
						return (
							<div
								className={`card plan${id === "pro" ? " featured" : ""}`}
								key={id}
							>
								{id === "pro" && <span className="ribbon">most popular</span>}
								<h3>{p.name}</h3>
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
				<p className="section-sub" style={{ marginTop: 18, fontSize: 13 }}>
					Paid plans activate automatically: enter the GitHub org or username
					you install on at checkout, and Pro or Team unlocks within a minute.
				</p>
			</section>

			<section id="how" className="wide section">
				<h2 className="section-title">How it works</h2>
				<p className="section-sub">
					A webhook fires, the detection agent runs, and you get a score, a
					label, and a review comment in seconds.
				</p>
				<div className="steps">
					<div className="step">
						<span className="num" />
						<p>
							A PR or issue is opened. GitHub calls <code>/api/webhook</code>.
						</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>
							The agent runs static heuristics (boilerplate, emoji headers,
							empty body, prompt-injection) plus an optional LLM judge.
						</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>
							It scores <code>0–100</code>, extracts provenance, and applies
							your <code>.github/SLOP_POLICY.yml</code>.
						</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>
							At or above your threshold, it adds the{" "}
							<code>slop-quarantine</code> label and a review comment explaining
							why.
						</p>
					</div>
					<div className="step">
						<span className="num" />
						<p>
							A maintainer replies <code>/slop approve</code>,{" "}
							<code>/slop reject</code>, or <code>/slop false-positive</code>.
							SlopGuard never decides for you.
						</p>
					</div>
				</div>
			</section>

			<section className="wide section">
				<h2 className="section-title">Built for maintainers</h2>
				<p className="section-sub">
					Triage help that respects contributors and never goes nuclear.
				</p>
				<div className="grid">
					{FEATURES.map((f) => (
						<div className="card feature" key={f.t}>
							<div className="ico mono">{f.ico}</div>
							<h3>{f.t}</h3>
							<p>{f.d}</p>
						</div>
					))}
				</div>
			</section>

			<footer className="site">
				<p>
					SlopGuard | MIT |{" "}
					<a href="https://github.com/Blue-B/slopguard">
						github.com/Blue-B/slopguard
					</a>
				</p>
				<p className="mono" style={{ fontSize: 12, marginTop: 6 }}>
					built for maintainers drowning in machine-generated noise
				</p>
			</footer>
		</>
	);
}
