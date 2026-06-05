import MarketingNav from "@/app/components/MarketingNav";
import AlertsConsole, { type AlertsConsoleCopy } from "@/app/components/AlertsConsole";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: 알림 & 웹훅 — Team",
	description:
		"Team 플랜 전용 콘솔: Slack, Discord, 웹훅 채널과 라우팅 규칙, 발송 로그를 한 곳에서 관리합니다.",
};

const copy: AlertsConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Team 워크스페이스",
	user: "Blue-B",
	entitlement: "Team 권한 활성화",
	connected: "● GitHub 연결됨",
	nav: ["개요", "큐", "레포", "캠페인", "알림", "정책"],
	activeNav: "알림",
	eyebrow: "TEAM 기능",
	title: "격리 알림을 정확한 담당자에게 전달합니다.",
	subtitle:
		"Team 플랜에는 이 알림 콘솔이 포함됩니다. Slack/Discord/웹훅 채널을 관리하고, 어떤 레포와 패턴이 어느 점수 임계값에서 어떤 채널로 갈지 정하고, 실제 발송 결과를 확인합니다.",
	backToOrg: "조직 대시보드",
	testSend: "테스트 알림 발송",
	accountHref: "/ko/account",
	campaignsHref: "/ko/campaigns",
	orgHref: "/ko/org",
	metrics: [
		{ label: "활성 채널", value: "3", detail: "Slack · Discord · 웹훅" },
		{ label: "라우팅 규칙", value: "5", detail: "점수 2개 · 패턴 3개" },
		{ label: "발송 알림 (30일)", value: "47", detail: "전송 성공률 96%" },
		{ label: "평균 지연", value: "1.4초", detail: "p95 3.1초" },
	],
	channelsTitle: "채널",
	channelsSubtitle: "격리 알림이 전달되는 곳",
	addChannel: "채널 추가",
	channels: [
		{
			kind: "slack",
			label: "보안 알림",
			target: "hooks.slack.com/services/.../security",
			status: "active",
			lastSent: "12분 전",
		},
		{
			kind: "discord",
			label: "엔지니어링",
			target: "discord.com/api/webhooks/.../eng",
			status: "active",
			lastSent: "1시간 전",
		},
		{
			kind: "webhook",
			label: "커스텀 릴레이",
			target: "ops.internal/slopguard/inbound",
			status: "failed",
			lastSent: "4시간 전 · 재시도 1회",
		},
	],
	rulesTitle: "라우팅 규칙",
	rulesSubtitle: "패턴이 어떤 채널로 갈지 결정",
	addRule: "규칙 추가",
	columns: {
		repo: "레포",
		pattern: "패턴",
		channel: "채널",
		threshold: "점수 ≥",
	},
	rules: [
		{
			repo: "blue-b/slopguard",
			pattern: "auth_surface",
			channel: "보안 알림",
			threshold: 60,
		},
		{
			repo: "blue-b/api",
			pattern: "lockfile_refresh",
			channel: "엔지니어링",
			threshold: 75,
		},
		{
			repo: "blue-b/docs",
			pattern: "docs_only",
			channel: "커스텀 릴레이",
			threshold: 90,
		},
		{
			repo: "blue-b/*",
			pattern: "high_confidence_campaign",
			channel: "보안 알림",
			threshold: 85,
		},
	],
	logTitle: "발송 로그",
	logSubtitle: "성공/실패/지연을 한 곳에서",
	logColumns: {
		when: "시점",
		item: "항목",
		score: "점수",
		dest: "대상",
		status: "상태",
		latency: "지연",
	},
	log: [
		{
			when: "2026-06-04 14:22",
			item: "acme/web#128",
			score: 87,
			dest: "Slack #security",
			status: "delivered",
			latency: "1.1초",
		},
		{
			when: "2026-06-03 09:11",
			item: "acme/api#44",
			score: 71,
			dest: "Discord",
			status: "delivered",
			latency: "0.9초",
		},
		{
			when: "2026-06-02 18:05",
			item: "acme/docs#7",
			score: 94,
			dest: "webhook_url",
			status: "retrying",
			latency: "2.4초",
		},
		{
			when: "2026-06-02 11:48",
			item: "acme/api#39",
			score: 62,
			dest: "Slack #security",
			status: "queued",
			latency: "—",
		},
	],
	note: "전송은 best-effort로 동작합니다. 전체 내역은 Slack/Discord 또는 웹훅 엔드포인트에 미러링됩니다.",
};

export default function AlertsPageKo() {
	return (
		<>
			<MarketingNav lang="ko" enHref="/alerts" koHref="/ko/alerts" />
			<AlertsConsole copy={copy} />
			<SiteFooter lang="ko" />
		</>
	);
}
