import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import SignInGate from "@/app/components/SignInGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Enterprise - SSO, 감사, 컴플라이언스",
	description: "Enterprise 콘솔: SAML SSO, 감사 로그, 통합, 지원 계약.",
};

const nav = [
	{ label: "개요", href: "/ko/enterprise" },
	{ label: "SSO", href: "/ko/enterprise/sso" },
	{ label: "감사", href: "/ko/enterprise/audit" },
	{ label: "통합", href: "/ko/enterprise/integrations" },
];

const copy: EnterpriseConsoleCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "엔터프라이즈",
	connected: "GitHub 연결됨",
	nav,
	loading: "불러오는 중…",
	heroEyebrow: "ENTERPRISE / 컴플라이언스",
	heroTitle: "보안팀이 기대하는 통제 아래에서 SlopGuard를 운영합니다.",
	heroBody:
		"SAML SSO, 전체 감사 추적, 통합 요청 관리. 감사 로그는 모든 설정 변경, 채널 발송, 내보내기를 실시간으로 기록합니다.",
	heroCta: "감사 로그 열기",
	heroCtaHref: "/ko/enterprise/audit",
	metricLabels: { audit: "감사 항목", integrations: "통합", ssoProvider: "SSO 제공자", ssoStatus: "SSO 상태" },
	ssoTitle: "SAML SSO",
	ssoSubtitle: "ID는 SlopGuard가 아니라 사내 IdP가 관리합니다.",
	ssoLabels: { provider: "제공자", status: "상태", lastSync: "최근 동기화" },
	auditEmpty: "아직 감사 항목이 없습니다.",
	integrationsEmpty: "연결되거나 요청된 통합이 없습니다.",
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
			<SignInGate lang="ko">
				<EnterpriseConsole copy={copy} />
			</SignInGate>
			<SiteFooter lang="ko" />
		</>
	);
}
