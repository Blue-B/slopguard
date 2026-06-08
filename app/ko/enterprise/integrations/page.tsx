import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import IntegrationsFullView, {
	type IntegrationsFullViewCopy,
} from "@/app/components/IntegrationsFullView";

export const metadata: Metadata = {
	title: "SlopGuard: 통합 - Enterprise",
	description: "Jira, PagerDuty, Datadog, Slack, Linear, Opsgenie와 연결.",
};

const copy: IntegrationsFullViewCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "엔터프라이즈",
	connectedLabel: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/enterprise" },
		{ label: "SSO", href: "/ko/enterprise/sso" },
		{ label: "감사", href: "/ko/enterprise/audit" },
		{ label: "통합", href: "/ko/enterprise/integrations" },
	],
	loading: "통합 불러오는 중…",
	empty: "사용 가능한 통합이 없습니다. SlopGuard 관리자에게 문의하세요.",
	heroEyebrow: "INTEGRATIONS / ENTERPRISE",
	heroTitle: "이벤트를 티켓/페이징/관측 도구로 전달합니다.",
	heroBody:
		"원하는 제공자를 요청하면 SlopGuard 팀이 Enterprise 플랜에 맞게 팀이 쓰는 시스템과 연동해 드립니다. 모든 요청은 감사 로그에 기록됩니다.",
	sectionTitle: "통합",
	sectionSub: "통합을 요청하면 팀이 연동해 드립니다. 각 요청은 감사 로그에 기록됩니다.",
	connect: "요청하기",
	disconnect: "요청 취소",
	pending: "요청됨",
	available: "요청 가능",
	connected: "활성",
};

export default function IntegrationsPage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/enterprise/integrations" koHref="/ko/enterprise/integrations" />
			<PlanGate lang="ko" required="enterprise">
				<IntegrationsFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
