import Link from "next/link";
import { INSTALL_URL, REPO_URL } from "@/lib/config";
import type { Lang } from "@/lib/i18n";
import MarketingNav from "./MarketingNav";
import SiteFooter from "@/app/components/SiteFooter";

// Self-contained copy for the pre-install explainer. Kept local (like the
// /setup and checkout-success pages) so it stays close to the markup it serves.
const C = {
	en: {
		home: "/",
		self: "/install",
		other: "/ko/install",
		otherLabel: "KO",
		nav: { how: "How it works", pricing: "Pricing" },
		eyebrow: "before you install",
		h1: "Add SlopGuard to your repositories",
		lead: "Installing puts the SlopGuard app on the repos you choose so it can review incoming PRs and issues. Here is exactly what happens, no surprises.",
		callout: {
			a: "Signing in and installing are different.",
			b: " Signing in just links your GitHub identity for the dashboard and billing. Installing is what actually lets SlopGuard read PRs and post comments on your repos. You can do either first.",
		},
		stepsTitle: "Three steps on GitHub",
		steps: [
			{
				h: "Choose where to install",
				p: "Pick your personal account or an organization, then select every repo or just the ones you want guarded. You can change this anytime from GitHub settings.",
			},
			{
				h: "Review what SlopGuard can access",
				p: "GitHub shows a consent screen with the permissions below. Nothing runs until you approve, and SlopGuard never stores your code.",
			},
			{
				h: "You're done",
				p: "Within a minute SlopGuard starts scoring new PRs and issues. Below your threshold it stays silent; at or above it adds a quarantine label and a review comment with the reasons, and never auto-closes. Tune it later with an optional .github/SLOP_POLICY.yml.",
			},
		],
		permsTitle: "Permissions GitHub will request",
		permsSub: "The least it needs to label and comment, nothing more.",
		perms: [
			[
				"metadata: read",
				"Confirm the repository exists and read its basic info.",
			],
			[
				"contents: read",
				"Read the PR diff and text so it can be scored. Your code is never copied or stored.",
			],
			[
				"issues: write",
				"Post the review comment and apply the slop-quarantine / cleared labels.",
			],
			[
				"pull requests: write",
				"Label and comment on pull requests. It never closes, merges, or pushes anything.",
			],
		],
		reassure: [
			"Free for public repos",
			"No credit card",
			"One click",
			"Uninstall anytime",
		],
		cta: "Continue to GitHub",
		selfhost: "Prefer to self-host?",
		back: "Back to home",
	},
	ko: {
		home: "/ko",
		self: "/ko/install",
		other: "/install",
		otherLabel: "EN",
		nav: { how: "동작 방식", pricing: "가격" },
		eyebrow: "설치하기 전에",
		h1: "내 레포에 SlopGuard 추가하기",
		lead: "설치하면 선택한 레포에 SlopGuard 앱이 올라가서 들어오는 PR과 이슈를 검토합니다. 무슨 일이 일어나는지 그대로 보여드릴게요. 갑작스러운 단계는 없습니다.",
		callout: {
			a: "로그인과 설치는 다릅니다.",
			b: " 로그인은 대시보드와 결제를 위해 GitHub 신원만 연결하는 것이고, 설치는 SlopGuard가 실제로 레포의 PR을 읽고 코멘트를 달 수 있게 하는 단계입니다. 둘 중 무엇을 먼저 해도 됩니다.",
		},
		stepsTitle: "GitHub에서 진행되는 세 단계",
		steps: [
			{
				h: "어디에 설치할지 고르기",
				p: "개인 계정이나 조직을 고르고, 전체 레포 또는 보호할 레포만 선택합니다. 나중에 GitHub 설정에서 언제든 바꿀 수 있습니다.",
			},
			{
				h: "SlopGuard가 접근하는 범위 확인",
				p: "GitHub가 아래 권한이 적힌 동의 화면을 보여줍니다. 승인하기 전까지는 아무것도 실행되지 않고, SlopGuard는 코드를 저장하지 않습니다.",
			},
			{
				h: "끝",
				p: "1분 안에 SlopGuard가 새 PR과 이슈 점수화를 시작합니다. 임계값 아래면 조용하고, 이상이면 격리 라벨과 근거가 담긴 리뷰 코멘트를 답니다. 절대 자동으로 닫지 않습니다. 이후 선택 사항인 .github/SLOP_POLICY.yml로 세밀하게 조정할 수 있습니다.",
			},
		],
		permsTitle: "GitHub가 요청할 권한",
		permsSub: "라벨과 코멘트에 필요한 최소한이며, 그 이상은 없습니다.",
		perms: [
			["metadata: read", "레포가 존재하는지 확인하고 기본 정보를 읽습니다."],
			[
				"contents: read",
				"점수를 매기기 위해 PR의 diff와 텍스트를 읽습니다. 코드는 복사하거나 저장하지 않습니다.",
			],
			[
				"issues: write",
				"리뷰 코멘트를 달고 slop-quarantine / cleared 라벨을 붙입니다.",
			],
			[
				"pull requests: write",
				"PR에 라벨과 코멘트를 답니다. 닫거나 병합하거나 푸시하는 일은 절대 없습니다.",
			],
		],
		reassure: ["공개 레포 무료", "카드 불필요", "클릭 한 번", "언제든 제거"],
		cta: "GitHub로 계속하기",
		selfhost: "직접 호스팅하시겠어요?",
		back: "홈으로",
	},
} as const;

export default function InstallGuide({ lang }: { lang: Lang }) {
	const c = C[lang];

	return (
		<>
			<MarketingNav lang={lang} enHref="/install" koHref="/ko/install" />

			<main className="install-main">
				<div className="mono-rule">
					<span>// {lang === "ko" ? "slopguard.app/ko/install" : "slopguard.app/install"}</span>
					<span className="mono-rule-end">[ slopguard ]</span>
				</div>
				<span className="eyebrow">{c.eyebrow}</span>
				<h1>{c.h1}</h1>
				<p className="install-lead">{c.lead}</p>

				<p className="callout">
					<b>{c.callout.a}</b>
					{c.callout.b}
				</p>

				<h2 className="install-h2">{c.stepsTitle}</h2>
				<div className="steps" style={{ margin: "0 0 14px" }}>
					{c.steps.map((s) => (
						<div className="step" key={s.h}>
							<span className="num" />
							<p>
								<b style={{ color: "var(--fg)" }}>{s.h}</b>
								<span style={{ display: "block", marginTop: 4 }}>{s.p}</span>
							</p>
						</div>
					))}
				</div>

				<div className="card" style={{ marginTop: 24 }}>
					<h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{c.permsTitle}</h3>
					<p className="muted" style={{ fontSize: 13.5, margin: "0 0 16px" }}>
						{c.permsSub}
					</p>
					<ul className="perm-list">
						{c.perms.map(([scope, why]) => (
							<li key={scope}>
								<code>{scope}</code>
								<span>{why}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="reassure">
					{c.reassure.map((r) => (
						<span key={r}>{r}</span>
					))}
				</div>

				<div className="btn-row" style={{ marginTop: 28 }}>
					<a className="btn btn-primary btn-lg" href={INSTALL_URL}>
						{c.cta} &rarr;
					</a>
					<Link className="btn btn-ghost btn-lg" href="/setup">
						{c.selfhost}
					</Link>
				</div>
				<p style={{ marginTop: 18 }}>
					<Link className="muted" href={c.home} style={{ fontSize: 14 }}>
						&larr; {c.back}
					</Link>
				</p>
			</main>

			<SiteFooter lang={lang} />
		</>
	);
}
