import MarketingNav from "@/app/components/MarketingNav";
import CampaignsConsole, {
	type CampaignsConsoleCopy,
} from "@/app/components/CampaignsConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 캠페인 감지 - Pro",
	description:
		"Pro 플랜 레포 간 핑거프린트 클러스터링: 반복되는 AI 스타일 커밋 패턴을 묶어서 보여줍니다.",
};

const copy: CampaignsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Pro 워크스페이스",
	user: "blue-b",
	entitlement: "Pro 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org/queue" },
		{ label: "레포", href: "/ko/org/repos" },
		{ label: "캠페인", href: "/ko/campaigns" },
		{ label: "알림", href: "/ko/alerts" },
		{ label: "정책", href: "/ko/org/policy" },
	],
	loading: "불러오는 중…",
	emptyTitle: "캠페인 데이터가 아직 없습니다",
	emptyBody:
		"SlopGuard는 최소 1개 이상의 설치된 레포에 활동이 있어야 클러스터링을 시작합니다. 감지기가 항목을 라벨링하기 시작하면 관련 커밋 prefix가 여기에 클러스터로 표시됩니다.",
	emptyCta: "GitHub에 설치",
	emptyCtaHref: "/ko/setup",
	investigate: "상세 보기",
	backToOrg: "조직 페이지로",
	orgHref: "/ko/org",
	accountHref: "/ko/account",
	heroEyebrow: "CAMPAIGNS / PRO 플랜",
	heroTitle: "같은 프롬프트가 여러 레포에 퍼지는 것을 잡습니다.",
	heroBody:
		"SlopGuard가 커밋 제목 prefix로 PR을 묶고, 설치된 레포들 사이로 번지는 것을 표시합니다. 각 클러스터는 drill-down 페이지로 이어집니다.",
	heroCta: "알림 페이지 열기",
	heroCtaHref: "/ko/alerts",
	clustersTitle: "활성 클러스터",
	clustersSubtitle: "설치된 레포들 사이에서 커밋 제목 prefix별로 묶음",
	clustersEmpty:
		"클러스터가 없습니다 - prefix가 반복되기 시작하면 여기에 표시됩니다.",
	scoreBoostTitle: "점수 부스트 구간",
	scoreBoostBody: "플랜 등급이 레포 간 매칭 신뢰도에 미치는 영향",
};

export default function CampaignsPage() {
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
