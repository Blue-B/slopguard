import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import IntegrationsFullView, {
	type IntegrationsFullViewCopy,
} from "@/app/components/IntegrationsFullView";

export const metadata = {
	title: "SlopGuard: 통합 - Enterprise",
	description: "Jira, PagerDuty, Datadog, Slack, Linear, Opsgenie와 연결.",
};

const copy: IntegrationsFullViewCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise 워크스페이스",
	user: "blue-b",
	entitlement: "Enterprise 플랜",
	connectedLabel: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/enterprise" },
		{ label: "큐", href: "/ko/org/queue", external: true },
		{ label: "레포", href: "/ko/org/repos", external: true },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts", external: true },
		{ label: "SSO", href: "/ko/enterprise#sso" },
		{ label: "감사", href: "/ko/enterprise/audit", external: true },
		{ label: "통합", href: "/ko/enterprise/integrations" },
	],
	loading: "통합 불러오는 중…",
	empty: "사용 가능한 통합이 없습니다. SlopGuard 관리자에게 문의하세요.",
	backHref: "/ko/enterprise",
	backLabel: "개요",
	heroEyebrow: "INTEGRATIONS / ENTERPRISE",
	heroTitle: "이벤트를 티켓/페이징/관측 도구로 전달합니다.",
	heroBody:
		"팀이 이미 쓰는 시스템으로 SlopGuard 알림을 흘려보내세요. 연결/해제 액션은 감사 로그에 기록됩니다.",
	connect: "연결",
	disconnect: "해제",
	pending: "대기",
	available: "사용 가능",
	connected: "연결됨",
};

export default function IntegrationsPage() {
	return (
		<>
			<MarketingNav
				lang="ko"
				enHref="/enterprise/integrations"
				koHref="/ko/enterprise/integrations"
			/>
			<PlanGate lang="ko" required="enterprise">
				<IntegrationsFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
