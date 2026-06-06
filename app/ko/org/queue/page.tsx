import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import QueueFullView, {
	type QueueFullViewCopy,
} from "@/app/components/QueueFullView";

export const metadata: Metadata = {
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
	queueEmpty:
		"지금 처리할 격리 항목이 없습니다. 새 활동이 생기면 여기에 표시됩니다.",
	installCta: "GitHub에 설치",
	installHref: "/ko/setup",
	backHref: "/ko/org",
	backLabel: "개요",
	heroEyebrow: "ORG ACTION QUEUE",
	heroTitle: "캠페인 분석이 아니라, 지금 처리해야 할 팀 액션 큐.",
	heroBody:
		"/campaigns는 반복 패턴을 묶어 보는 Pro 레이더이고, 이 화면은 보호된 레포에서 실제로 열고 처리할 이슈/PR 작업열입니다.",
	openLabel: "대기 항목",
	statusLabels: {
		quarantined: "격리됨",
		cleared: "정상화",
		watching: "관찰 중",
	},
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
