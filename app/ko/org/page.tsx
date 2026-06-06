import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 조직 대시보드 - Team",
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
		{ label: "큐", href: "/ko/org/queue" },
		{ label: "레포", href: "/ko/org/repos" },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts", external: true },
		{ label: "정책", href: "/ko/org/policy" },
	],
	loading: "불러오는 중…",
	emptyTitle: "이 계정에 SlopGuard가 아직 설치되지 않았습니다",
	emptyBody:
		"이 콘솔은 GitHub 활동의 실시간 뷰입니다. 레포에 SlopGuard를 설치하면 첫 항목이 감지/라벨링되는 즉시 대시보드가 채워집니다.",
	emptyCta: "GitHub에 SlopGuard 설치",
	emptyCtaHref: "/ko/setup",
	heroEyebrow: "ORG / TEAM 플랜",
	heroTitle: "격리, 캠페인, 정책 커버리지를 한 화면에서.",
	heroBody:
		"SlopGuard가 보호 중인 모든 레포의 실시간 뷰. 격리 항목 처리, 반복 패턴 그룹화, 정책 적용 확인을 한 콘솔에서.",
	heroCta: "캠페인 페이지 열기",
	heroCtaHref: "/ko/campaigns",
	queueTitle: "격리 큐",
	queueSubtitle: "보호된 모든 레포의 최근 5개 항목",
	queueViewAll: "전체 보기",
	queueViewAllHref: "/ko/org/queue",
	queueColumns: {
		item: "항목",
		repo: "레포",
		score: "점수",
		status: "상태",
		age: "경과",
	},
	reposTitle: "레포",
	reposSubtitle: "격리/정상 확인 활동이 있는 설치된 레포",
	reposViewAll: "전체 보기",
	reposViewAllHref: "/ko/org/repos",
	reposColumns: {
		repo: "레포지터리",
		quarantined: "격리",
		cleared: "정상 확인",
	},
	campaignTitle: "캠페인 레이더",
	campaignSubtitle: "커밋 prefix별 상위 클러스터",
	campaignsEmpty:
		"클러스터가 아직 없습니다 - 동일 prefix가 3건 이상 쌓이면 표시됩니다.",
	policyTitle: "정책 커버리지",
	policyBody: "현재 보호 중인 설치 레포 비율",
	policyViewAll: "정책 페이지",
	policyViewAllHref: "/ko/org/policy",
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
