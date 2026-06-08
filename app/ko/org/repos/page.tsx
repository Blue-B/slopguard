import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import ReposFullView, {
	type ReposFullViewCopy,
} from "@/app/components/ReposFullView";

export const metadata: Metadata = {
	title: "SlopGuard: 레포 - Team",
	description: "SlopGuard가 볼 수 있는 모든 레포 + 실시간 격리/정상 카운트.",
};

const copy: ReposFullViewCopy = {
	kicker: "SlopGuard Team",
	workspace: "조직 현황",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org/queue" },
		{ label: "레포", href: "/ko/org/repos" },
		{ label: "정책", href: "/ko/org/policy" },
	],
	loading: "레포 불러오는 중…",
	empty:
		"이 계정에 SlopGuard가 설치되어 있지 않습니다. 설치하면 보호 중인 레포가 여기에 표시됩니다.",
	installCta: "GitHub에 설치",
	installHref: "/ko/setup",
	heroEyebrow: "ORG / REPOS",
	heroTitle: "팀 운영 범위에 포함된 레포만 한 화면에서 봅니다.",
	heroBody:
		"개요는 요약, 큐는 처리할 항목, 레포는 보호 범위 확인입니다. 격리/정상화 카운트는 GitHub 설치 데이터에서 레포별로 집계됩니다.",
	labels: {
		installed: "설치 레포",
		coverage: "보호 커버리지",
		quarantined: "격리",
		cleared: "정상화",
		coverageNote: "이 화면은 팀 운영 범위입니다. 어떤 레포가 보호 중이고 어디에서 격리/정상화가 발생했는지 확인합니다.",
	},
	columns: { repo: "레포지터리", quarantined: "격리", cleared: "정상 확인" },
};

export default function OrgReposPage() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/org/repos" koHref="/ko/org/repos" />
			<PlanGate lang="ko" required="team">
				<ReposFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
