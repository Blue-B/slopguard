import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import QueueFullView, {
	type QueueFullViewCopy,
} from "@/app/components/QueueFullView";

export const metadata = {
	title: "SlopGuard: 격리 큐 - Team",
	description: "보호된 레포의 격리/정상 확인 항목 전체 (최신순).",
};

const copy: QueueFullViewCopy = {
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
	loading: "큐 불러오는 중…",
	empty:
		"이 계정에 SlopGuard가 설치되어 있지 않습니다. 설치하면 격리 활동이 여기에 표시됩니다.",
	installCta: "GitHub에 설치",
	installHref: "/ko/setup",
	backHref: "/ko/org",
	backLabel: "개요",
	heroEyebrow: "QUEUE / ORG",
	heroTitle: "보호된 모든 레포의 격리/정상 확인 항목 전체.",
	heroBody:
		"최신순. 행을 클릭하면 GitHub의 이슈/PR이 열립니다. 항목은 SlopGuard가 이슈/PR에 적용한 라벨에서 파생됩니다.",
	columns: {
		item: "항목",
		repo: "레포",
		score: "점수",
		status: "상태",
		owner: "담당",
		age: "경과",
	},
};

export default function OrgQueuePage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/org/queue" koHref="/ko/org/queue" />
			<PlanGate lang="ko" required="team">
				<QueueFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
