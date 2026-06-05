import MarketingNav from "@/app/components/MarketingNav";
import CampaignsConsole, {
	type CampaignsConsoleCopy,
} from "@/app/components/CampaignsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 크로스 레포 캠페인 — Pro & Team",
	description:
		"Pro/Team 콘솔: 동일 AI 프롬프트 지문을 레포 간 추적하고, 점수 부스트로 격리 우선순위를 자동 조정합니다.",
};

const copy: CampaignsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Pro · Team 워크스페이스",
	user: "Blue-B",
	entitlement: "Pro+ 권한 활성화",
	connected: "● GitHub 연결됨",
	nav: ["개요", "큐", "레포", "캠페인", "알림", "정책"],
	activeNav: "캠페인",
	eyebrow: "PRO / TEAM 기능",
	title: "동일 AI 프롬프트가 여러 레포에 배포되는 것을 잡아냅니다.",
	subtitle:
		"Pro/Team 플랜에는 이 캠페인 콘솔이 포함됩니다. 동일 프롬프트 지문이 자동으로 묶이고, 영향 레포에 점수 부스트가 적용되며, 어떤 커밋/작성자가 관련됐는지까지 드릴다운할 수 있습니다.",
	backToOrg: "조직 대시보드",
	primaryAction: "알림 설정",
	accountHref: "/ko/account",
	orgHref: "/ko/org",
	alertsHref: "/ko/alerts",
	metrics: [
		{ label: "활성 클러스터", value: "3", detail: "1개는 높은 신뢰도" },
		{ label: "영향 레포", value: "16", detail: "4명의 오너에 분포" },
		{ label: "점수 부스트", value: "+72", detail: "최근 7일 누적" },
		{ label: "관련 작성자", value: "11", detail: "7명은 3건 이상 적중" },
	],
	clustersTitle: "캠페인 클러스터",
	clustersSubtitle: "프롬프트 지문 기준 그룹화, 레포 간 영향도 순 정렬",
	riskHigh: "높음",
	riskMedium: "중간",
	riskLow: "낮음",
	repoHeader: "레포",
	commitsHeader: "커밋",
	authorsHeader: "작성자",
	scoreHeader: "점수",
	investigate: "조사",
	clusters: [
		{
			campaign: {
				fingerprint: "feat: implement new feature with comprehensive tests",
				repos: 7,
				hits: 23,
				authors: 4,
				first: "3일 전",
				risk: "High",
				boost: 25,
			},
			repos: [
				{
					repo: "blue-b/slopguard",
					commits: 6,
					authors: ["@blue-b"],
					score: 78,
				},
				{
					repo: "blue-b/web",
					commits: 4,
					authors: ["@alex", "@rin"],
					score: 71,
				},
				{ repo: "blue-b/api", commits: 3, authors: ["@alex"], score: 64 },
			],
		},
		{
			campaign: {
				fingerprint: "fix: resolve edge case in parser",
				repos: 4,
				hits: 11,
				authors: 2,
				first: "1주 전",
				risk: "Medium",
				boost: 15,
			},
			repos: [
				{ repo: "blue-b/api", commits: 4, authors: ["@alex"], score: 58 },
				{ repo: "blue-b/parser", commits: 2, authors: ["@rin"], score: 52 },
			],
		},
		{
			campaign: {
				fingerprint: "docs: update onboarding guide",
				repos: 5,
				hits: 9,
				authors: 3,
				first: "2주 전",
				risk: "Low",
				boost: 8,
			},
			repos: [
				{
					repo: "blue-b/docs",
					commits: 3,
					authors: ["@blue-b", "@rin"],
					score: 41,
				},
				{
					repo: "blue-b/help-center",
					commits: 2,
					authors: ["@alex"],
					score: 38,
				},
			],
		},
	],
	note: "점수 부스트는 캠페인 지문에 매칭되는 모든 커밋의 슬롭 점수에 가산됩니다. 부스트가 높을수록 격리 우선순위가 자동으로 올라갑니다.",
};

export default function CampaignsPageKo() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/campaigns" koHref="/ko/campaigns" />
			<PlanGate lang="ko" required="pro">
				<CampaignsConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
