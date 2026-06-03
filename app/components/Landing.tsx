import Link from "next/link";
import { messages, type Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import RevealOnScroll from "./RevealOnScroll";
import SectionHead from "./SectionHead";
import SiteFooter from "./SiteFooter";
import SlopMeter from "./SlopMeter";

// Section copy that lives outside the core i18n catalogue (added later).
export const EX = {
	en: {
		ctaNote:
			"Adds SlopGuard to a repo or org on GitHub. One click, no config, free for public repos.",
		navInstallTitle: "Add the app to your repositories",
		slop: {
			title: "What is AI slop?",
			body: "AI slop is low-effort, machine-generated content pushed to a repo with little or no human review: PRs and issues spun up by an LLM that look plausible but miss the context, add nothing, and mostly exist to farm activity or contribution stats.",
			points: [
				{
					ico: "# looks legit",
					t: "Looks legit",
					d: "Polished phrasing, a tidy title, a confident summary, and no real grasp of the codebase.",
				},
				{
					ico: "~ review time",
					t: "Burns review time",
					d: "A maintainer still has to read it, ask questions, and work out that it goes nowhere.",
				},
				{
					ico: "x10 repos",
					t: "Arrives in bulk",
					d: "One prompt becomes ten near-identical PRs across ten projects.",
				},
			],
		},
		howDetail: [
			"SlopGuard receives the pull_request / issues / issue_comment event. Untrusted text is isolated with per-request nonce markers.",
			"Rule signals (boilerplate, emoji-marketing headers, empty body, giant unfocused diffs, prompt-injection) run first; the LLM judge is optional and falls back gracefully on rate limits.",
			"Provenance extraction looks for generator hints, a prompt fingerprint, and leaked assistant phrases. Score is blended and clamped 0-100.",
			"Below your threshold nothing happens. At or above it, the slop-quarantine label and a review comment with the reasons are posted.",
			"You reply with a slash command. Reject closes it as your explicit action; approve clears it; false-positive opens a tuning issue.",
		],
		quality: {
			title: "Measured, not hand-waved",
			sub: "Every commit re-scores SlopGuard against a hand-labelled golden set of 25 cases, 13 real slop and 12 legit contributions, at the default threshold of 50. Heuristics only, no LLM key. Here is exactly how it did.",
			bars: [
				{
					label: "Precision",
					val: "100%",
					pct: 100,
					note: "Of everything it flagged, all of it was real slop. Zero false alarms.",
				},
				{
					label: "Recall",
					val: "92%",
					pct: 92,
					note: "It caught 12 of the 13 real slop cases.",
				},
				{
					label: "F1",
					val: "96%",
					pct: 96,
					note: "Precision and recall combined into one score.",
				},
			],
			matrixTitle: "What happened to all 25 cases",
			axisTop: ["Actually slop", "Actually legit"],
			rowLabels: ["Flagged as slop", "Passed as clean"],
			cells: [
				{ n: "12", k: "caught", tone: "good" },
				{ n: "0", k: "false alarms", tone: "good" },
				{ n: "1", k: "missed", tone: "warn" },
				{ n: "12", k: "left alone", tone: "good" },
			],
			legend:
				"24 of 25 correct. The single miss was real slop that slipped through, not a real contributor wrongly flagged. It never once punished a genuine PR.",
		},
		pipeline: {
			intro:
				"A pull request or issue flows through one short pipeline. No CI job to wire up, no config to write, no server for you to run.",
			nodes: [
				{
					k: "event",
					t: "GitHub sends the event",
					d: "A PR or issue is opened, updated, or commented on.",
					tags: ["pull_request", "issues", "issue_comment"],
				},
				{
					k: "detection agent",
					t: "Three signals, one score",
					sigs: [
						"Rule heuristics, boilerplate, emoji-marketing headers, empty body, prompt-injection",
						"Provenance, generator hints, a prompt fingerprint, leaked assistant phrases",
						"LLM judge (optional), degrades to heuristics on rate limits",
					],
					score: "blended, clamped 0 to 100",
				},
				{
					k: "policy gate",
					t: "Your threshold decides",
					d: "The score is checked against your .github/SLOP_POLICY.yml.",
					branch: ["below: nothing happens", "at or above: act"],
				},
				{
					k: "you decide",
					t: "Labelled, never auto-closed",
					d: "A slop-quarantine label and a review comment with the reasons. You always have the final word.",
					tags: ["/slop approve", "reject", "false-positive"],
				},
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
		ctaNote:
			"GitHub에서 레포나 조직에 SlopGuard를 추가합니다. 클릭 한 번, 설정 불필요, 공개 레포는 무료.",
		navInstallTitle: "내 레포에 앱 추가",
		slop: {
			title: "AI 슬롭이 뭔가요?",
			body: "AI 슬롭은 사람 검토가 거의 없이 LLM으로 찍어낸 저품질 기여입니다. 그럴듯해 보이지만 코드 맥락을 모르고, 보탬도 안 되며, 활동량이나 기여 횟수를 부풀리려고 올라오는 PR이나 이슈를 말합니다.",
			points: [
				{
					ico: "# 그럴듯함",
					t: "그럴듯해 보임",
					d: "말끔한 문장, 깔끔한 제목, 자신감 있는 요약. 정작 코드베이스는 이해하지 못합니다.",
				},
				{
					ico: "~ 검토 시간",
					t: "검토 시간만 소모",
					d: "관리자는 결국 읽고, 되묻고, 쓸모없다는 걸 확인해야 합니다.",
				},
				{
					ico: "x10 레포",
					t: "대량으로 들어옴",
					d: "프롬프트 하나가 레포 열 곳에 거의 똑같은 PR 열 개로 쏟아집니다.",
				},
			],
		},
		howDetail: [
			"SlopGuard가 pull_request / issues / issue_comment 이벤트를 받습니다. 신뢰할 수 없는 텍스트는 요청별 nonce 마커로 격리됩니다.",
			"규칙 신호(보일러플레이트, 이모지 마케팅 헤더, 빈 본문, 거대한 diff, 프롬프트 인젝션)가 먼저 돌고, LLM 판정은 선택이며 레이트리밋 시 안전하게 폴백합니다.",
			"출처 추출은 생성기 힌트, 프롬프트 지문, 누출된 어시스턴트 문구를 찾습니다. 점수는 블렌딩 후 0-100으로 보정됩니다.",
			"임계값 아래면 아무 일도 없습니다. 이상이면 slop-quarantine 라벨과 근거가 담긴 리뷰 코멘트가 달립니다.",
			"슬래시 명령으로 답합니다. reject는 본인이 직접 닫는 동작이고, approve는 격리를 해제하며, false-positive는 튜닝 이슈를 엽니다.",
		],
		quality: {
			title: "감으로가 아니라, 측정합니다",
			sub: "매 커밋마다, 사람이 직접 라벨을 단 25개 골든셋(진짜 슬롭 13건 + 정상 기여 12건)으로 임계값 50에서 다시 채점합니다. LLM 키 없이 휴리스틱만으로요. 결과는 이렇습니다.",
			bars: [
				{
					label: "정밀도",
					val: "100%",
					pct: 100,
					note: "슬롭이라고 표시한 건 전부 진짜 슬롭이었습니다. 오탐 0건.",
				},
				{
					label: "재현율",
					val: "92%",
					pct: 92,
					note: "실제 슬롭 13건 중 12건을 잡아냈습니다.",
				},
				{
					label: "F1",
					val: "96%",
					pct: 96,
					note: "정밀도와 재현율을 하나로 합친 점수.",
				},
			],
			matrixTitle: "25개 케이스 전부, 어떻게 됐나",
			axisTop: ["실제 슬롭", "실제 정상"],
			rowLabels: ["슬롭으로 표시", "통과시킴"],
			cells: [
				{ n: "12", k: "정확히 잡음", tone: "good" },
				{ n: "0", k: "오탐", tone: "good" },
				{ n: "1", k: "놓침", tone: "warn" },
				{ n: "12", k: "그대로 통과", tone: "good" },
			],
			legend:
				"25건 중 24건 정확. 유일하게 놓친 1건도 빠져나간 슬롭이지, 진짜 기여자를 잘못 막은 게 아닙니다. 정상 PR을 막은 적은 한 번도 없습니다.",
		},
		pipeline: {
			intro:
				"PR이나 이슈가 들어오면 짧은 파이프라인 하나를 거칩니다. 붙일 CI 잡도, 작성할 설정도, 직접 돌릴 서버도 없습니다.",
			nodes: [
				{
					k: "이벤트",
					t: "GitHub이 이벤트를 보냄",
					d: "PR이나 이슈가 열리거나, 수정되거나, 코멘트가 달립니다.",
					tags: ["pull_request", "issues", "issue_comment"],
				},
				{
					k: "탐지 에이전트",
					t: "세 가지 신호, 하나의 점수",
					sigs: [
						"규칙 휴리스틱: 보일러플레이트, 이모지 마케팅 헤더, 빈 본문, 프롬프트 인젝션",
						"출처 추적: 생성기 힌트, 프롬프트 지문, 누출된 어시스턴트 문구",
						"LLM 판정(선택): 레이트리밋 시 휴리스틱으로 폴백",
					],
					score: "블렌딩 후 0~100으로 보정",
				},
				{
					k: "정책 게이트",
					t: "임계값이 판단",
					d: "점수를 레포의 .github/SLOP_POLICY.yml과 대조합니다.",
					branch: ["미만: 아무 일 없음", "이상: 조치"],
				},
				{
					k: "사람이 결정",
					t: "라벨만, 절대 자동 닫지 않음",
					d: "slop-quarantine 라벨과 근거가 담긴 리뷰 코멘트. 최종 결정은 언제나 당신 몫입니다.",
					tags: ["/slop approve", "reject", "false-positive"],
				},
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

export type PipeNode = {
	k: string;
	t: string;
	d?: string;
	sigs?: readonly string[];
	score?: string;
	branch?: readonly string[];
	tags?: readonly string[];
};

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
	const x = EX[lang];
	const installHref = lang === "ko" ? "/ko/install" : "/install";

	return (
		<>
			<MarketingNav lang={lang} enHref="/" koHref="/ko" />
			<RevealOnScroll />

			<header className="hero">
				<div className="grid-bg" aria-hidden="true" />
				<div className="wide hero-grid">
					<div className="hero-copy">
						<h1>
							{m.hero.h1a}
							<span className="hl">{m.hero.h1b}</span>
							{m.hero.h1c}
						</h1>
						<p className="sub">{m.hero.sub}</p>
						<div className="btn-row">
							<Link className="btn btn-primary btn-lg" href={installHref}>
								{m.hero.ctaInstall}
							</Link>
							<Link
								className="btn btn-ghost btn-lg"
								href={lang === "ko" ? "/ko/how-it-works" : "/how-it-works"}
							>
								{lang === "ko" ? "동작 방식 보기" : "See how it works"}
							</Link>
						</div>
						<p className="cta-note">{x.ctaNote}</p>
					</div>
					<figure className="plate plate-hero">
						<figcaption className="plate-bar">
							<span>
								{lang === "ko"
									? "밀려오는 AI 슬롭의 파도"
									: "the rising tide of AI slop"}
							</span>
							<span className="plate-coord">36.23N / 139.02E</span>
						</figcaption>
						<div className="plate-art">
							<span className="plate-tag">HOKUSAI × SLOPGUARD</span>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/wave-circuit.png" alt={m.hero.emblemAlt} />
							<span className="plate-scan" aria-hidden="true" />
						</div>
					</figure>
				</div>
			</header>

			<section className="wide section">
				<SectionHead
					no="01"
					kicker={lang === "ko" ? "라이브 데모" : "live demo"}
					title={
						lang === "ko" ? "임계값은 당신이 정합니다" : "You set the threshold"
					}
					sub={
						lang === "ko"
							? "슬라이더를 끌어 슬롭 점수 기준을 바꾔보세요. PR이 실시간으로 격리와 통과로 나끗니다."
							: "Drag the slider to move the slop-score line. PRs reclassify between quarantined and passed in real time."
					}
				/>
				<Reveal>
					<div className="plate plate-pad">
						<SlopMeter lang={lang} />
					</div>
				</Reveal>
			</section>

			<section className="wide section">
				<SectionHead
					no="02"
					kicker={lang === "ko" ? "관리자 화면" : "what a maintainer sees"}
					title={m.verdict.title}
					sub={m.verdict.sub}
				/>
				<Reveal>
					<figure className="plate review">
						<figcaption className="plate-bar">
							<span>pull_request #239</span>
							<span className="plate-coord">
								{lang === "ko" ? "점수 96 / 100" : "score 96 / 100"}
							</span>
						</figcaption>
						<div className="review-body">
							<div className="review-rail">
								<ScoreRing score={96} />
							</div>
							<div className="review-main">
								<div className="review-head">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src="/shield.svg" alt="" />
									<b>slopguard</b>
									<span className="bot-tag">bot</span>
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
					</figure>
				</Reveal>
			</section>

			<section className="wide">
				<div className="stats">
					{m.stats.map((s) => (
						<div className="stat" key={s.l}>
							<div className="n">
								<CountUp value={s.n} />
							</div>
							<div className="l">{s.l}</div>
						</div>
					))}
				</div>
			</section>

			<section id="what" className="wide section">
				<SectionHead
					no="03"
					kicker={lang === "ko" ? "정의" : "the definition"}
					title={x.slop.title}
					sub={x.slop.body}
				/>
				<div className="slop-grid">
					{x.slop.points.map((p, i) => (
						<figure className="slop-card" key={p.t}>
							<div className="slop-art">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={["/art-legit.png", "/art-time.png", "/art-bulk.png"][i]}
									alt=""
									loading="lazy"
								/>
								<span className="slop-tag mono">{p.ico}</span>
							</div>
							<figcaption>
								<h3>{p.t}</h3>
								<p>{p.d}</p>
							</figcaption>
						</figure>
					))}
				</div>
			</section>

			<section className="wide section">
				<SectionHead
					no="04"
					kicker={lang === "ko" ? "측정" : "measured"}
					title={x.quality.title}
					sub={x.quality.sub}
				/>
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
								<p className="bar-note">{b.note}</p>
							</div>
						))}
					</div>
					<figure className="cases">
						<figcaption className="cases-title">
							{x.quality.matrixTitle}
						</figcaption>
						<div className="case-grid" aria-hidden="true">
							{Array.from({ length: 25 }).map((_, i) => {
								const cls =
									i < 12 ? "caught" : i === 12 ? "miss" : "passed";
								return <span key={i} className={`case ${cls}`} />;
							})}
						</div>
						<ul className="cases-legend">
							<li className="caught">
								<span className="sw" />
								{lang === "ko" ? "슬롭 정확히 잡음" : "slop caught"} <b>12</b>
							</li>
							<li className="passed">
								<span className="sw" />
								{lang === "ko" ? "정상 통과" : "legit passed"} <b>12</b>
							</li>
							<li className="miss">
								<span className="sw" />
								{lang === "ko" ? "놓침" : "missed"} <b>1</b>
							</li>
							<li className="fp">
								<span className="sw" />
								{lang === "ko" ? "잘못 막음" : "false alarm"} <b>0</b>
							</li>
						</ul>
						<p className="cases-note">{x.quality.legend}</p>
					</figure>
				</div>
			</section>

			<section className="wide section">
				<SectionHead
					no="05"
					kicker={lang === "ko" ? "설계 원칙" : "by design"}
					title={m.features.title}
					sub={m.features.sub}
				/>
				<div className="feature-grid">
					{m.features.items.map((f) => (
						<div className="feature" key={f.t}>
							<div className="ico mono">{f.ico}</div>
							<h3>{f.t}</h3>
							<p>{f.d}</p>
						</div>
					))}
				</div>
			</section>

			<section className="outro">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					className="outro-wave"
					src="/wave-circuit.png"
					alt=""
					aria-hidden="true"
				/>
				<div className="wide outro-inner">
					<h2 className="outro-title">
						{lang === "ko"
							? "관리자 시간을 슬롭에 빼앗기지 마세요"
							: "Stop losing maintainer time to slop."}
					</h2>
					<p className="outro-sub">
						{lang === "ko"
							? "클릭 한 번으로 레포에 추가하세요. 공개 레포는 무료이고, 절대 자동으로 닫지 않습니다."
							: "Add it to a repo in one click. Free for public repos, and it never auto-closes."}
					</p>
					<div className="btn-row">
						<Link className="btn btn-primary btn-lg" href={installHref}>
							{m.hero.ctaInstall}
						</Link>
						<Link
							className="btn btn-ghost btn-lg"
							href={lang === "ko" ? "/ko/how-it-works" : "/how-it-works"}
						>
							{lang === "ko" ? "동작 방식" : "How it works"}
						</Link>
					</div>
					<div className="outro-sig">
						<span>slopguard</span>
						<span>MIT licensed</span>
						<span>
							{lang === "ko" ? "자동으로 닫은 PR 0건" : "0 auto-closed PRs"}
						</span>
					</div>
				</div>
			</section>

			<SiteFooter lang={lang} />
		</>
	);
}
