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
	kicker: "SlopGuard Pro",
	workspace: "캠페인 조사",
	connected: "GitHub 연결됨",
	nav: [],
	loading: "캠페인 증거 불러오는 중…",
	error: "캠페인을 불러오지 못했습니다",
	heading: "CAMPAIGN EVIDENCE",
	subhead:
		"/org가 팀 운영 현황이라면, 여기는 여러 레포에 반복된 하나의 패턴을 추적하는 캠페인 조사 화면입니다.",
	metrics: { repos: "레포", hits: "히트", authors: "작성자", firstSeen: "첫 감지" },
	commitsTitle: "커밋 증거",
	impactTitle: "레포 영향",
	commitMeta: "이 fingerprint에 연결된 커밋 {count}개",
	emptyCommits: "아직 연결된 커밋 증거가 없습니다.",
	impactSubhead: "캠페인 API에서 집계한 레포별 격리/정상화 영향입니다.",
	authorsLabel: "작성자",
};

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return (
		<>
			<MarketingNav lang="ko" enHref={`/campaigns/${id}`} koHref={`/ko/campaigns/${id}`} />
			<PlanGate lang="ko" required="pro">
				<CampaignDetailConsole id={id} copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
