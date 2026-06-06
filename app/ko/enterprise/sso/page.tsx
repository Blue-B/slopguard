import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import SsoFullView, {
	type SsoFullViewCopy,
} from "@/app/components/SsoFullView";

export const metadata = {
	title: "SlopGuard: SAML SSO - Enterprise",
	description:
		"SlopGuard Enterprise의 SAML SSO를 설정합니다. IdP, 메타데이터, 속성 매핑, 강제 적용.",
};

const copy: SsoFullViewCopy = {
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
	eyebrow: "ENTERPRISE / SAML SSO",
	title: "SAML SSO, ID는 사내 IdP가 관리합니다.",
	body: "IdP, 속성 매핑, 강제 적용 정책을 설정합니다. 아래 연결 정보는 IdP 관리자가 SAML 핸드셰이크를 완료할 때 필요한 값입니다.",
	providerLabel: "IdP (Identity provider)",
	idpMetadataLabel: "IdP 메타데이터 URL",
	idpMetadataPlaceholder:
		"https://your-idp.example.com/app/slopguard/sso/saml/metadata",
	emailAttributeLabel: "이메일 속성",
	loginAttributeLabel: "로그인 속성",
	enforcedLabel: "강제 적용",
	enforcedHint: "켜면 이 워크스페이스 멤버는 GitHub 로그인을 비활성화합니다.",
	activateCta: "SSO 활성화",
	deactivateCta: "비활성화",
	saveCta: "저장",
	savingCta: "저장 중…",
	savedCta: "저장됨",
	backToEnterprise: "Enterprise로",
	entityIdLabel: "SP 엔티티 ID",
	acsUrlLabel: "ACS URL (Assertion Consumer)",
	lastSyncLabel: "마지막 동기화",
	statusActive: "활성",
	statusPending: "대기",
	statusUnconfigured: "미설정",
	helpTitle: "설정 체크리스트",
	helpSteps: [
		{
			name: "1. Provider",
			value: "IdP에서 새 SAML 2.0 애플리케이션을 만듭니다.",
		},
		{
			name: "2. ACS URL",
			value: "IdP의 회신 URL에 위 ACS URL을 붙여넣습니다.",
		},
		{
			name: "3. Entity ID",
			value: "IdP의 Audience URI에 위 SP 엔티티 ID를 입력합니다.",
		},
		{
			name: "4. 속성",
			value: "이메일/로그인 클레임을 양식의 속성에 매핑합니다.",
		},
		{
			name: "5. 메타데이터",
			value: "IdP 메타데이터 URL을 붙여넣고 SSO 활성화를 누릅니다.",
		},
	],
	providerOptions: [
		{ value: "okta", label: "Okta" },
		{ value: "azure-ad", label: "Microsoft Entra ID" },
		{ value: "google", label: "Google Workspace" },
		{ value: "onelogin", label: "OneLogin" },
		{ value: "generic", label: "범용 SAML 2.0" },
	],
};

export default function SsoPage() {
	return (
		<>
			<MarketingNav
				lang="ko"
				enHref="/enterprise/sso"
				koHref="/ko/enterprise/sso"
			/>
			<PlanGate lang="ko" required="enterprise">
				<SsoFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
