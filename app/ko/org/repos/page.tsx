import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import ReposFullView, {
	type ReposFullViewCopy,
} from "@/app/components/ReposFullView";

export const metadata = {
	title: "SlopGuard: 레포 - Team",
	description: "SlopGuard가 볼 수 있는 모든 레포 + 실시간 격리/정상 카운트.",
};

const copy: ReposFullViewCopy = {
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
	loading: "레포 불러오는 중…",
	empty:
		"이 계정에 SlopGuard가 설치되어 있지 않습니다. 설치하면 보호 중인 레포가 여기에 표시됩니다.",
	installCta: "GitHub에 설치",
	installHref: "/ko/setup",
	backHref: "/ko/org",
	backLabel: "개요",
	heroEyebrow: "REPOS / ORG",
	heroTitle: "SlopGuard가 보는 모든 레포, 실시간 활동 카운트.",
	heroBody:
		"격리/정상 확인 라벨이 GitHub 설치에서 레포별로 집계됩니다. 더 많은 레포에 설치하면 커버리지가 늘어납니다.",
	columns: {
		repo: "레포지터리",
		quarantined: "격리",
		cleared: "정상 확인",
	},
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
