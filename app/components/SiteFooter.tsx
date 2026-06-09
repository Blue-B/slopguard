import Link from "next/link";
import { REPO_URL } from "@/lib/config";
import type { Lang } from "@/lib/i18n";

const F = {
	en: {
		tag: "AI-slop triage for GitHub maintainers. It labels and comments, never auto-closes a real contributor.",
		how: "How it works",
		pricing: "Pricing",
		docs: "Docs",
		install: "Install",
		policy: "Config example",
		issues: "Issues",
		privacy: "Privacy",
		terms: "Terms",
		rights: "Source-available (Commons Clause). Self-host for your own use.",
	},
	ko: {
		tag: "오픈소스 관리자를 위한 AI 슬롭 분류. 라벨과 코멘트만 달고, 진짜 기여자를 자동으로 닫지 않습니다.",
		how: "동작 방식",
		pricing: "가격",
		docs: "문서",
		install: "설치",
		policy: "설정 파일 예시",
		issues: "이슈",
		privacy: "개인정보처리방침",
		terms: "이용약관",
		rights: "소스 공개 (Commons Clause). 직접 셀프호스팅 가능.",
	},
} as const;

function GitHubMark() {
	return (
		<svg
			viewBox="0 0 16 16"
			width="18"
			height="18"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

/** Shared footer for the app/utility pages (account, install, setup). Richer
 * than a single line, with real links and a GitHub icon, but lighter than the
 * landing's multi-column footer. */
export default function SiteFooter({ lang = "en" }: { lang?: Lang }) {
	const f = F[lang];
	const p = lang === "ko" ? "/ko" : "";
	const install = lang === "ko" ? "/ko/install" : "/install";
	return (
		<footer className="site footer-app">
			<div className="footer-app-top">
				<span className="footer-brand">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="" />
					SlopGuard
				</span>
				<p className="footer-app-tag">{f.tag}</p>
				<nav className="footer-app-links">
					<Link href={`${p}/how-it-works`}>{f.how}</Link>
					<Link href={`${p}/pricing`}>{f.pricing}</Link>
					<Link href={`${p}/docs`}>{f.docs}</Link>
					<Link href={install}>{f.install}</Link>
					<a href={`${REPO_URL}/blob/main/.github/SLOP_POLICY.example.yml`}>
						{f.policy}
					</a>
					<Link href={`${p}/privacy`}>{f.privacy}</Link>
					<Link href={`${p}/terms`}>{f.terms}</Link>
					<a
						className="footer-gh"
						href={REPO_URL}
						aria-label="GitHub repository"
					>
						<GitHubMark />
					</a>
				</nav>
			</div>
			<div className="footer-app-bottom">
				<span>© {new Date().getFullYear()} SlopGuard</span>
				<span>{f.rights}</span>
			</div>
		</footer>
	);
}
