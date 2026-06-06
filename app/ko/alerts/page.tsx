import MarketingNav from "@/app/components/MarketingNav";
import AlertsConsole, {
	type AlertsConsoleCopy,
} from "@/app/components/AlertsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 알림 설정 - Team",
	description:
		"Team 플랜 알림 콘솔: Slack/Discord/웹훅 채널 추가, 레포/패턴별 라우팅, 발송 로그 실시간 확인.",
};

const copy: AlertsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team 워크스페이스",
	user: "blue-b",
	entitlement: "Team 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org/queue", external: true },
		{ label: "레포", href: "/ko/org/repos", external: true },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts" },
		{ label: "정책", href: "/ko/org/policy", external: true },
	],
	loading: "불러오는 중…",
	backToOrg: "조직 페이지로",
	orgHref: "/ko/org",
	campaignsHref: "/ko/campaigns",
	accountHref: "/ko/account",
	heroEyebrow: "ALERTS / TEAM 플랜",
	heroTitle: "대상별 채널, 실제로 라우팅되는 규칙.",
	heroBody:
		"Slack/Discord/커스텀 웹훅을 추가하고, 레포+패턴을 채널에 묶고 slop 점수 임계값을 설정합니다. 아래 로그는 실제 발송 내역입니다.",
	heroCta: "캠페인 페이지 열기",
	heroCtaHref: "/ko/campaigns",
	channelsTitle: "활성 채널",
	channelsSubtitle:
		"대상은 owner 단위로 저장됩니다. 채널을 추가한 다음 그 채널을 가리키는 라우팅 규칙을 만드세요.",
	channelsEmpty:
		"채널이 없습니다. 아래에서 Slack/Discord/웹훅 채널을 추가하세요.",
	addChannelTitle: "채널 추가",
	addChannelBody: "",
	addChannelKindLabel: "채널 종류",
	addChannelLabelLabel: "라벨",
	addChannelTargetLabel: "대상 URL",
	addChannelCta: "채널 추가",
	addChannelBusy: "추가 중…",
	removeChannel: "해제",
	channelsRemovedFlash: "채널이 해제됨",
	rulesTitle: "라우팅 규칙",
	rulesSubtitle: "레포+패턴 매칭, 점수 ≥ 임계값일 때만 발송.",
	rulesEmpty:
		"라우팅 규칙이 없습니다. 먼저 채널을 추가한 뒤, 그 채널을 가리키는 규칙을 만드세요.",
	rulesColumns: {
		repo: "레포",
		pattern: "패턴",
		channel: "채널",
		threshold: "임계값",
	},
	addRuleTitle: "라우팅 규칙 추가",
	addRuleBody: "",
	addRuleRepoLabel: "레포지터리",
	addRulePatternLabel: "패턴",
	addRuleChannelLabel: "채널",
	addRuleThresholdLabel: "점수 ≥",
	addRuleCta: "규칙 추가",
	removeRule: "삭제",
	logTitle: "발송 로그",
	logSubtitle: "최근 발송, 실패, 재시도 내역.",
	logEmpty:
		"발송 내역이 없습니다. 채널에서 테스트 발송을 실행하면 여기에 표시됩니다.",
	logColumns: {
		when: "시각",
		item: "항목",
		score: "점수",
		dest: "대상",
		status: "상태",
		latency: "지연",
	},
};

export default function AlertsPage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/alerts" koHref="/ko/alerts" />
			<PlanGate lang="ko" required="team">
				<AlertsConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
