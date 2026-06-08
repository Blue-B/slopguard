import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import OrgDashboardConsole, {
	type OrgDashboardConsoleCopy,
} from "@/app/components/OrgDashboardConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: 조직 현황 - Team",
	description:
		"Team 플랜용 조직 단위 격리 큐, 패턴 클러스터, 정책 적용 현황 콘솔.",
};

const copy: OrgDashboardConsoleCopy = {
	kicker: "SlopGuard Team",
	workspace: "조직 현황",
	connected: "GitHub 연결됨",
	nav: [
		{ label: "개요", href: "/ko/org" },
		{ label: "큐", href: "/ko/org/queue" },
		{ label: "레포", href: "/ko/org/repos" },
		{ label: "정책", href: "/ko/org/policy" },
	],
	loading: "불러오는 중…",
	emptyTitle: "이 계정에 SlopGuard가 아직 설치되지 않았습니다",
	emptyBody:
		"이 콘솔은 GitHub 활동의 실시간 뷰입니다. 레포에 SlopGuard를 설치하면 첫 항목이 감지/라벨링되는 즉시 대시보드가 채워집니다.",
	emptyCta: "GitHub에 SlopGuard 설치",
	emptyCtaHref: "/ko/setup",
	heroEyebrow: "ORG / TEAM 플랜",
	heroTitle: "격리, 패턴, 정책 커버리지를 한 화면에서.",
	heroBody:
		"SlopGuard가 보호 중인 모든 레포의 실시간 뷰. 격리 항목 처리, 반복 패턴 그룹화, 정책 적용 확인을 한 콘솔에서.",
	heroCta: "패턴 추적 열기",
	heroCtaHref: "/ko/campaigns",
	queueTitle: "격리 큐",
	queueSubtitle: "보호된 모든 레포의 최근 5개 항목",
	queueViewAll: "전체 보기",
	queueViewAllHref: "/ko/org/queue",
	queueColumns: { item: "항목", repo: "레포", score: "점수", status: "상태", age: "경과" },
	reposTitle: "레포",
	reposSubtitle: "격리/정상 확인 활동이 있는 설치된 레포",
	reposViewAll: "전체 보기",
	reposViewAllHref: "/ko/org/repos",
	campaignTitle: "패턴 추적",
	campaignSubtitle: "커밋 prefix별 상위 클러스터",
	campaignsEmpty:
		"클러스터가 아직 없습니다 - 동일 prefix가 3건 이상 쌓이면 표시됩니다.",
	campaignHref: "/ko/campaigns",
	campaignCta: "콘솔 열기",
	alertsTitle: "알림",
	alertsBody: "격리 시 Slack/Discord/웹훅으로 발송. 레포+패턴별 라우팅 규칙을 설정합니다.",
	alertsHref: "/ko/alerts",
	alertsCta: "설정 열기",
	policyTitle: "정책 커버리지",
	policyBody: "현재 보호 중인 설치 레포 비율",
	policyViewAll: "정책 페이지",
	policyViewAllHref: "/ko/org/policy",
	metricLabels: { open: "열린 검토", repos: "보호 레포", score: "평균 점수", policy: "정책" },
	statusLabels: { quarantined: "격리됨", cleared: "정상화", watching: "관찰 중" },
	emptyQueue: "최근 30일 안에 처리할 항목이 없습니다.",
	emptyRepos: "아직 활동이 있는 레포가 없습니다.",
	policyReadout: "설치 레포 중 정책 신호가 동작 중인 비율",
};

export default function OrgDashboard() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/org" koHref="/ko/org" />
			<PlanGate lang="ko" required="team">
				<OrgDashboardConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="ko" />
		</>
	);
}
