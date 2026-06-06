import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import PolicyFullView, {
	type PolicyFullViewCopy,
} from "@/app/components/PolicyFullView";

export const metadata: Metadata = {
	title: "SlopGuard: 정책 커버리지 - Team",
	description: "설치된 레포 중 SlopGuard 격리 정책으로 보호 중인 비율.",
};

const copy: PolicyFullViewCopy = {
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
	loading: "정책 상태 불러오는 중…",
	empty:
		"이 계정에 SlopGuard가 설치되어 있지 않습니다. 설치하면 정책 커버리지가 여기에 표시됩니다.",
	installCta: "GitHub에 설치",
	installHref: "/ko/setup",
	backHref: "/ko/org",
	backLabel: "개요",
	heroEyebrow: "ORG / POLICY",
	heroTitle: "팀 정책이 실제로 적용된 범위를 확인합니다.",
	heroBody:
		"개요는 전체 상태, 큐는 작업열, 레포는 범위, 정책은 적용률입니다. 커버리지는 격리/정상화 신호가 발생한 설치 레포 기준입니다.",
	policyFileTitle: "정책 파일",
	policyFileBody:
		"레포에 .github/SLOP_POLICY.yml을 추가해 임계값/라벨 이름/자동 머지 규칙을 커스터마이즈할 수 있습니다.",
	docsHref: "/ko/docs#policy",
};

export default function OrgPolicyPage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/org/policy" koHref="/ko/org/policy" />
			<PlanGate lang="ko" required="team">
				<PolicyFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
