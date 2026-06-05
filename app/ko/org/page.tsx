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
	user: "blue-b",
	entitlement: "Team 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org#queue" },
		{ label: "레포", href: "/ko/org#repos" },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts", external: true },
		{ label: "정책", href: "/ko/org#policy" },
	],
	activeNav: "개요",
	loading: "불러오는 중…",
	emptyTitle: "이 계정에 SlopGuard가 아직 설치되지 않았습니다",
	emptyBody:
		"이 콘솔은 GitHub 활동의 실시간 뷰입니다. 레포에 SlopGuard를 설치하면 첫 항목이 감지·라벨링되는 즉시 대시보드가 채워집니다.",
	emptyCta: "GitHub에 SlopGuard 설치",
	emptyCtaHref: "/ko/setup",
	metrics: [
		{ label: "열린 리뷰", value: "—", detail: "로딩", tone: "neutral" },
		{ label: "보호 중인 레포", value: "—", detail: "로딩", tone: "neutral" },
		{ label: "평균 slop 점수", value: "—", detail: "로딩", tone: "neutral" },
		{ label: "활성 클러스터", value: "—", detail: "로딩", tone: "neutral" },
	],
	queueTitle: "격리 큐",
	queueSubtitle: "보호된 모든 레포의 최근 항목",
	updated: "업데이트",
	columns: {
		item: "항목",
		repo: "레포",
		score: "점수",
		status: "상태",
		owner: "담당",
		age: "경과",
	},
	queue: [],
	reposTitle: "레포",
	reposSubtitle: "격리·정상 확인 활동이 있는 설치된 레포",
	reposEmpty: "활동이 있는 레포가 없습니다 — 레포에 SlopGuard를 설치하면 표시됩니다.",
	reposColumns: {
		repo: "레포지터리",
		quarantined: "격리",
		cleared: "정상 확인",
	},
	repos: [],
	campaignTitle: "캠페인 레이더",
	campaignSubtitle: "커밋 prefix 기반으로 묶인 레포 간 클러스터",
	campaigns: [],
	campaignsEmpty: "캠페인 클러스터가 아직 없습니다 — 유사 항목이 3건 이상 쌓이면 여기에 표시됩니다.",
	policyTitle: "정책 커버리지",
	policyBody:
		"커버리지는 설치된 레포 중 격리·정상 확인 활동이 있는 비율(즉, 실제로 보호 중인 레포)을 반영합니다.",
	coverageLabel: "Team 격리 정책 적용 중",
	coveragePercent: 0,
	coverageRepos: "0개 설치된 레포",
	coverageMissing: "더 많은 레포에 SlopGuard를 설치해 커버리지를 확장하세요.",
	installHref: "/ko/setup",
	alerts: "알림 설정",
	alertsHref: "/ko/alerts",
	heroEyebrow: "ORG · TEAM 플랜",
	heroTitle: "격리, 캠페인, 정책 커버리지를 한 화면에서.",
	heroBody:
		"SlopGuard가 보호 중인 모든 레포의 실시간 뷰. 격리 항목 처리, 반복 패턴 그룹화, 정책 적용 확인을 한 콘솔에서.",
	heroCta: "캠페인 페이지 열기",
	heroCtaHref: "/ko/campaigns",
};

export default function OrgDashboard() {
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
