import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { messages, type Lang } from "@/lib/i18n";
import AuthNav from "./AuthNav";

import { INSTALL_URL } from "@/lib/config";

function ScoreRing({ score }: { score: number }) {
	const r = 56;
	const c = 2 * Math.PI * r;
	const dash = (score / 100) * c;
	return (
		<svg
			className="ring"
			viewBox="0 0 132 132"
			role="img"
			aria-label={`slop score ${score} / 100`}
		>
			<circle
				cx="66"
				cy="66"
				r={r}
				fill="none"
				stroke="var(--border)"
				strokeWidth="9"
			/>
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

export default function Landing({ lang }: { lang: Lang }) {
	const m = messages[lang];
	const home = lang === "ko" ? "/ko" : "/";
	return (
		<>
			<nav className="nav">
				<Link className="brand" href={home}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<a href="#how">{m.nav.how}</a>
					<a href="#pricing">{m.nav.pricing}</a>
					<a href="https://github.com/Blue-B/slopguard">GitHub</a>
					<span className="lang-switch">
						<Link className={lang === "en" ? "on" : ""} href="/">
							EN
						</Link>
						<Link className={lang === "ko" ? "on" : ""} href="/ko">
							KO
						</Link>
					</span>
					<AuthNav lang={lang} />
					<a className="btn btn-primary" href={INSTALL_URL}>
						{m.nav.install}
					</a>
				</span>
			</nav>

			<header className="hero">
				<div>
					<span className="eyebrow">
						<span className="dot" /> {m.hero.eyebrow}
					</span>
					<h1>
						{m.hero.h1a}
						<span className="hl">{m.hero.h1b}</span>
						{m.hero.h1c}
					</h1>
					<p className="sub">{m.hero.sub}</p>
					<div className="btn-row">
						<a className="btn btn-primary btn-lg" href={INSTALL_URL}>
							{m.hero.ctaInstall}
						</a>
						<a className="btn btn-ghost btn-lg" href="#pricing">
							{m.hero.ctaPricing}
						</a>
					</div>
					<p className="fineprint">{m.hero.fine}</p>
				</div>
				<div className="hero-emblem">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/hero-emblem.png" alt={m.hero.emblemAlt} />
				</div>
			</header>

			<section className="wide">
				<div className="stats">
					{m.stats.map((s) => (
						<div className="stat" key={s.l}>
							<div className="n">{s.n}</div>
							<div className="l">{s.l}</div>
						</div>
					))}
				</div>
			</section>

			<section id="demo" className="wide section">
				<h2 className="section-title">{m.verdict.title}</h2>
				<p className="section-sub">{m.verdict.sub}</p>
				<div className="card verdict">
					<ScoreRing score={96} />
					<div>
						<div className="v-head">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/shield.svg" alt="" />
							<b>SlopGuard</b>
							<span className="badge">{m.verdict.badge}</span>
						</div>
						<ul className="reasons">
							{m.verdict.reasons.map((r) => (
								<li key={r}>{r}</li>
							))}
						</ul>
						<div className="chips">
							<span className="label quarantine">slop-quarantine</span>
							<span className="label cleared">slop-cleared</span>
							<span className="label fp">slopguard-feedback</span>
						</div>
						<p className="cmd-row">
							{m.verdict.cmdPre} <code>/slop approve</code>,{" "}
							<code>/slop reject</code>, {m.verdict.cmdOr}{" "}
							<code>/slop false-positive</code>
						</p>
					</div>
				</div>
			</section>

			<section id="pricing" className="wide section">
				<h2 className="section-title">{m.pricing.title}</h2>
				<p className="section-sub">{m.pricing.sub}</p>
				<div className="grid">
					{PLAN_ORDER.map((id) => {
						const copy = m.pricing.plans[id];
						return (
							<div
								className={`card plan${id === "pro" ? " featured" : ""}`}
								key={id}
							>
								{id === "pro" && (
									<span className="ribbon">
										{lang === "ko" ? "가장 인기" : "most popular"}
									</span>
								)}
								<h3>{copy.name}</h3>
								<div className="price">
									<span className="amt">${PLANS[id].priceMonthly}</span>
									<span className="per">{m.pricing.per}</span>
								</div>
								<p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
									{copy.tagline}
								</p>
								<ul>
									{copy.features.map((f) => (
										<li key={f}>{f}</li>
									))}
								</ul>
								{id === "free" ? (
									<a className="btn btn-ghost" href={INSTALL_URL}>
										{m.pricing.getStarted}
									</a>
								) : (
									<a
										className="btn btn-primary"
										href={`/api/billing/checkout?plan=${id}`}
									>
										{m.pricing.choose(copy.name)}
									</a>
								)}
							</div>
						);
					})}
				</div>
				<p className="section-sub" style={{ marginTop: 18, fontSize: 13 }}>
					{m.pricing.note}
				</p>
			</section>

			<section id="how" className="wide section">
				<h2 className="section-title">{m.how.title}</h2>
				<p className="section-sub">{m.how.sub}</p>
				<div className="steps">
					{m.how.steps.map((s, i) => (
						// eslint-disable-next-line react/no-array-index-key
						<div className="step" key={i}>
							<span className="num" />
							<p>{s}</p>
						</div>
					))}
				</div>
			</section>

			<section className="wide section">
				<h2 className="section-title">{m.features.title}</h2>
				<p className="section-sub">{m.features.sub}</p>
				<div className="grid">
					{m.features.items.map((f) => (
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
					{m.footer.tagline}
				</p>
				<p style={{ fontSize: 12, marginTop: 10 }}>
					<Link href="/setup" className="muted">
						{lang === "ko" ? "직접 호스팅 (셀프호스팅)" : "Self-host SlopGuard"}
					</Link>
				</p>
			</footer>
		</>
	);
}
