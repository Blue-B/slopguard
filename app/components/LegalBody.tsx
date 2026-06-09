import type { Lang } from "@/lib/i18n";
import { REPO_URL } from "@/lib/config";
import MarketingNav from "./MarketingNav";
import SiteFooter from "./SiteFooter";

export type LegalDoc = "privacy" | "terms";

const UPDATED = "2026-06-09";
const ISSUES = `${REPO_URL}/issues`;

type Section = { h: string; body: string[] };
type Copy = { eyebrow: string; h1: string; updated: string; intro: string; sections: Section[] };

const PRIVACY_EN: Copy = {
	eyebrow: "LEGAL",
	h1: "Privacy Policy",
	updated: `Last updated: ${UPDATED}`,
	intro:
		"SlopGuard is a GitHub App that triages AI-generated pull requests and issues. This policy explains what we collect, why, who we share it with, and the choices you have. We collect the minimum needed to run the service and we never sell your data.",
	sections: [
		{
			h: "1. What we collect",
			body: [
				"Account identity: when you sign in with GitHub we receive your GitHub login, display name, and avatar URL. We use this to show your dashboard and to match your billing entitlement.",
				"Repository content for scoring: when SlopGuard is installed on a repo, it reads the pull requests and issues sent by GitHub webhooks, including titles, descriptions, and diff metadata, so it can score them. We read this live and do not keep a separate database of your slop history; the dashboard reads it back from GitHub on demand.",
				"Console settings you create: alert channels and routing rules, SSO configuration, and an audit log of the actions you take. These are stored so the consoles work across sessions.",
				"Billing data: payments are processed by Polar, our Merchant of Record. Polar collects your email and payment details. SlopGuard never sees or stores your card number.",
			],
		},
		{
			h: "2. How we use it",
			body: [
				"To score incoming PRs and issues, apply the slop-quarantine label, and post a review comment with the reasons. We never auto-close, merge, or push anything; destructive actions only happen when a maintainer runs an explicit /slop command.",
				"To deliver the alerts you configure (Slack, Discord, or webhook) and to provide the org dashboard, pattern tracking, and audit log.",
				"To manage your plan entitlement and, for Enterprise, your SAML SSO sign-in if you configure it.",
			],
		},
		{
			h: "3. Third-party processing (sub-processors)",
			body: [
				"LLM providers: to score a contribution, the text of the PR or issue may be sent to a large language model provider (for example Anthropic, OpenAI, or xAI, per your configured order) for analysis. Only the content needed to score is sent.",
				"GitHub: the platform the app runs on; we act on the permissions you grant at install (read PRs/issues, write labels and comments).",
				"Polar: payments, invoicing, and tax as Merchant of Record.",
				"Upstash: stores console and entitlement state. Cloudtype: hosts the application.",
				"These providers process data on our behalf to deliver the service. We do not sell personal data to anyone.",
			],
		},
		{
			h: "4. Data retention",
			body: [
				"We do not store your slop scores or PR/issue content in our own database; scoring is computed on the webhook event and the dashboard reads history live from GitHub. Transient analysis results may be cached briefly to avoid recomputation.",
				"Console settings, SSO config, and the audit log persist until you remove them or uninstall the app. Uninstalling the GitHub App stops all processing for that account.",
			],
		},
		{
			h: "5. Your rights",
			body: [
				"You can stop all processing at any time by uninstalling the GitHub App from your repositories or organization.",
				"You can request access to, correction of, or deletion of the data we hold about you. Depending on where you live you may have rights under the GDPR or CCPA; we honor those requests.",
				"To make a request, open an issue or contact us through the channel in section 7.",
			],
		},
		{
			h: "6. Security",
			body: [
				"We request the least GitHub permission needed to label and comment. Access tokens are used in memory and are not written to logs. Billing is isolated to Polar. No system is perfectly secure, but we aim to minimize what we hold so there is little to expose.",
			],
		},
		{
			h: "7. Contact",
			body: [
				`Questions or data requests: open an issue at ${ISSUES}. We will add a dedicated privacy contact address as the service grows.`,
			],
		},
	],
};

const PRIVACY_KO: Copy = {
	eyebrow: "법적 고지",
	h1: "개인정보처리방침",
	updated: `최종 업데이트: ${UPDATED}`,
	intro:
		"SlopGuard는 AI가 생성한 풀 리퀘스트와 이슈를 분류하는 GitHub 앱입니다. 이 방침은 무엇을, 왜 수집하고, 누구와 공유하며, 어떤 선택권이 있는지 설명합니다. 서비스 운영에 필요한 최소한만 수집하며, 데이터를 판매하지 않습니다.",
	sections: [
		{
			h: "1. 수집하는 정보",
			body: [
				"계정 신원: GitHub으로 로그인하면 GitHub 로그인 아이디, 표시 이름, 아바타 URL을 받습니다. 대시보드 표시와 결제 권한 연결에 사용합니다.",
				"점수화를 위한 레포 콘텐츠: 레포에 SlopGuard가 설치되면 GitHub 웹훅으로 들어오는 PR과 이슈(제목, 설명, diff 메타데이터)를 읽어 점수를 매깁니다. 실시간으로 읽으며 슬롭 기록을 별도 데이터베이스에 저장하지 않습니다. 대시보드는 필요할 때 GitHub에서 다시 읽어옵니다.",
				"사용자가 만든 콘솔 설정: 알림 채널과 라우팅 규칙, SSO 설정, 사용자가 수행한 동작의 감사 로그. 세션이 바뀌어도 콘솔이 동작하도록 저장합니다.",
				"결제 데이터: 결제는 판매대행사(Merchant of Record)인 Polar가 처리합니다. Polar가 이메일과 결제 수단을 수집하며, SlopGuard는 카드 번호를 보거나 저장하지 않습니다.",
			],
		},
		{
			h: "2. 이용 목적",
			body: [
				"들어오는 PR과 이슈를 점수화하고, slop-quarantine 라벨을 달고, 근거가 담긴 리뷰 코멘트를 남기기 위해. 자동으로 닫거나 병합하거나 푸시하지 않으며, 파괴적 동작은 관리자가 명시적으로 /slop 명령을 입력할 때만 일어납니다.",
				"사용자가 설정한 알림(Slack, Discord, 웹훅) 전송과 조직 현황, 패턴 추적, 감사 로그 제공을 위해.",
				"플랜 권한 관리, 그리고 Enterprise의 경우 사용자가 설정한 SAML SSO 로그인을 위해.",
			],
		},
		{
			h: "3. 제3자 처리(수탁사)",
			body: [
				"LLM 제공자: 기여물을 점수화하기 위해 PR이나 이슈의 텍스트가 분석을 위해 대규모 언어 모델 제공자(예: Anthropic, OpenAI, xAI, 설정한 순서에 따라)로 전송될 수 있습니다. 점수화에 필요한 내용만 전송됩니다.",
				"GitHub: 앱이 동작하는 플랫폼이며, 설치 시 부여한 권한(PR/이슈 읽기, 라벨·코멘트 쓰기) 범위에서만 동작합니다.",
				"Polar: 판매대행사로서 결제, 인보이스, 세금 처리.",
				"Upstash: 콘솔과 권한 상태 저장. Cloudtype: 애플리케이션 호스팅.",
				"이들은 서비스 제공을 위해 당사를 대신해 데이터를 처리합니다. 개인정보를 누구에게도 판매하지 않습니다.",
			],
		},
		{
			h: "4. 보관 기간",
			body: [
				"슬롭 점수나 PR/이슈 내용을 자체 데이터베이스에 저장하지 않습니다. 점수화는 웹훅 이벤트에서 계산되며 대시보드는 GitHub에서 실시간으로 기록을 읽습니다. 재계산을 피하기 위해 분석 결과가 잠시 캐시될 수 있습니다.",
				"콘솔 설정, SSO 설정, 감사 로그는 사용자가 삭제하거나 앱을 제거할 때까지 유지됩니다. GitHub 앱을 제거하면 해당 계정의 모든 처리가 중단됩니다.",
			],
		},
		{
			h: "5. 사용자의 권리",
			body: [
				"레포나 조직에서 GitHub 앱을 제거하면 언제든 모든 처리를 중단할 수 있습니다.",
				"당사가 보유한 정보에 대한 열람, 정정, 삭제를 요청할 수 있습니다. 거주 지역에 따라 GDPR 또는 CCPA상의 권리가 있을 수 있으며, 해당 요청을 처리합니다.",
				"요청은 7번 항목의 채널로 이슈를 열어 주세요.",
			],
		},
		{
			h: "6. 보안",
			body: [
				"라벨과 코멘트에 필요한 최소 GitHub 권한만 요청합니다. 액세스 토큰은 메모리에서만 사용하며 로그에 기록하지 않습니다. 결제는 Polar로 분리되어 있습니다. 완벽히 안전한 시스템은 없지만, 보유하는 데이터를 최소화해 노출 위험을 줄입니다.",
			],
		},
		{
			h: "7. 연락처",
			body: [
				`문의나 데이터 요청: ${ISSUES} 에 이슈를 열어 주세요. 서비스가 성장하면 전용 개인정보 연락처를 추가할 예정입니다.`,
			],
		},
	],
};

const TERMS_EN: Copy = {
	eyebrow: "LEGAL",
	h1: "Terms of Service",
	updated: `Last updated: ${UPDATED}`,
	intro:
		"These terms govern your use of the hosted SlopGuard service at slopguard.app. By installing the GitHub App or signing in, you agree to them. The source is available (MIT with the Commons Clause): you may read it and self-host it for your own use, but you may not sell it or run it as a hosted service for others.",
	sections: [
		{
			h: "1. The service",
			body: [
				"SlopGuard is a triage tool. It scores pull requests and issues, tags their likely provenance, and applies a slop-quarantine label with a review comment. It is not a moderation authority and it never auto-closes, merges, or pushes. A maintainer makes every destructive decision with an explicit /slop command.",
				"Scores are heuristics and model outputs, not factual determinations. Detection-quality numbers we publish are measured on a small evaluation set and are provided as guidance, not a guarantee of accuracy for your repositories.",
			],
		},
		{
			h: "2. Plans and billing",
			body: [
				"A free tier is available. Paid plans are Pro ($19/month), Team ($99/month), and Enterprise ($299/month). Payments are processed by Polar as Merchant of Record, which issues invoices and handles applicable taxes.",
				"Subscriptions renew automatically until cancelled. You can change or cancel your plan, and access invoices, through the Polar customer portal linked from your account. Upgrades are prorated immediately; downgrades take effect at the end of the current billing period.",
				"Refunds are handled per Polar's policies and applicable consumer law. Contact us if a charge looks wrong.",
			],
		},
		{
			h: "3. Acceptable use",
			body: [
				"Use the service only on repositories and organizations you are authorized to manage. Do not attempt to disrupt the service, reverse the rate limits, or use it to harass contributors.",
				"You are responsible for the decisions you make with the tool, including which contributions you approve or reject.",
			],
		},
		{
			h: "4. No warranty",
			body: [
				"The service is provided \u201cas is\u201d and \u201cas available,\u201d without warranties of any kind, express or implied. We do not warrant that scoring is accurate, that the service is uninterrupted, or that it will catch every low-effort contribution or never flag a legitimate one.",
			],
		},
		{
			h: "5. Limitation of liability",
			body: [
				"To the maximum extent permitted by law, SlopGuard and its operator are not liable for indirect, incidental, or consequential damages, or for decisions made using the tool. Our total liability for any claim is limited to the amount you paid for the service in the three months before the claim.",
			],
		},
		{
			h: "6. Open source",
			body: [
				`The SlopGuard source is available at ${REPO_URL} under the MIT License with the Commons Clause. You may read, modify, and self-host it for your own use, but the Commons Clause prohibits selling it or offering it as a hosted service to third parties. The hosted service at slopguard.app, its infrastructure, branding, and managed features are operated by us and governed by these terms.`,
			],
		},
		{
			h: "7. Changes and contact",
			body: [
				`We may update these terms; material changes will be reflected by the \u201clast updated\u201d date. Continued use after a change means you accept it. These terms are governed by the laws of the Republic of Korea. Questions: open an issue at ${ISSUES}.`,
			],
		},
	],
};

const TERMS_KO: Copy = {
	eyebrow: "법적 고지",
	h1: "이용약관",
	updated: `최종 업데이트: ${UPDATED}`,
	intro:
		"본 약관은 slopguard.app의 호스팅 SlopGuard 서비스 이용에 적용됩니다. GitHub 앱을 설치하거나 로그인하면 약관에 동의하는 것입니다. 소스는 공개되어 있으며(MIT + Commons Clause), 읽고 직접 셀프호스팅할 수 있지만 판매하거나 타인에게 호스팅 서비스로 제공할 수는 없습니다.",
	sections: [
		{
			h: "1. 서비스 내용",
			body: [
				"SlopGuard는 분류 도구입니다. PR과 이슈를 점수화하고 출처를 태깅하며, slop-quarantine 라벨과 리뷰 코멘트를 답니다. 중재 권한 기관이 아니며 자동으로 닫거나 병합하거나 푸시하지 않습니다. 모든 파괴적 결정은 관리자가 명시적 /slop 명령으로 직접 합니다.",
				"점수는 휴리스틱과 모델 출력이며 사실 판정이 아닙니다. 당사가 공개하는 탐지 품질 수치는 작은 평가 세트에서 측정한 참고치이며, 사용자의 레포에 대한 정확도를 보장하지 않습니다.",
			],
		},
		{
			h: "2. 플랜과 결제",
			body: [
				"무료 티어가 있습니다. 유료 플랜은 Pro(월 $19), Team(월 $99), Enterprise(월 $299)입니다. 결제는 판매대행사(Merchant of Record)인 Polar가 처리하며, 인보이스 발행과 해당 세금 처리를 담당합니다.",
				"구독은 해지 전까지 자동 갱신됩니다. 계정에 연결된 Polar 고객 포털에서 플랜 변경·해지 및 인보이스 확인이 가능합니다. 업그레이드는 즉시 비례정산되고, 다운그레이드는 현재 결제 기간 종료 시점에 적용됩니다.",
				"환불은 Polar의 정책과 관련 소비자법에 따릅니다. 청구가 잘못되어 보이면 연락 주세요.",
			],
		},
		{
			h: "3. 허용되는 사용",
			body: [
				"본인이 관리 권한을 가진 레포와 조직에서만 서비스를 사용하세요. 서비스 방해, 속도 제한 우회, 기여자 괴롭힘에 사용하지 마세요.",
				"어떤 기여를 승인하거나 거부할지 등, 도구로 내린 결정에 대한 책임은 사용자에게 있습니다.",
			],
		},
		{
			h: "4. 보증 부인",
			body: [
				"서비스는 명시적이든 묵시적이든 어떠한 보증도 없이 \u201c있는 그대로\u201d 및 \u201c이용 가능한 범위에서\u201d 제공됩니다. 점수의 정확성, 서비스의 무중단, 모든 저품질 기여를 잡아내거나 정상 기여를 절대 잘못 표시하지 않는다는 점을 보증하지 않습니다.",
			],
		},
		{
			h: "5. 책임의 제한",
			body: [
				"법이 허용하는 최대 범위에서, SlopGuard와 운영자는 간접·부수적·결과적 손해 또는 도구를 사용해 내린 결정에 대해 책임지지 않습니다. 모든 청구에 대한 당사의 총 책임은 청구 이전 3개월간 사용자가 서비스에 지불한 금액으로 제한됩니다.",
			],
		},
		{
			h: "6. 소스 공개 라이선스",
			body: [
				`SlopGuard 소스는 ${REPO_URL} 에서 MIT 라이선스 + Commons Clause로 공개되어 있습니다. 읽고 수정하고 직접 셀프호스팅할 수 있지만, Commons Clause에 따라 판매하거나 제3자에게 호스팅 서비스로 제공하는 것은 금지됩니다. slopguard.app 호스팅 서비스, 인프라, 브랜드, 매니지드 기능은 당사가 운영하며 본 약관의 적용을 받습니다.`,
			],
		},
		{
			h: "7. 변경 및 연락처",
			body: [
				`본 약관은 변경될 수 있으며, 중요한 변경은 \u201c최종 업데이트\u201d 날짜로 반영됩니다. 변경 후 계속 이용하면 변경에 동의하는 것으로 봅니다. 본 약관은 대한민국 법률의 적용을 받습니다. 문의: ${ISSUES} 에 이슈를 열어 주세요.`,
			],
		},
	],
};

function pick(doc: LegalDoc, lang: Lang): Copy {
	if (doc === "privacy") return lang === "ko" ? PRIVACY_KO : PRIVACY_EN;
	return lang === "ko" ? TERMS_KO : TERMS_EN;
}

export default function LegalBody({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
	const c = pick(doc, lang);
	const enHref = `/${doc}`;
	const koHref = `/ko/${doc}`;
	return (
		<>
			<MarketingNav lang={lang} enHref={enHref} koHref={koHref} />
			<main className="legal-wrap">
				<div className="grid-bg" aria-hidden="true" />
				<div className="wide legal-doc">
					<p className="eyebrow mono">{c.eyebrow}</p>
					<h1>{c.h1}</h1>
					<p className="legal-updated mono">{c.updated}</p>
					<p className="legal-intro">{c.intro}</p>
					{c.sections.map((s) => (
						<section className="legal-section" key={s.h}>
							<h2>{s.h}</h2>
							{s.body.map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</section>
					))}
				</div>
			</main>
			<SiteFooter lang={lang} />
		</>
	);
}
