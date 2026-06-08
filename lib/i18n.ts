import type { PlanId } from "./billing/plans.js";

export type Lang = "en" | "ko";
export const LANGS: Lang[] = ["en", "ko"];

export interface PlanCopy {
	name: string;
	tagline: string;
	features: string[];
}

export interface Messages {
	htmlLang: string;
	nav: { how: string; pricing: string; install: string };
	hero: {
		eyebrow: string;
		h1a: string;
		h1b: string; // highlighted word
		h1c: string; // suffix after the highlight (for KO word order)
		sub: string;
		ctaInstall: string;
		ctaPricing: string;
		fine: string;
		emblemAlt: string;
	};
	stats: { n: string; l: string }[];
	verdict: {
		title: string;
		sub: string;
		badge: string;
		reasons: string[];
		cmdPre: string;
		cmdOr: string;
	};
	pricing: {
		title: string;
		sub: string;
		per: string;
		getStarted: string;
		choose: (name: string) => string;
		note: string;
		plans: Record<PlanId, PlanCopy>;
	};
	how: { title: string; sub: string; steps: React.ReactNode[] };
	features: {
		title: string;
		sub: string;
		items: { ico: string; t: string; d: string }[];
	};
	footer: { tagline: string };
}

export const messages: Record<Lang, Messages> = {
	en: {
		htmlLang: "en",
		nav: { how: "How it works", pricing: "Pricing", install: "Install" },
		hero: {
			eyebrow: "maintainer burnout, contained",
			h1a: "Stop AI slop from drowning your ",
			h1b: "repo",
			h1c: "",
			sub: "SlopGuard scores every incoming PR and issue for low-effort, machine-generated slop, tags its provenance, and quarantines it, then leaves the final call to a human.",
			ctaInstall: "Install the GitHub App",
			ctaPricing: "See pricing",
			fine: "# open source, MIT, never auto-closes, free for public repos",
			emblemAlt:
				"SlopGuard shield: a code-bracket emblem scanning pull requests",
		},
		stats: [
			{ n: "100%", l: "precision (golden set)" },
			{ n: "92%", l: "recall, heuristics-only" },
			{ n: "0", l: "auto-closed PRs, ever" },
			{ n: "MIT", l: "self-host for free" },
		],
		verdict: {
			title: "What a maintainer sees",
			sub: "Every contribution gets a 0 to 100 slop score, the reasons behind it, and a provenance trail. SlopGuard labels and comments. You decide.",
			badge: "likely slop",
			reasons: [
				"Chat-assistant boilerplate phrases (3)",
				"Leaked phrase “Certainly! Here is the updated code”",
				"Generic auto-generated title, empty description",
				"Provenance: prompt fingerprint b01706d4, machine-generated",
			],
			cmdPre: "maintainer replies",
			cmdOr: "or",
		},
		pricing: {
			title: "Pricing",
			sub: "Free to self-host forever (MIT). Paid tiers cover the managed LLM bill, private repos, and org controls. Checkout via Polar as Merchant of Record.",
			per: "/ month",
			getStarted: "Get started",
			choose: (n) => `Choose ${n}`,
			note: "Paid plans activate automatically: enter the GitHub org or username you install on at checkout, and Pro or Team unlocks within a minute.",
			plans: {
				free: {
					name: "Free",
					tagline: "For individuals and public repos. Forever free.",
					features: [
						"Heuristic + shared-LLM detection (fair-use quota, falls back to heuristics)",
						"Provenance tagging + quarantine label",
						"Human-in-the-loop /slop commands",
						".github/SLOP_POLICY.yml policy-as-code",
						"Public repositories",
						"Self-host the whole thing (MIT)",
					],
				},
				pro: {
					name: "Pro",
					tagline: "For maintainers with private repos and higher limits.",
					features: [
						"Everything in Free",
						"Private repositories",
						"Dedicated LLM quota (no shared rate limit)",
						"Cross-repo bot-campaign detection",
						"Higher rate limits",
					],
				},
				team: {
					name: "Team",
					tagline: "For orgs that need visibility, alerting, and controls.",
					features: [
						"Everything in Pro",
						"Org-wide dashboard across all repos",
						"Activity / audit log (who cleared what, when)",
						"Slack / Discord / webhook alerts on quarantine",
						"Higher rate limits",
						"Priority support",
					],
				},
				enterprise: {
					name: "Enterprise",
					tagline: "For companies that need SSO, audit export, and priority support.",
					features: [
						"Everything in Team",
						"SAML / SSO sign-in",
						"Audit log export + retention",
						"Priority support & onboarding",
						"Custom integrations on request",
					],
				},
			},
		},
		how: {
			title: "How it works",
			sub: "A webhook fires, the detection agent runs, and you get a score, a label, and a review comment in seconds.",
			steps: [
				"A PR or issue is opened. GitHub calls /api/webhook.",
				"The agent runs static heuristics (boilerplate, emoji headers, empty body, prompt-injection) plus an optional LLM judge.",
				"It scores 0-100, extracts provenance, and applies your .github/SLOP_POLICY.yml.",
				"At or above your threshold, it adds the slop-quarantine label and a review comment explaining why.",
				"A maintainer replies /slop approve, /slop reject, or /slop false-positive. SlopGuard never decides for you.",
			],
		},
		features: {
			title: "Built for maintainers",
			sub: "Triage help that respects contributors and never goes nuclear.",
			items: [
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
			],
		},
		footer: {
			tagline: "built for maintainers drowning in machine-generated noise",
		},
	},

	ko: {
		htmlLang: "ko",
		nav: { how: "동작 방식", pricing: "가격", install: "설치" },
		hero: {
			eyebrow: "관리자 번아웃, 이제 그만",
			h1a: "AI 슬롭으로부터\n",
			h1b: "레포",
			h1c: "를 지키세요",
			sub: "SlopGuard는 들어오는 모든 PR과 이슈를 저품질 기계생성 슬롭인지 점수로 평가하고, 출처를 태깅한 뒤 격리합니다. 닫을지 말지는 사람이 최종 결정합니다.",
			ctaInstall: "GitHub App 설치하기",
			ctaPricing: "가격 보기",
			fine: "# 오픈소스, MIT, 자동으로 닫지 않음, 공개 레포 무료",
			emblemAlt: "SlopGuard 실드: PR을 스캔하는 코드 브래킷 엠블럼",
		},
		stats: [
			{ n: "100%", l: "정밀도 (골든셋)" },
			{ n: "92%", l: "재현율 (휴리스틱만)" },
			{ n: "0", l: "자동으로 닫은 PR 수" },
			{ n: "MIT", l: "무료 셀프호스팅" },
		],
		verdict: {
			title: "관리자가 보는 화면",
			sub: "모든 기여는 0에서 100 사이의 슬롭 점수와 그 근거, 출처 추적 정보를 받습니다. SlopGuard는 라벨과 코멘트만 달고, 결정은 당신이 합니다.",
			badge: "슬롭 가능성 높음",
			reasons: [
				"챗봇 보일러플레이트 문구 (3건)",
				"누출된 문구 “Certainly! Here is the updated code”",
				"뻔한 자동생성 제목과 빈 설명",
				"출처: 프롬프트 지문 b01706d4, 기계생성",
			],
			cmdPre: "관리자가 댓글로",
			cmdOr: "또는",
		},
		pricing: {
			title: "가격",
			sub: "셀프호스팅은 영원히 무료입니다 (MIT). 유료 플랜은 관리형 LLM 비용, 비공개 레포, 조직 기능을 포함합니다. 결제는 Polar(Merchant of Record)가 처리합니다.",
			per: "/ 월",
			getStarted: "시작하기",
			choose: (n) => `${n} 선택`,
			note: "유료 플랜은 자동으로 켜집니다. 결제할 때 설치할 GitHub 조직이나 사용자명을 입력하면, 1분 안에 Pro나 Team 기능이 활성화됩니다.",
			plans: {
				free: {
					name: "Free",
					tagline: "개인과 공개 레포용. 영원히 무료.",
					features: [
						"휴리스틱 + 공유 LLM 탐지 (공정사용 한도, 초과 시 휴리스틱)",
						"출처 태깅 + 격리 라벨",
						"사람이 결정하는 /slop 명령",
						".github/SLOP_POLICY.yml 정책 코드화",
						"공개 레포",
						"전체 셀프호스팅 (MIT)",
					],
				},
				pro: {
					name: "Pro",
					tagline: "비공개 레포와 더 높은 한도가 필요한 관리자용.",
					features: [
						"Free의 모든 기능",
						"비공개 레포",
						"전용 LLM 쿼터 (공유 한도 없음)",
						"여러 레포에 걸친 봇 캠페인 탐지",
						"높은 처리 한도",
					],
				},
				team: {
					name: "Team",
					tagline: "가시성과 알림, 통제가 필요한 조직을 위해.",
					features: [
						"Pro의 모든 기능",
						"조직 전체 대시보드 (모든 레포)",
						"활동/감사 로그 (누가 언제 무엇을 처리했는지)",
						"격리 시 Slack / Discord / Webhook 알림",
						"높은 처리 한도",
						"우선 지원",
					],
				},
				enterprise: {
					name: "Enterprise",
					tagline: "SSO, 감사 로그 내보내기, 우선 지원이 필요한 회사를 위해.",
					features: [
						"Team의 모든 기능",
						"SAML / SSO 로그인",
						"감사 로그 내보내기 + 보관",
						"우선 지원 및 온보딩",
						"맞춤 연동 요청 가능",
					],
				},
			},
		},
		how: {
			title: "동작 방식",
			sub: "웹훅이 발생하면 탐지 에이전트가 실행되고, 몇 초 안에 점수와 라벨, 리뷰 코멘트가 달립니다.",
			steps: [
				"PR이나 이슈가 열리면 GitHub이 /api/webhook을 호출합니다.",
				"에이전트가 정적 휴리스틱(보일러플레이트, 이모지 헤더, 빈 본문, 프롬프트 인젝션)과 선택적 LLM 판정을 실행합니다.",
				"0에서 100점으로 채점하고 출처를 추출한 뒤 레포의 .github/SLOP_POLICY.yml을 적용합니다.",
				"임계값 이상이면 slop-quarantine 라벨과 이유를 설명하는 리뷰 코멘트를 답니다.",
				"관리자가 /slop approve, /slop reject, /slop false-positive로 답합니다. SlopGuard가 대신 결정하지 않습니다.",
			],
		},
		features: {
			title: "오픈소스 관리자를 위해",
			sub: "기여자를 존중하고, 절대 무리하게 닫지 않는 분류 도구.",
			items: [
				{
					ico: "$ gh app install",
					t: "원클릭 GitHub App",
					d: "레포나 조직에 클릭 한 번으로 설치. Action YAML도, CI 설정도, 연결할 시크릿도 없습니다.",
				},
				{
					ico: "/slop approve",
					t: "사람이 최종 결정",
					d: "격리 라벨과 리뷰 코멘트만 답니다. 관리자의 명시적 명령 없이는 아무것도 닫지 않습니다.",
				},
				{
					ico: "provenance:",
					t: "출처 태깅",
					d: "생성기 힌트, 프롬프트 지문, “As an AI model” 같은 누출 문구를 표시합니다.",
				},
				{
					ico: "SLOP_POLICY.yml",
					t: "정책 코드화",
					d: "임계값, 라벨, 허용 목록(allowlist), 코멘트 템플릿이 레포에 있고 다른 변경처럼 리뷰됩니다.",
				},
				{
					ico: "if no LLM key:",
					t: "LLM 없이도 동작",
					d: "휴리스틱 전용 모드는 API 키 없이 돌고, 골든셋에서 정밀도 100%를 냅니다.",
				},
				{
					ico: "db: null",
					t: "DB 없음",
					d: "상태는 GitHub 라벨과 이슈에 저장됩니다. 전체를 셀프호스팅할 수 있고 MIT 라이선스입니다.",
				},
			],
		},
		footer: { tagline: "기계가 찍어낸 노이즈에 파묻히지 않게" },
	},
};
