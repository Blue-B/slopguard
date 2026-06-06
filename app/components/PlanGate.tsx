import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { planForOwner } from "@/lib/billing/entitlement";
import { PLAN_RANK, type PlanId } from "@/lib/billing/plans";
import type { Lang } from "@/lib/i18n";

const T = {
	en: {
		signinTitle: "Sign in to access this console",
		signinSub:
			"This is a paid-feature console. Sign in with GitHub to see your real data, or browse the preview.",
		signinCta: "Sign in with GitHub",
		previewBadge: "Preview data",
		upgradeTitle: (required: string) =>
			`This console requires the ${required} plan`,
		upgradeSub: (required: string, current: string) =>
			`You're on the ${current} plan. Upgrade to ${required} to see your real ${required.toLowerCase()} data in this console.`,
		upgradeCta: (required: string) => `Upgrade to ${required}`,
		viewPlans: "View all plans",
		previewOn: "Preview mode active",
		previewOnSub:
			"The panels below show what the console looks like. Your real data appears here once you upgrade.",
	},
	ko: {
		signinTitle: "이 콘솔에 접근하려면 로그인하세요",
		signinSub:
			"이 페이지는 유료 기능 콘솔입니다. GitHub으로 로그인하면 실제 데이터가 표시됩니다. 지금은 미리보기로 보고 계세요.",
		signinCta: "GitHub으로 로그인",
		previewBadge: "샘플 데이터",
		upgradeTitle: (required: string) =>
			`이 콘솔은 ${required} 플랜에서 제공됩니다`,
		upgradeSub: (required: string, current: string) =>
			`현재 ${current} 플랜입니다. ${required}으로 업그레이드하면 이 콘솔에서 실제 ${required} 데이터를 볼 수 있습니다.`,
		upgradeCta: (required: string) => `${required} 업그레이드`,
		viewPlans: "전체 요금제 보기",
		previewOn: "미리보기 모드",
		previewOnSub:
			"아래 패널은 콘솔 디자인 미리보기입니다. 업그레이드 후에는 실제 데이터가 여기에 표시됩니다.",
	},
} as const;

function planLabel(id: PlanId): string {
	return id === "free"
		? "Free"
		: id === "pro"
			? "Pro"
			: id === "team"
				? "Team"
				: "Enterprise";
}

async function resolveGate(lang: Lang, required: PlanId) {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	const plan: PlanId | null = session
		? await planForOwner(session.login)
		: null;
	const ko = lang === "ko";
	const t = T[ko ? "ko" : "en"];
	const signinHref = ko ? "/api/auth/login?lang=ko" : "/api/auth/login";
	const pricingHref = ko ? "/ko/pricing" : "/pricing";
	const accountHref = ko ? "/ko/account" : "/account";
	const requiredLabel = planLabel(required);

	if (!session || !plan) {
		return {
			state: "signed-out" as const,
			plan,
			required,
			banner: {
				eyebrow: t.previewBadge,
				title: t.signinTitle,
				body: t.signinSub,
				primary: { href: signinHref, label: t.signinCta },
				secondary: { href: pricingHref, label: t.viewPlans },
			},
		};
	}

	if (PLAN_RANK[plan] < PLAN_RANK[required]) {
		return {
			state: "wrong-plan" as const,
			plan,
			required,
			banner: {
				eyebrow: t.previewOn,
				title: t.upgradeTitle(requiredLabel),
				body: t.upgradeSub(requiredLabel, planLabel(plan)),
				primary: {
					href: `${pricingHref}?upgrade=${required}`,
					label: t.upgradeCta(requiredLabel),
				},
				secondary: { href: accountHref, label: t.viewPlans },
			},
		};
	}

	return { state: "ok" as const, plan, required, banner: null };
}

export type PlanGateProps = {
	lang: Lang;
	required: PlanId;
	children: React.ReactNode;
};

export default async function PlanGate({
	lang,
	required,
	children,
}: PlanGateProps) {
	const gate = await resolveGate(lang, required);

	if (gate.state === "ok") {
		return <>{children}</>;
	}

	return (
		<div
			style={{
				position: "relative",
				minHeight: 720,
				backgroundImage:
					"linear-gradient(180deg, rgba(13,17,23,0.52), rgba(13,17,23,0.92)), url('/paid-console-premium-header.png')",
				backgroundSize: "cover",
				backgroundPosition: "center top",
			}}
		>
			<PlanGateOverlay banner={gate.banner} />
		</div>
	);
}

function PlanGateOverlay({
	banner,
}: {
	banner: {
		eyebrow: string;
		title: string;
		body: string;
		primary: { href: string; label: string };
		secondary: { href: string; label: string };
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
					<Link
						href={banner.secondary.href}
						className="btn btn-ghost btn-sm"
						prefetch={false}
					>
						{banner.secondary.label}
					</Link>
				</div>
			</div>
		</div>
	);
}
