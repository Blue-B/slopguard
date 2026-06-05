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
	eyebrow: "TEAM 기능",
	title: "보호된 모든 레포의 리뷰 활동을 한 화면에서 확인합니다.",
	subtitle:
		"Team 플랜에는 이 조직 단위 콘솔이 포함됩니다. 격리 큐를 처리하고, 반복되는 캠페인 패턴을 확인하고, 레포별 정책 적용 상태를 한 곳에서 봅니다.",
	account: "마이페이지",
	alerts: "알림 설정",
	accountHref: "/ko/account",
	alertsHref: "/ko/alerts",
	campaignsHref: "/ko/campaigns",
	policyHref: "/ko/docs#policy",
	heroEyebrow: "ORG · TEAM 플랜",
	heroTitle: "격리, 캠페인, 정책 커버리지를 한 화면에서.",
	heroBody:
		"레포를 가로질러 반복되는 AI 스타일 패턴을 묶고, 영향도가 큰 담당자를 정확히 짚고, 메인테이너가 스팸을 받기 전에 알림을 적절한 채널로 라우팅합니다.",
	heroCta: "캠페인 레이더 보기",
	heroCtaHref: "/ko/campaigns",
	metrics: [
		{ label: "열린 리뷰", value: "18", detail: "6건은 담당자 조치 필요", tone: "warn" },
		{ label: "보호 중인 레포", value: "17", detail: "이번 주 +3", tone: "ok" },
		{ label: "평균 slop 점수", value: "42", detail: "지난주 대비 −11", tone: "ok" },
		{ label: "활성 클러스터", value: "3", detail: "1건은 고신뢰", tone: "danger" },
	],
	queueTitle: "격리 큐",
	queueSubtitle: "점수 → 레포 영향도 순으로 정렬",
	updated: "12초 전 업데이트",
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
			owner: "@blue-b",
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
			owner: "policy bot",
			age: "4시간",
		},
		{
			item: "test: extend lockfile_refresh fixtures",
			repo: "blue-b/api",
			score: 56,
			status: "관찰 중",
			owner: "@alex",
			age: "7시간",
		},
	],
	campaignTitle: "캠페인 레이더",
	campaignSubtitle: "반복 AI 스타일 패턴으로 묶인 크로스 레포 클러스터",
	campaigns: [
		{
			name: "auth_surface",
			fingerprint: "feat: GitHub OAuth callback hardening",
			repos: 7,
			risk: "high",
			commits: 23,
			authors: 4,
			delta: 85,
		},
		{
			name: "lockfile_refresh",
			fingerprint: "chore: dependency wave",
			repos: 5,
			risk: "medium",
			commits: 11,
			authors: 3,
			delta: 55,
		},
		{
			name: "docs_only",
			fingerprint: "docs: setup page copy refresh",
			repos: 3,
			risk: "low",
			commits: 9,
			authors: 2,
			delta: 25,
		},
	],
	policyTitle: "정책 적용 현황",
	policyBody:
		"대부분의 보호 레포에서 격리 정책이 강제됩니다. 적용되지 않은 소수는 글로벌 기본값으로 폴백합니다.",
	coverageLabel: "Team 격리 정책 강제 중",
	coveragePercent: 82,
	coverageRepos: "17개 보호 레포",
	coverageMissing:
		"3개 레포는 관찰 모드 — .github/SLOP_POLICY.yml을 추가해 강제하세요.",
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
