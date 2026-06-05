import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 조직 대시보드 — Team",
	description:
		"Team 플랜용 조직 단위 격리 큐, 캠페인 클러스터, 정책 적용 현황 콘솔.",
};

const copy: OrgDashboardConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team 워크스페이스",
	user: "Blue-B",
	entitlement: "Team 권한 활성화",
	connected: "● GitHub 연결됨",
	nav: ["개요", "큐", "레포", "캠페인", "알림", "정책"],
	activeNav: "개요",
	eyebrow: "TEAM 기능",
	title: "보호된 모든 레포의 리뷰 활동을 한 화면에서 확인합니다.",
	subtitle:
		"Team 플랜에는 이 조직 단위 콘솔이 포함됩니다. 격리 큐를 처리하고, 반복되는 캠페인 패턴을 확인하고, 레포별 정책 적용 상태를 한 곳에서 봅니다.",
	account: "마이페이지",
	alerts: "알림 설정",
	accountHref: "/ko/account",
	alertsHref: "/ko/alerts",
	metrics: [
		{ label: "열린 리뷰", value: "18", detail: "6건은 담당자 조치 필요" },
		{ label: "보호 중인 레포", value: "17", detail: "이번 주 3개 추가" },
		{ label: "평균 slop 점수", value: "42", detail: "지난주 대비 −11" },
		{ label: "캠페인 클러스터", value: "3", detail: "1건은 높은 신뢰도" },
	],
	queueTitle: "격리 큐",
	queueSubtitle: "점수와 정책 영향도 기준으로 우선순위 정렬",
	updated: "방금 업데이트됨",
	columns: {
		item: "항목",
		repo: "레포",
		score: "점수",
		status: "상태",
		owner: "담당",
		age: "경과",
	},
	queue: [
		{
			item: "feat: GitHub OAuth callback hardening",
			repo: "blue-b/slopguard",
			score: 78,
			status: "격리됨",
			owner: "보안 리뷰",
			age: "12분",
		},
		{
			item: "docs: setup page copy refresh",
			repo: "blue-b/docs",
			score: 31,
			status: "정상 확인",
			owner: "@blue-b",
			age: "1시간",
		},
		{
			item: "chore: dependency wave",
			repo: "blue-b/api",
			score: 64,
			status: "관찰 중",
			owner: "Policy bot",
			age: "4시간",
		},
	],
	campaignTitle: "캠페인 레이더",
	campaignSubtitle: "반복되는 AI 스타일 패턴 기준으로 그룹화",
	campaigns: [
		{ name: "인증 표면 변경", repos: "7개 레포", risk: "높은 위험" },
		{ name: "문서 전용 변경 폭증", repos: "3개 레포", risk: "낮은 위험" },
		{ name: "Lockfile 일괄 갱신", repos: "5개 레포", risk: "중간 위험" },
	],
	policyTitle: "정책 적용 현황",
	policyBody:
		"14개 레포는 격리를 강제하고, 3개 레포는 관찰 모드입니다. 알림은 Team webhook 정책으로 라우팅됩니다.",
	coverageLabel: "보호 레포의 82%가 Team 정책을 강제 적용 중",
};

export default function OrgDashboardKo() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/org" koHref="/ko/org" />
			<PlanGate lang="ko" required="team">
				<OrgDashboardConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
