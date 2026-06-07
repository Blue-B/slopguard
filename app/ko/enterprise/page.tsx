import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Enterprise - SSO, 감사, 컴플라이언스",
	description: "Enterprise 플랜 콘솔: SAML SSO, 감사 로그, 통합, 지원 계약.",
};

const nav = [
	{ label: "개요", href: "/ko/enterprise" },
	{ label: "SSO", href: "/ko/enterprise/sso" },
	{ label: "감사", href: "/ko/enterprise/audit" },
	{ label: "통합", href: "/ko/enterprise/integrations" },
];

const copy: EnterpriseConsoleCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "거버넌스 콘솔",
	connected: "GitHub 연결됨",
	nav,
	loading: "불러오는 중…",
	heroEyebrow: "ENTERPRISE / 컴플라이언스",
	heroTitle: "보안팀이 기대하는 통제 아래에서 SlopGuard를 운영합니다.",
	heroBody:
		"SAML SSO, 전체 감사 추적, 커스텀 통합, 24/7 지원. 감사 로그는 모든 설정 변경/채널 발송/내보내기를 기록합니다.",
	heroCta: "감사 로그 열기",
	heroCtaHref: "/ko/enterprise/audit",
	metricLabels: { audit: "감사 항목", integrations: "통합", ssoProvider: "SSO 제공자", ssoStatus: "SSO 상태" },
	ssoTitle: "SAML SSO",
	ssoSubtitle: "ID는 SlopGuard가 아니라 사내 IdP가 관리합니다.",
	ssoLabels: { provider: "제공자", status: "상태", lastSync: "최근 동기화" },
	supportTitle: "지원",
	supportSubtitle: "P1 인시던트와 보안 리뷰 전용 채널.",
	supportSla: "P1 SLA",
	supportHours: "운영 시간",
	supportAccountMgr: "담당자",
	auditTitle: "감사 로그",
	auditSubtitle: "모든 설정 변경, 채널 발송, 내보내기",
	auditViewAll: "전체 로그 열기",
	auditViewAllHref: "/ko/enterprise/audit",
	integrationsTitle: "통합",
	integrationsSubtitle: "이벤트를 티켓/페이징/관측 도구로 전달",
	integrationsViewAll: "통합 관리",
	integrationsViewAllHref: "/ko/enterprise/integrations",
};

export default function EnterprisePage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/enterprise" koHref="/ko/enterprise" />
			<PlanGate lang="ko" required="enterprise">
				<EnterpriseConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
