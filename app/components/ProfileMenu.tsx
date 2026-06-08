"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

interface Me {
	authenticated: boolean;
	login?: string;
	name?: string;
	avatar?: string;
	planName?: string;
	plan?: string;
}

const PORTAL_URL = "https://polar.sh/slopguard/portal";

const L = {
	en: {
		signin: "Sign in",
		account: "Account",
		billing: "Billing",
		out: "Sign out",
		consoles: "Consoles",
		orgDash: "Org overview",
		alerts: "Alerts",
		campaigns: "Patterns",
		enterprise: "Enterprise",
	},
	ko: {
		signin: "로그인",
		account: "마이페이지",
		billing: "결제 관리",
		out: "로그아웃",
		consoles: "콘솔",
		orgDash: "조직 현황",
		alerts: "알림",
		campaigns: "패턴 추적",
		enterprise: "엔터프라이즈",
	},
} as const;

/**
 * Avatar trigger + dropdown (account / billing / sign out) for the header.
 * Self-contained: fetches /api/auth/me so it drops into both the server-
 * rendered app nav and the marketing nav. Sign-out lives here instead of a
 * stray button at the bottom of the account page.
 */
export default function ProfileMenu({ lang }: { lang: Lang }) {
	const ko = lang === "ko";
	const t = L[ko ? "ko" : "en"];
	const accountHref = ko ? "/ko/account" : "/account";
	const [me, setMe] = useState<Me | null>(null);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => r.json())
			.then(setMe)
			.catch(() => setMe({ authenticated: false }));
	}, []);

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false);
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onKey);
		};
	}, []);

	if (!me) return null;

	if (!me.authenticated) {
		return (
			<a
				className="nav-signin"
				href={ko ? "/api/auth/login?lang=ko" : "/api/auth/login"}
			>
				{t.signin}
			</a>
		);
	}

	const paid = me.plan && me.plan !== "free";

	return (
		<div className="profile-menu" ref={ref}>
			<button
				type="button"
				className="profile-trigger"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={me.avatar} alt="" width={26} height={26} />
				<span className="profile-name">{me.login}</span>
				<svg
					className="profile-chev"
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M2.5 4.5 6 8l3.5-3.5"
						stroke="currentColor"
						strokeWidth="1.4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open && (
				<div className="profile-dropdown" role="menu">
					<div className="profile-dd-head">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={me.avatar} alt="" width={34} height={34} />
						<div className="profile-dd-id">
							<div className="profile-dd-name">{me.name || me.login}</div>
							<div className="profile-dd-plan">
								@{me.login} ({me.planName})
							</div>
						</div>
					</div>
					<a role="menuitem" href={accountHref}>
						{t.account}
					</a>
					{paid && (
						<>
							<a role="menuitem" href={PORTAL_URL}>
								{t.billing}
							</a>
							<div className="profile-dd-section">{t.consoles}</div>
							{(me.plan === "team" || me.plan === "enterprise") && (
								<a role="menuitem" href={ko ? "/ko/org" : "/org"}>
									{t.orgDash}
								</a>
							)}
							<a role="menuitem" href={ko ? "/ko/campaigns" : "/campaigns"}>
								{t.campaigns}
							</a>
							{(me.plan === "team" || me.plan === "enterprise") && (
								<a role="menuitem" href={ko ? "/ko/alerts" : "/alerts"}>
									{t.alerts}
								</a>
							)}
							{me.plan === "enterprise" && (
								<a role="menuitem" href={ko ? "/ko/enterprise" : "/enterprise"}>
									{t.enterprise}
								</a>
							)}
						</>
					)}
					<a role="menuitem" className="profile-dd-out" href="/api/auth/logout">
						{t.out}
					</a>
				</div>
			)}
		</div>
	);
}
