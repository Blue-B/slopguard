"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { SidebarItem } from "./ConsoleSidebar";
import { toneColor } from "./console-styles";

/**
 * One shared chrome for every paid console (Org / Campaigns / Alerts /
 * Enterprise). Glass top nav + grid background + page-width frame. This is the
 * single source of truth for paid-surface navigation so every plan-gated page
 * reads as the same product.
 */
export function ConsoleShell({
	kicker,
	workspace,
	nav,
	children,
}: {
	kicker: string;
	workspace: string;
	nav: SidebarItem[];
	children: React.ReactNode;
}) {
	const pathname = usePathname() ?? "";
	const activeBase = nav.reduce<string | null>((best, item) => {
		const base = item.href.split("#")[0];
		if (!base || base === "/") return best;
		const match = pathname === base || pathname.startsWith(`${base}/`);
		if (!match) return best;
		return !best || base.length > best.length ? base : best;
	}, null);

	return (
		<main className="console-experience">
			<div className="grid-bg" aria-hidden="true" />
			<div className="wide console-wide">
				<nav className="console-nav" aria-label="Console sections">
					<div className="console-nav-brand">
						<span className="console-nav-kicker mono">{kicker}</span>
						<strong>{workspace}</strong>
					</div>
					{nav.length > 0 ? (
						<div className="console-nav-links">
							{nav.map((item) => {
								const base = item.href.split("#")[0];
								const active = activeBase === base;
								return (
									<Link
										key={item.label}
										href={item.href}
										className={active ? "active" : ""}
									>
										{item.label}
									</Link>
								);
							})}
						</div>
					) : null}
				</nav>
				{children}
			</div>
		</main>
	);
}

export type ConsoleMetric = {
	label: string;
	value: string | number;
	tone?: keyof typeof toneColor;
};

/**
 * Shared console identity bar. Same language as the account / repo dashboard:
 * a round operator emblem (derived from the per-console ambient art), a small
 * eyebrow, the WORKSPACE name as the h1 (not a marketing headline), a live dot,
 * a one-line description, and a hairline stat ledger. Logged-in operators land
 * on their workspace + numbers, not a pitch. `title`/`plateLabel`/`imageAlt`
 * are accepted for backward compatibility but no longer rendered.
 */
export function ConsoleHero({
	eyebrow,
	workspace,
	body,
	metrics,
	image,
	connected,
	actions,
}: {
	eyebrow: string;
	workspace: string;
	title?: string;
	body: string;
	metrics?: ConsoleMetric[];
	image: string;
	imageAlt?: string;
	plateLabel?: string;
	connected: string;
	actions?: React.ReactNode;
}) {
	// Derive the round seal from the ambient art name (/console-x.png -> /emblem-x.png).
	const emblem = image.replace("/console-", "/emblem-");
	return (
		<header className="acct-ident">
			<span className="acct-ident-glow" aria-hidden="true" />
			<div className="acct-ident-inner">
				<div className="acct-ident-seal">
					<Image src={emblem} alt="" width={96} height={96} priority />
				</div>
				<div className="acct-ident-id">
					<p className="acct-ident-eyebrow mono">{eyebrow}</p>
					<div className="acct-ident-handle">
						<h1>{workspace}</h1>
						<span className="acct-live">
							<i aria-hidden="true" />
							{connected}
						</span>
					</div>
					{body ? <p className="acct-ident-meta">{body}</p> : null}
				</div>
				{actions ? <div className="acct-ident-side">{actions}</div> : null}
			</div>
			{metrics && metrics.length > 0 ? (
				<div className="acct-ledger">
					{metrics.map((m) => (
						<div className="acct-ledger-cell" key={m.label}>
							<b style={m.tone ? { color: toneColor[m.tone] } : undefined}>
								{m.value}
							</b>
							<span>{m.label}</span>
						</div>
					))}
				</div>
			) : null}
		</header>
	);
}

export function ConsoleSectionHead({
	title,
	sub,
	href,
	cta,
}: {
	title: string;
	sub?: string;
	href?: string;
	cta?: string;
}) {
	return (
		<header className="console-section-head">
			<div>
				<h2>{title}</h2>
				{sub ? <p>{sub}</p> : null}
			</div>
			{href && cta ? (
				<Link href={href} prefetch={false}>
					{cta} <span aria-hidden="true">→</span>
				</Link>
			) : null}
		</header>
	);
}

export function ConsoleStatus({
	children,
	danger = false,
}: {
	children: React.ReactNode;
	danger?: boolean;
}) {
	return (
		<div className={danger ? "console-status danger mono" : "console-status mono"}>
			{children}
		</div>
	);
}
