import Link from "next/link";
import { REPO_URL } from "@/lib/config";
import type { Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import DocsToc from "./DocsToc";
import RevealOnScroll from "./RevealOnScroll";
import SiteFooter from "./SiteFooter";

const EXAMPLE_YML = `# .github/SLOP_POLICY.yml  (all fields optional)
version: 1
enabled: true

scan:
  pull_requests: true
  issues: true

thresholds:
  quarantine: 50        # score at/above this gets a label + comment
  high_confidence: 85   # phrased more strongly (still never auto-closes)

allowlist:
  authors: [dependabot[bot], renovate[bot]]
  paths: ["docs/**", "**/*.md"]

heuristics:
  weight: 0.4           # blended with the LLM score (llm weight = 1 - this)

llm:
  enabled: true
  provider_order: [anthropic, grok, openai]
`;

/** On-site documentation page (EN/KO), shared by /docs and /ko/docs. */
export default function DocsBody({ lang }: { lang: Lang }) {
	const ko = lang === "ko";
	const installHref = ko ? "/ko/install" : "/install";
	const howHref = ko ? "/ko/how-it-works" : "/how-it-works";
	const exampleUrl = `${REPO_URL}/blob/main/.github/SLOP_POLICY.example.yml`;

	const t = ko
		? {
				eyebrow: "문서",
				h1: "SlopGuard 문서",
				sub: "설치, 슬래시 명령, 점수, 그리고 .github/SLOP_POLICY.yml로 동작을 바꾸는 방법입니다.",
				quickTitle: "빠른 시작",
				quick:
					"GitHub 앱을 레포나 조직에 설치하면 끝입니다. 공개 레포는 무료이고, 설정 파일 없이 기본값으로 바로 동작합니다. 새 PR이나 이슈가 들어오면 점수를 매기고, 임계값 이상이면 slop-quarantine 라벨과 근거 코멘트를 답니다. 절대 자동으로 닫지 않습니다.",
				cmdTitle: "슬래시 명령",
				cmdLead: "관리자는 코멘트로 답합니다. 모든 동작은 사람이 결정합니다.",
				cmds: [
					[
						"/slop approve",
						"격리를 해제하고 정상 기여로 표시합니다 (slop-cleared).",
					],
					[
						"/slop reject",
						"본인이 직접 닫는 동작입니다. AI 슬롭으로 판단해 PR을 닫습니다.",
					],
					[
						"/slop false-positive",
						"오탐을 알리는 튜닝 이슈를 열고 격리를 해제합니다.",
					],
				],
				scoreTitle: "점수와 임계값",
				score:
					"모든 기여는 0(깨끗)에서 100(거의 확실한 슬롭) 사이 점수를 받습니다. 기본값으로 50 이상이면 격리, 85 이상이면 코멘트를 더 강하게 표현합니다. 점수가 어떻게 나오는지는",
				scoreLink: "동작 방식",
				scoreTail: "에서 볼 수 있습니다.",
				cfgTitle: "SLOP_POLICY.yml 설정",
				cfg: "레포에 .github/SLOP_POLICY.yml 파일을 두면 동작을 바꿀 수 있습니다. 전부 선택이고, 적은 항목만 덮어씁니다.",
				optsTitle: "주요 옵션",
				opts: [
					["enabled", "끄지 않고 SlopGuard를 잠시 멈추는 마스터 스위치."],
					["scan", "PR과 이슈 중 무엇을 검사할지."],
					["thresholds", "격리(quarantine)와 강조(high_confidence) 점수 기준."],
					["labels", "격리/정상 확인/고확신 라벨 이름."],
					["allowlist", "신뢰하는 작성자나 경로(글롭)는 검사에서 제외."],
					["heuristics", "규칙 점수 가중치(0~1). 오탐을 줄일 때 조정."],
					["llm", "LLM 판정 사용 여부와 프로바이더 순서."],
					["comment_template", "PR 코멘트 양식. {{score}} 같은 변수 지원."],
					["notify", "격리 시 Slack/Discord/웹훅 알림 (Team 플랜)."],
				],
				fullEx: "전체 예시 보기",
				selfhost: "셀프호스팅 (GitHub)",
				ctaTitle: "준비됐나요?",
				cta: "GitHub 앱 설치",
			}
		: {
				eyebrow: "docs",
				h1: "SlopGuard documentation",
				sub: "Install, slash commands, scoring, and how to change behavior with .github/SLOP_POLICY.yml.",
				quickTitle: "Quick start",
				quick:
					"Install the GitHub App on a repo or org and you are done. Public repos are free and it works out of the box with no config. New PRs and issues get scored; at or above the threshold it adds the slop-quarantine label and a review comment with the reasons. It never auto-closes.",
				cmdTitle: "Slash commands",
				cmdLead:
					"Maintainers reply with a comment. Every action stays with a human.",
				cmds: [
					[
						"/slop approve",
						"Clears the quarantine and marks it a real contribution (slop-cleared).",
					],
					["/slop reject", "Your explicit action: closes the PR as AI slop."],
					[
						"/slop false-positive",
						"Opens a tuning issue and clears the quarantine.",
					],
				],
				scoreTitle: "Scoring and thresholds",
				score:
					"Every contribution gets a score from 0 (clean) to 100 (almost certainly slop). By default 50+ is quarantined and 85+ is phrased more strongly. For how the score is built, see",
				scoreLink: "How it works",
				scoreTail: ".",
				cfgTitle: "SLOP_POLICY.yml configuration",
				cfg: "Drop a .github/SLOP_POLICY.yml file in your repo to change behavior. Everything is optional; you only override what you set.",
				optsTitle: "Key options",
				opts: [
					["enabled", "Master switch to pause SlopGuard without uninstalling."],
					["scan", "Whether to scan pull requests, issues, or both."],
					["thresholds", "The quarantine and high_confidence score cutoffs."],
					[
						"labels",
						"Names for the quarantine, cleared, and high-confidence labels.",
					],
					["allowlist", "Skip trusted authors or paths (globs) entirely."],
					[
						"heuristics",
						"Rule-score weight (0-1). Tune to reduce false positives.",
					],
					["llm", "Whether to use the LLM judge and the provider order."],
					[
						"comment_template",
						"The PR comment format. Supports variables like {{score}}.",
					],
					["notify", "Slack/Discord/webhook alerts on quarantine (Team plan)."],
				],
				fullEx: "See the full example",
				selfhost: "Self-host (GitHub)",
				ctaTitle: "Ready?",
				cta: "Install the GitHub App",
			};

	return (
		<>
			<MarketingNav
				lang={lang}
				enHref="/docs"
				koHref="/ko/docs"
				active="docs"
			/>
			<RevealOnScroll />
			<main className="docs-main">
				<header className="docs-hero">
					<div className="grid-bg" aria-hidden="true" />
					<div className="docs-hero-copy">
						<span className="eyebrow">{t.eyebrow}</span>
						<h1 className="page-h1">{t.h1}</h1>
						<p className="page-sub">{t.sub}</p>
						<nav className="docs-hero-links">
							<a href="#quickstart">{t.quickTitle}</a>
							<a href="#commands">{t.cmdTitle}</a>
							<a href="#scoring">{t.scoreTitle}</a>
							<a href="#config">{t.cfgTitle}</a>
						</nav>
					</div>
					<figure className="plate docs-hero-plate">
						<figcaption className="plate-bar">
							<span>{ko ? "설정과 동작" : "config & behavior"}</span>
							<span className="plate-coord">fig.04</span>
						</figcaption>
						<div className="plate-art">
							<span className="plate-tag">SLOP_POLICY.yml</span>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/gears-circuit.png" alt="" />
							<span className="plate-scan" aria-hidden="true" />
						</div>
					</figure>
				</header>

				<div className="docs-layout">
					<aside className="docs-side">
						<DocsToc
							items={[
								{ id: "quickstart", label: t.quickTitle },
								{ id: "commands", label: t.cmdTitle },
								{ id: "scoring", label: t.scoreTitle },
								{ id: "config", label: t.cfgTitle },
							]}
						/>
					</aside>
					<div className="docs-content">
						<section id="quickstart" className="docs-section">
							<h2>{t.quickTitle}</h2>
							<p>{t.quick}</p>
							<Link className="btn btn-primary btn-lg" href={installHref}>
								{t.cta}
							</Link>
						</section>

						<section id="commands" className="docs-section">
							<h2>{t.cmdTitle}</h2>
							<p>{t.cmdLead}</p>
							<dl className="docs-cmds">
								{t.cmds.map(([c, d]) => (
									<div key={c}>
										<dt>
											<code>{c}</code>
										</dt>
										<dd>{d}</dd>
									</div>
								))}
							</dl>
						</section>

						<section id="scoring" className="docs-section">
							<h2>{t.scoreTitle}</h2>
							<p>
								{t.score} <Link href={howHref}>{t.scoreLink}</Link>
								{t.scoreTail}
							</p>
						</section>

						<section id="config" className="docs-section">
							<h2>{t.cfgTitle}</h2>
							<p>{t.cfg}</p>
							<figure className="plate docs-code-plate">
								<figcaption className="plate-bar">
									<span>.github/SLOP_POLICY.yml</span>
									<span className="plate-coord">{ko ? "예시" : "example"}</span>
								</figcaption>
								<pre className="docs-code">
									<code>{EXAMPLE_YML}</code>
								</pre>
							</figure>
							<h3>{t.optsTitle}</h3>
							<dl className="docs-opts">
								{t.opts.map(([k, d]) => (
									<div key={k}>
										<dt>
											<code>{k}</code>
										</dt>
										<dd>{d}</dd>
									</div>
								))}
							</dl>
							<div className="docs-links">
								<a href={exampleUrl}>{t.fullEx}</a>
								<a href={REPO_URL}>{t.selfhost}</a>
							</div>
						</section>
					</div>
				</div>
			</main>
			<SiteFooter lang={lang} />
		</>
	);
}
