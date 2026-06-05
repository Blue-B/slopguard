import MarketingNav from "@/app/components/MarketingNav";
import CampaignsClient from "@/app/components/CampaignsClient";
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
	user: "blue-b",
	entitlement: "Pro+ 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org#queue" },
		{ label: "레포", href: "/ko/org#repos" },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts", external: true },
		{ label: "정책", href: "/ko/org#policy" },
	],
	activeNav: "캠페인",
	eyebrow: "PRO / TEAM 기능",
	title: "동일 AI 프롬프트가 여러 레포에 배포되는 것을 잡아냅니다.",
	subtitle:
		"Pro/Team 플랜에는 이 캠페인 콘솔이 포함됩니다. 동일 프롬프트 지문이 자동으로 묶이고, 영향 레포에 점수 부스트가 적용되며, 어떤 커밋/작성자가 관련됐는지까지 드릴다운할 수 있습니다.",
	investigate: "조사",
	backToOrg: "조직 대시보드",
	accountHref: "/ko/account",
	orgHref: "/ko/org",
	heroEyebrow: "CAMPAIGNS · PRO+",
	heroTitle: "같은 프롬프트가 다섯 레포에 한꺼번에 배포되는 걸 잡습니다.",
	heroBody:
		"크로스 레포 지문 인식은 본문이 거의 동일한 커밋을 묶어줍니다. 각 클러스터는 위험 등급, 점수 부스트, 레포별 드릴다운을 갖춰 PR 하나하나 쫓는 대신 캠페인 단위로 격리할 수 있게 합니다.",
	heroCta: "클러스터 열기",
	heroCtaHref: "#clusters",
	metrics: [
		{ label: "활성 클러스터", value: "3", detail: "1건은 고신뢰", tone: "danger" },
		{ label: "영향 레포", value: "16", detail: "4명의 오너에 분포", tone: "warn" },
		{ label: "점수 부스트", value: "+72", detail: "최근 7일 누적", tone: "ok" },
		{ label: "관련 작성자", value: "11", detail: "7명은 3건 이상 적중", tone: "neutral" },
	],
	clustersTitle: "캠페인 클러스터",
	clustersSubtitle: "프롬프트 지문 기준 그룹화, 레포 간 영향도 순 정렬",
	clusters: [
		{
			fingerprint: "feat: implement new feature with comprehensive tests",
			repoCount: 7,
			hits: 23,
			firstSeen: "3일 전",
			risk: "high",
			repos: [
				{ repo: "blue-b/slopguard", commits: 6, authors: ["@blue-b"], score: 78 },
				{ repo: "blue-b/web", commits: 4, authors: ["@alex", "@rin"], score: 71 },
				{ repo: "blue-b/api", commits: 3, authors: ["@alex"], score: 64 },
			],
		},
		{
			fingerprint: "fix: resolve edge case in parser",
			repoCount: 4,
			hits: 11,
			firstSeen: "1주 전",
			risk: "medium",
			repos: [
				{ repo: "blue-b/api", commits: 4, authors: ["@alex"], score: 58 },
				{ repo: "blue-b/parser", commits: 2, authors: ["@rin"], score: 52 },
			],
		},
		{
			fingerprint: "docs: update onboarding guide",
			repoCount: 5,
			hits: 9,
			firstSeen: "2주 전",
			risk: "low",
			repos: [
				{ repo: "blue-b/docs", commits: 3, authors: ["@blue-b", "@rin"], score: 41 },
				{ repo: "blue-b/help-center", commits: 2, authors: ["@alex"], score: 38 },
			],
		},
	],
	scoreBoostTitle: "플랜별 점수 부스트",
	scoreBoostBody: "캠페인 지문에 매칭되는 커밋에 가산",
};

export default function CampaignsPageKo() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/campaigns" koHref="/ko/campaigns" />
			<PlanGate lang="ko" required="pro">
				<CampaignsConsole copy={copy} />
				<div
					style={{ maxWidth: 1200, margin: "0 auto 56px", padding: "0 20px" }}
				>
					<CampaignsClient
						clusters={copy.clusters.map((c) => ({
							id: c.fingerprint
								.toLowerCase()
								.replace(/[^a-z0-9]+/g, "_")
								.replace(/^_+|_+$/g, ""),
							fingerprint: c.fingerprint,
							risk: c.risk,
						}))}
						investigateLabel="조사"
						loadingLabel="불러오는 중…"
						closeLabel="닫기"
						emptyCommitsLabel="이 클러스터에 아직 커밋이 없습니다."
					/>
				</div>
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
