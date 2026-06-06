import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import CampaignDetailConsole, {
	type CampaignDetailCopy,
} from "@/app/components/CampaignDetailConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: 캠페인 상세 - Pro",
	description:
		"크로스 레포 캠페인 클러스터의 레포 영향과 커밋 증거를 실제 데이터로 확인합니다.",
};

const copy: CampaignDetailCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Pro 워크스페이스",
	user: "blue-b",
	entitlement: "Pro 플랜",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org/queue" },
		{ label: "레포", href: "/ko/org/repos" },
		{ label: "캠페인", href: "/ko/campaigns" },
		{ label: "알림", href: "/ko/alerts" },
		{ label: "정책", href: "/ko/org/policy" },
	],
	backHref: "/ko/campaigns",
	backLabel: "캠페인",
	loading: "캠페인 증거 불러오는 중…",
	error: "캠페인을 불러오지 못했습니다",
	heading: "CAMPAIGN EVIDENCE",
	subhead:
		"캠페인 API에서 불러온 실제 드릴다운입니다. 레포 영향은 설치된 GitHub 데이터와 연결됩니다.",
	metrics: {
		repos: "레포",
		hits: "히트",
		authors: "작성자",
		firstSeen: "첫 감지",
	},
	commitsTitle: "커밋 증거",
	impactTitle: "레포 영향",
};

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<>
			<MarketingNav
				lang="ko"
				enHref={`/campaigns/${id}`}
				koHref={`/ko/campaigns/${id}`}
			/>
			<PlanGate lang="ko" required="pro">
				<CampaignDetailConsole id={id} copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
