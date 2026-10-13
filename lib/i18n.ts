export type Lang = "en" | "ko";
export const LANGS: Lang[] = ["en", "ko"];

export interface Messages {
	htmlLang: string;
	nav: { how: string; install: string };
	hero: {
		eyebrow: string;
		h1a: string;
		h1b: string; // highlighted word
		h1c: string; // suffix after the highlight (for KO word order)
		sub: string;
		ctaInstall: string;
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
		nav: { how: "How it works", install: "Install" },
		hero: {
			eyebrow: "maintainer burnout, contained",
			h1a: "Stop AI slop from drowning your ",
			h1b: "repo",
			h1c: "",
			sub: "AI-generated PRs and issues look real for the first 30 seconds, then waste your time. SlopGuard reads every one, flags the machine-made ones with the reasons, and lets you clear your queue in one pass. It never closes anything; you make the call.",
			ctaInstall: "Install the GitHub App",
			fine: "# source-available, never auto-closes, free for public repos",
			emblemAlt:
				"SlopGuard shield: a code-bracket emblem scanning pull requests",
		},
		stats: [
			{ n: "100%", l: "precision (golden set)" },
			{ n: "92%", l: "recall, heuristics-only" },
			{ n: "0", l: "auto-closed PRs, ever" },
			{ n: "Source", l: "self-host for your own use" },
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
					d: "State lives in GitHub labels and issues. Self-host the entire thing for your own use; the source is available under the Commons Clause.",
				},
			],
		},
		footer: {
			tagline: "built for maintainers drowning in machine-generated noise",
		},
	},

	ko: {
		htmlLang: "ko",
		nav: { how: "동작 방식", install: "설치" },
		hero: {
			eyebrow: "관리자 번아웃, 이제 그만",
			h1a: "AI 슬롭으로부터\n",
			h1b: "레포",
			h1c: "를 지키세요",
			sub: "AI가 만든 PR과 이슈는 처음 30초는 진짜처럼 보이고, 그 다음 시간을 잡아먹습니다. SlopGuard가 들어오는 걸 전부 읽어서 기계가 만든 것에 근거와 함께 표시하고, 한 번에 정리하게 해줍니다. 절대 자동으로 닫지 않고, 결정은 당신이 합니다.",
			ctaInstall: "GitHub App 설치하기",
			fine: "# 소스 공개, 자동으로 닫지 않음, 공개 레포 무료",
			emblemAlt: "SlopGuard 실드: PR을 스캔하는 코드 브래킷 엠블럼",
		},
		stats: [
			{ n: "100%", l: "정밀도 (골든셋)" },
			{ n: "92%", l: "재현율 (휴리스틱만)" },
			{ n: "0", l: "자동으로 닫은 PR 수" },
			{ n: "소스공개", l: "자기 용도 셀프호스팅" },
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
					d: "상태는 GitHub 라벨과 이슈에 저장됩니다. 전체를 자기 용도로 셀프호스팅할 수 있고, 소스는 Commons Clause로 공개되어 있습니다.",
				},
			],
		},
		footer: { tagline: "기계가 찍어낸 노이즈에 파묻히지 않게" },
	},
};
