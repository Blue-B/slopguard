import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import AuditFullView, {
	type AuditFullViewCopy,
} from "@/app/components/AuditFullView";

export const metadata = {
	title: "SlopGuard: 감사 로그 - Enterprise",
	description:
		"조직에 영향을 주는 모든 액션을 기록합니다. JSON/CSV 내보내기 가능.",
};

const copy: AuditFullViewCopy = {
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
		{ label: "SSO", href: "/ko/enterprise#sso" },
		{ label: "감사", href: "/ko/enterprise/audit" },
		{ label: "통합", href: "/ko/enterprise/integrations" },
	],
	loading: "감사 로그 불러오는 중…",
	empty: "감사 항목이 없습니다. 설정 변경과 내보내기 실행이 기록됩니다.",
	backHref: "/ko/enterprise",
	backLabel: "개요",
	heroEyebrow: "AUDIT / ENTERPRISE",
	heroTitle: "조직에 영향을 주는 모든 액션, 한 곳에서.",
	heroBody:
		"채널 추가/해제, 통합 연결/해제, 감사 내보내기가 모두 여기에 남습니다. JSON/CSV로 내보낼 수 있고, 내보내기 자체도 한 행으로 기록됩니다.",
	columns: {
		when: "시각",
		actor: "주체",
		action: "액션",
		target: "대상",
		source: "출처",
	},
	exportJson: "JSON 내보내기",
	exportCsv: "CSV 내보내기",
};

export default function AuditPage() {
	return (
		<>
			<MarketingNav
				lang="ko"
				enHref="/enterprise/audit"
				koHref="/ko/enterprise/audit"
			/>
			<PlanGate lang="ko" required="enterprise">
				<AuditFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
