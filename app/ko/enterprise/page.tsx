import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Enterprise - SSO, 감사, 컴플라이언스",
	description: "Enterprise 플랜 콘솔: SAML SSO, 감사 로그, 통합, 지원 계약.",
};

const copy: EnterpriseConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise 워크스페이스",
	user: "blue-b",
	entitlement: "Enterprise 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/enterprise" },
		{ label: "큐", href: "/ko/org/queue", external: true },
		{ label: "레포", href: "/ko/org/repos", external: true },
		{ label: "캠페인", href: "/ko/campaigns", external: true },
		{ label: "알림", href: "/ko/alerts", external: true },
		{ label: "SSO", href: "/ko/enterprise/sso" },
		{ label: "감사", href: "/ko/enterprise/audit" },
		{ label: "통합", href: "/ko/enterprise/integrations" },
	],
	loading: "불러오는 중…",
	backToOrg: "조직 페이지로",
	contactSales: "세일즈 문의",
	accountHref: "/ko/account",
	orgHref: "/ko/org",
	heroEyebrow: "ENTERPRISE / 컴플라이언스",
	heroTitle: "보안팀이 기대하는 통제 아래에서 SlopGuard를 운영합니다.",
	heroBody:
		"SAML SSO, 전체 감사 추적, 커스텀 통합, 24/7 지원. 감사 로그는 모든 설정 변경/채널 발송/내보내기를 기록합니다.",
	heroCta: "감사 로그 열기",
	heroCtaHref: "/ko/enterprise/audit",
	ssoTitle: "SAML SSO",
	ssoSubtitle: "ID는 SlopGuard가 아니라 사내 IdP가 관리합니다.",
	auditTitle: "감사 로그",
	auditSubtitle: "모든 설정 변경, 채널 발송, 내보내기",
	auditViewAll: "전체 로그 열기",
	auditViewAllHref: "/ko/enterprise/audit",
	integrationsTitle: "통합",
	integrationsSubtitle: "이벤트를 티켓/페이징/관측 도구로 전달",
	integrationsViewAll: "통합 관리",
	integrationsViewAllHref: "/ko/enterprise/integrations",
	supportTitle: "지원",
	supportSubtitle: "P1 인시던트와 보안 리뷰 전용 채널.",
	supportSla: "P1 SLA",
	supportHours: "운영 시간",
	supportAccountMgr: "담당자",
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
