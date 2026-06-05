import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 엔터프라이즈 포털 — SSO, 감사, 자체 호스팅",
	description:
		"엔터프라이즈 콘솔: SAML/SSO 설정, 감사 로그, 지원 계약, 커스텀 통합을 한 곳에서.",
};

const copy: EnterpriseConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise 워크스페이스",
	user: "Blue-B",
	entitlement: "Enterprise 권한 활성화",
	connected: "● SSO 연결됨",
	nav: ["개요", "큐", "레포", "캠페인", "알림", "SSO", "감사", "지원"],
	activeNav: "개요",
	eyebrow: "ENTERPRISE 기능",
	title: "조직 전체에 SlopGuard를 통제된 형태로 운영합니다.",
	subtitle:
		"Enterprise 플랜에는 이 포털이 포함됩니다. SAML/SSO 설정, 감사 로그와 내보내기, 커스텀 통합, 그리고 1시간 P1 SLA를 가진 전담 지원 담당자까지 한 곳에서 관리합니다.",
	backToOrg: "조직 대시보드",
	contactSales: "문의하기",
	accountHref: "/ko/account",
	orgHref: "/ko/org",
	alertsHref: "/ko/alerts",
	campaignsHref: "/ko/campaigns",
	metrics: [
		{ label: "SSO", value: "활성", detail: "Okta · SAML 2.0" },
		{ label: "감사 보존", value: "365일", detail: "플랜별 조정 가능" },
		{ label: "자체 호스팅", value: "켜짐", detail: "귀사 팀이 직접 운영" },
		{ label: "지원 SLA", value: "1시간 P1", detail: "24×7, 전담 담당" },
	],
	ssoTitle: "SSO / SAML",
	ssoSubtitle: "IdP 및 세션 정책",
	ssoStatus: "상태",
	ssoProvider: "공급자",
	ssoLastSync: "최근 SCIM 동기화",
	ssoConfigure: "설정",
	auditTitle: "감사 로그",
	auditSubtitle: "SlopGuard의 모든 권한 작업 기록, 내보내기 가능",
	auditColumns: {
		when: "시점",
		actor: "주체",
		action: "작업",
		target: "대상",
		source: "출처",
	},
	audit: [
		{
			when: "2026-06-04 14:22",
			actor: "alice@acme.com",
			action: "격리 해제",
			target: "acme/web#128",
			source: "SSO",
		},
		{
			when: "2026-06-04 11:08",
			actor: "ops-bot",
			action: "웹훅 시크릿 교체",
			target: "조직 설정",
			source: "API",
		},
		{
			when: "2026-06-03 18:44",
			actor: "bob@acme.com",
			action: "레포 추가",
			target: "acme/api",
			source: "Admin",
		},
		{
			when: "2026-06-03 09:11",
			actor: "ci-bot",
			action: "알림 채널 설정",
			target: "Slack #security",
			source: "API",
		},
		{
			when: "2026-06-02 16:02",
			actor: "carol@acme.com",
			action: "감사 로그 내보내기",
			target: "2026년 2분기",
			source: "SSO",
		},
	],
	exportAudit: "JSON 내보내기",
	integrationsTitle: "커스텀 통합",
	integrationsSubtitle: "SlopGuard를 내부 시스템과 연결",
	connect: "연결",
	integrations: [
		{
			name: "Jira",
			status: "connected",
			scope: "격리된 PR을 ENG 프로젝트의 티켓으로 생성",
		},
		{
			name: "PagerDuty",
			status: "pending",
			scope: "높은 위험 캠페인 탐지 시 온콜 호출",
		},
		{
			name: "Datadog",
			status: "available",
			scope: "감사 이벤트를 Datadog 로그로 전송",
		},
		{
			name: "내부 티켓 시스템",
			status: "available",
			scope: "커스텀 페이로드 템플릿이 있는 일반 웹훅",
		},
	],
	supportTitle: "지원 계약",
	supportSubtitle: "전담 담당자, SLA, 에스컬레이션 경로",
	supportSla: "SLA",
	supportHours: "운영 시간",
	supportAccountMgr: "전담 매니저",
	note: "감사 보존 기간과 자체 호스팅 지원 범위는 계약 단위로 지정됩니다. 조정은 전담 매니저에게 문의하세요.",
};

export default function EnterprisePageKo() {
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
