import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";

const FEATURES = [
	{
		ico: "$ gh app install",
		t: "1-click GitHub App",
		d: "Install on a repo or org in one click. No Action YAML, no CI config, no secrets to wire.",
	},
	{
		ico: "/slop approve",
		t: "Human-in-the-loop",
		d: "Quarantine label + review comment only. Nothing is ever closed without an explicit maintainer command.",
	},
	{
		ico: "provenance:",
		t: "Provenance tagging",
		d: "Flags generator hints, a prompt fingerprint, and leaked assistant phrases like “As an AI model…”.",
	},
	{
		ico: "SLOP_POLICY.yml",
		t: "Policy-as-code",
		d: "Thresholds, labels, allowlists, and comment templates live in your repo. Reviewed like any other change.",
	},
	{
		ico: "if no LLM key:",
		t: "Works without an LLM",
		d: "Heuristics-only mode runs with zero API keys — 100% precision on the golden set.",
	},
	{
		ico: "db: null",
		t: "No database",
		d: "State lives in GitHub labels and issues. Self-host the entire thing — it’s MIT licensed.",
	},
];

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
					<a href="#demo">Demo</a>
					<a href="#pricing">Pricing</a>
					<a href="https://github.com/Blue-B/slopguard">GitHub</a>
					<Link className="btn btn-primary" href="/setup">
						Install
					</Link>
				</span>
			</nav>

			<header className="hero">
				<div>
					<span className="eyebrow">● maintainer burnout, contained</span>
					<h1>
						Stop AI slop from
						<br />
						drowning your <span className="hl">repo</span>
					</h1>
					<p className="sub">
						SlopGuard scores every incoming PR and issue for low-effort,
						machine-generated slop, tags its provenance, and quarantines it —
						then leaves the final call to a human.
					</p>
					<div className="btn-row">
						<Link className="btn btn-primary" href="/setup">
							Install the GitHub App
						</Link>
						<a
							className="btn btn-ghost"
							href="https://github.com/Blue-B/slopguard"
						>
							★ Star on GitHub
						</a>
					</div>
					<p className="fineprint">
						# open source · MIT · never auto-closes · free for public repos
					</p>
				</div>

				<div className="window" aria-hidden="true">
					<div className="window-bar">
						<span className="dot r" />
						<span className="dot y" />
						<span className="dot g" />
						<span className="title">slopguard — pull request #482</span>
					</div>
					<div className="term">
						<div>
							<span className="prompt">slopguard</span>{" "}
							<span className="dim">analyze pr#482 “add helper utils”</span>
						</div>
						<div className="dim">
							→ heuristics: boilerplate, empty body, emoji headers
						</div>
						<div className="dim">
							→ provenance: leaked phrase{" "}
							<span className="bad">“Certainly! Here is…”</span>
						</div>
						<div>
							→ score: <span className="bad">96</span>
							<span className="dim">/100</span> ·{" "}
							<span className="bad">slop</span>
						</div>
					</div>
					<div className="pr-comment">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img className="avatar" src="/bot-logo-512.png" alt="" />
						<div className="body">
							<div className="head">
								<b>slopguard</b> <span className="verified">bot</span>{" "}
								quarantined this pull request
							</div>
							<div className="score-bar">
								<span style={{ width: "96%" }} />
							</div>
							<div style={{ fontSize: 13, color: "var(--muted)" }}>
								Slop score <b style={{ color: "var(--danger)" }}>96/100</b> ·
								provenance: machine-generated
							</div>
							<div style={{ marginTop: 10, display: "flex", gap: 8 }}>
								<span className="label quarantine">slop-quarantine</span>
								<span className="label cleared">awaiting /slop</span>
							</div>
						</div>
					</div>
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

			<section className="wide">
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

			<section id="how" className="wide">
				<h2 className="section-title">How it works</h2>
				<p className="section-sub">
					A webhook fires, the detection agent runs, and you get a score, a
					label, and a review comment — within seconds.
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
							At or above your threshold → <code>slop-quarantine</code> label +
							a review comment explaining why.
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

			<section id="demo" className="wide">
				<h2 className="section-title">See it triage a real PR</h2>
				<p className="section-sub">
					A machine-generated PR scored 100/100 → quarantined with reasons +
					provenance → cleared by the maintainer with one{" "}
					<code>/slop approve</code>. Nothing is auto-closed.
				</p>
				<div className="demo-frame window">
					<div className="window-bar">
						<span className="dot r" />
						<span className="dot y" />
						<span className="dot g" />
						<span className="title">github.com/your-org/your-repo</span>
					</div>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/demo.gif" alt="SlopGuard quarantining a slop PR" />
				</div>
			</section>

			<section id="pricing" className="wide">
				<h2 className="section-title">Pricing</h2>
				<p className="section-sub">
					The code is free to self-host forever. Paid tiers cover the managed
					LLM bill, private repos, and org controls. Checkout is handled by
					Polar as Merchant of Record.
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
					Prefer to run it yourself? Everything is open source —{" "}
					<a href="https://github.com/Blue-B/slopguard">self-host for free</a>.
				</p>
			</section>

			<footer className="site">
				<p>
					SlopGuard · MIT ·{" "}
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
