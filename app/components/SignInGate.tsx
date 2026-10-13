import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import type { Lang } from "@/lib/i18n";

const T = {
	en: {
		signinTitle: "Sign in to access this console",
		signinSub:
			"Sign in with GitHub to see your real data, or browse the preview.",
		signinCta: "Sign in with GitHub",
		previewBadge: "Preview data",
	},
	ko: {
		signinTitle: "이 콘솔에 접근하려면 로그인하세요",
		signinSub:
			"GitHub으로 로그인하면 실제 데이터가 표시됩니다. 지금은 미리보기로 보고 계세요.",
		signinCta: "GitHub으로 로그인",
		previewBadge: "샘플 데이터",
	},
} as const;

/** Console pages need a GitHub session; every feature is free once signed in. */
export default async function SignInGate({
	lang,
	children,
}: {
	lang: Lang;
	children: React.ReactNode;
}) {
	const store = await cookies();
	if (decodeSession(store.get(SESSION_COOKIE)?.value)) return <>{children}</>;

	const ko = lang === "ko";
	const t = T[ko ? "ko" : "en"];
	return (
		<div
			style={{
				position: "relative",
				minHeight: 720,
				backgroundImage:
					"linear-gradient(180deg, rgba(13,17,23,0.52), rgba(13,17,23,0.92)), url('/console-command.png')",
				backgroundSize: "cover",
				backgroundPosition: "center top",
			}}
		>
			<SignInOverlay
				banner={{
					eyebrow: t.previewBadge,
					title: t.signinTitle,
					body: t.signinSub,
					primary: {
						href: ko ? "/api/auth/login?lang=ko" : "/api/auth/login",
						label: t.signinCta,
					},
				}}
			/>
		</div>
	);
}

function SignInOverlay({
	banner,
}: {
	banner: {
		eyebrow: string;
		title: string;
		body: string;
		primary: { href: string; label: string };
	};
}) {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "24px 32px",
				background:
					"linear-gradient(180deg, rgba(5,8,12,0.18), rgba(5,8,12,0.34))",
			}}
		>
			<div
				role="status"
				style={{
					maxWidth: 760,
					width: "100%",
					background:
						"linear-gradient(90deg, rgba(10,14,21,0.96), rgba(10,14,21,0.86))",
					borderTop: "1px solid #2b3846",
					borderBottom: "1px solid #2b3846",
					padding: "26px 30px",
					boxShadow: "0 36px 90px rgba(0,0,0,.38)",
					textAlign: "left",
				}}
			>
				<div
					style={{
						color: "#3fb950",
						fontSize: 11,
						fontWeight: 800,
						letterSpacing: ".1em",
						marginBottom: 10,
					}}
				>
					{banner.eyebrow.toUpperCase()}
				</div>
				<h2
					style={{
						margin: 0,
						fontSize: 20,
						letterSpacing: "-.02em",
						color: "#f0f6fc",
					}}
				>
					{banner.title}
				</h2>
				<p
					style={{
						color: "#8b949e",
						fontSize: 13,
						lineHeight: 1.55,
						margin: "10px 0 16px",
					}}
				>
					{banner.body}
				</p>
				<div
					style={{
						display: "flex",
						gap: 10,
						flexWrap: "wrap",
						alignItems: "center",
					}}
				>
					<Link
						href={banner.primary.href}
						className="btn btn-primary btn-sm"
						prefetch={false}
					>
						{banner.primary.label}
					</Link>
				</div>
			</div>
		</div>
	);
}
