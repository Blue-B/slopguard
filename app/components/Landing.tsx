import Link from "next/link";
import { INSTALL_URL, REPO_URL } from "@/lib/config";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { messages, type Lang } from "@/lib/i18n";
import AuthNav from "./AuthNav";

// Section copy that lives outside the core i18n catalogue (added later).
const EX = {
	en: {
		ctaNote: "Adds SlopGuard to a repo or org on GitHub. One click, no config, free for public repos.",
		navInstallTitle: "Add the app to your repositories",
		howDetail: [
			"SlopGuard receives the pull_request / issues / issue_comment event. Untrusted text is isolated with per-request nonce markers.",
			"Rule signals (boilerplate, emoji-marketing headers, empty body, giant unfocused diffs, prompt-injection) run first; the LLM judge is optional and falls back gracefully on rate limits.",
			"Provenance extraction looks for generator hints, a prompt fingerprint, and leaked assistant phrases. Score is blended and clamped 0-100.",
			"Below your threshold nothing happens. At or above it, the slop-quarantine label and a review comment with the reasons are posted.",
			"You reply with a slash command. Reject closes it as your explicit action; approve clears it; false-positive opens a tuning issue.",
		],
		quality: {
			title: "Measured, not hand-waved",
			sub: "Scored against a labelled 25-case golden set on every commit. Heuristics-only, no LLM key.",
			bars: [
				{ label: "Precision", val: "100%", pct: 100 },
				{ label: "Recall", val: "92%", pct: 92 },
				{ label: "F1", val: "96%", pct: 96 },
			],
			big: "0",
			bigCap: "false positives on the golden set at the default threshold (50).",
			rows: [
				["threshold", "50 / 100"],
				["false negatives", "1 / 13"],
				["mode", "heuristics-only"],
			],
		},
		footer: {
			tag: "Triage AI slop without auto-closing real contributors.",
			product: "Product",
			resources: "Resources",
			company: "Project",
			links: {
				how: "How it works",
				pricing: "Pricing",
				demo: "Example run",
				github: "GitHub repo",
				selfhost: "Self-host",
				policy: "SLOP_POLICY.yml",
				license: "MIT License",
				account: "Account",
			},
			rights: "Open source under the MIT License.",
		},
	},
	ko: {
		ctaNote: "GitHub에서 레포나 조직에 SlopGuard를 추가합니다. 클릭 한 번, 설정 불필요, 공개 레포는 무료.",
		navInstallTitle: "내 레포에 앱 추가",
		howDetail: [
			"SlopGuard가 pull_request / issues / issue_comment 이벤트를 받습니다. 신뢰할 수 없는 텍스트는 요청별 nonce 마커로 격리됩니다.",
			"규칙 신호(보일러플레이트, 이모지 마케팅 헤더, 빈 본문, 거대한 diff, 프롬프트 인젝션)가 먼저 돌고, LLM 판정은 선택이며 레이트리밋 시 안전하게 폴백합니다.",
			"출처 추출은 생성기 힌트, 프롬프트 지문, 누출된 어시스턴트 문구를 찾습니다. 점수는 블렌딩 후 0-100으로 보정됩니다.",
			"임계값 아래면 아무 일도 없습니다. 이상이면 slop-quarantine 라벨과 근거가 담긴 리뷰 코멘트가 달립니다.",
			"슬래시 명령으로 답합니다. reject는 당신의 명시적 행동으로 닫고, approve는 격리 해제, false-positive는 튜닝 이슈를 엽니다.",
		],
		quality: {
			title: "감으로가 아니라, 측정합니다",
			sub: "라벨링된 25개 골든셋으로 매 커밋마다 채점합니다. 휴리스틱 전용, LLM 키 없이.",
			bars: [
				{ label: "정밀도", val: "100%", pct: 100 },
				{ label: "재현율", val: "92%", pct: 92 },
				{ label: "F1", val: "96%", pct: 96 },
			],
			big: "0",
			bigCap: "기본 임계값(50)에서 골든셋 오탐(false positive) 건수.",
			rows: [
				["임계값", "50 / 100"],
				["미탐(false negative)", "1 / 13"],
				["모드", "휴리스틱 전용"],
			],
		},
		footer: {
			tag: "진짜 기여자를 자동으로 닫지 않으면서 AI 슬롭을 분류합니다.",
			product: "제품",
			resources: "리소스",
			company: "프로젝트",
			links: {
				how: "동작 방식",
				pricing: "가격",
				demo: "실제 동작 예시",
				github: "GitHub 레포",
				selfhost: "셀프호스팅",
				policy: "SLOP_POLICY.yml",
				license: "MIT 라이선스",
				account: "마이페이지",
			},
			rights: "MIT 라이선스 기반 오픈소스.",
		},
	},
} as const;

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

export default function Landing({ lang }: { lang: Lang }) {
	const m = messages[lang];
	const x = EX[lang];
	const home = lang === "ko" ? "/ko" : "/";
	const accountHref = lang === "ko" ? "/ko/account" : "/account";

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
					<a href={REPO_URL}>GitHub</a>
					<span className="lang-switch">
						<Link className={lang === "en" ? "on" : ""} href="/">
							EN
						</Link>
						<Link className={lang === "ko" ? "on" : ""} href="/ko">
							KO
						</Link>
					</span>
					<AuthNav lang={lang} />
					<a className="btn btn-primary" href={INSTALL_URL} title={x.navInstallTitle}>
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
						<a className="btn btn-ghost btn-lg" href="#how">
							{lang === "ko" ? "동작 방식 보기" : "See how it works"}
						</a>
					</div>
					<p className="cta-note">{x.ctaNote}</p>
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

			<section className="wide section">
				<h2 className="section-title">{x.quality.title}</h2>
				<p className="section-sub">{x.quality.sub}</p>
				<div className="quality">
					<div className="bars">
						{x.quality.bars.map((b) => (
							<div className="bar-row" key={b.label}>
								<div className="bar-top">
									<span className="bar-label">{b.label}</span>
									<span className="bar-val">{b.val}</span>
								</div>
								<div className="bar-track">
									<div className="bar-fill" style={{ width: `${b.pct}%` }} />
								</div>
							</div>
						))}
					</div>
					<div className="quality-aside">
						<div className="big">{x.quality.big}</div>
						<div className="cap">{x.quality.bigCap}</div>
						<div style={{ marginTop: 16 }}>
							{x.quality.rows.map(([k, v]) => (
								<div className="row" key={k}>
									<span>{k}</span>
									<span className="mono">{v}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section id="pricing" className="wide section">
				<h2 className="section-title">{m.pricing.title}</h2>
				<p className="section-sub">{m.pricing.sub}</p>
				<div className="plans-3">
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
							<p>
								{s}
								<span className="step-d">{x.howDetail[i]}</span>
							</p>
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
				<div className="footer-grid">
					<div>
						<span className="footer-brand">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/shield.svg" alt="" />
							SlopGuard
						</span>
						<p className="muted" style={{ fontSize: 13, maxWidth: 260, marginTop: 12 }}>
							{x.footer.tag}
						</p>
					</div>
					<div className="footer-col">
						<h4>{x.footer.product}</h4>
						<a href="#how">{x.footer.links.how}</a>
						<a href="#pricing">{x.footer.links.pricing}</a>
						<a href="#demo">{x.footer.links.demo}</a>
						<Link href={accountHref}>{x.footer.links.account}</Link>
					</div>
					<div className="footer-col">
						<h4>{x.footer.resources}</h4>
						<a href={REPO_URL}>{x.footer.links.github}</a>
						<Link href="/setup">{x.footer.links.selfhost}</Link>
						<a href={`${REPO_URL}/blob/main/.github/SLOP_POLICY.example.yml`}>
							{x.footer.links.policy}
						</a>
					</div>
					<div className="footer-col">
						<h4>{x.footer.company}</h4>
						<a href={`${REPO_URL}/blob/main/LICENSE`}>{x.footer.links.license}</a>
						<a href={`${REPO_URL}/issues`}>Issues</a>
					</div>
				</div>
				<div className="footer-bottom">
					<span>© {new Date().getFullYear()} SlopGuard. {x.footer.rights}</span>
					<span className="mono">{m.footer.tagline}</span>
				</div>
			</footer>
		</>
	);
}
