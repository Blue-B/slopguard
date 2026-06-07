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
 * Shared masthead: a compact, data-first command band. The generated asset is
 * an ambient background (low-opacity, gradient-masked, faint scan) rather than a
 * marketing plate; a small eyebrow + single-line title + live stat-strip sit on
 * top, with the real data tables/panels immediately below. Used by every paid
 * page so logged-in operators land on their numbers, not a pitch.
 */
export function ConsoleHero({
	eyebrow,
	title,
	body,
	metrics,
	image,
	imageAlt,
	plateLabel,
	connected,
	actions,
}: {
	eyebrow: string;
	title: string;
	body: string;
	metrics?: ConsoleMetric[];
	image: string;
	imageAlt: string;
	plateLabel: string;
	connected: string;
	actions?: React.ReactNode;
}) {
	return (
		<header className="console-masthead">
			<div className="console-masthead-bg" aria-hidden="true">
				<Image src={image} alt="" width={1568} height={882} priority />
				<span className="console-masthead-scan" />
			</div>
			<div className="console-masthead-fore">
				<div className="console-masthead-top">
					<div className="console-masthead-id">
						<div className="eyebrow mono">{eyebrow}</div>
						<h1>{title}</h1>
						{body ? <p>{body}</p> : null}
					</div>
					<div className="console-masthead-meta">
						<span className="console-conn mono" title={imageAlt}>
							<i aria-hidden="true" /> {connected}
						</span>
						<span className="console-plate-tag mono">{plateLabel}</span>
						{actions ? (
							<div className="console-masthead-actions">{actions}</div>
						) : null}
					</div>
				</div>
				{metrics && metrics.length > 0 ? (
					<ul className="console-statstrip">
						{metrics.map((m) => (
							<li key={m.label}>
								<b style={m.tone ? { color: toneColor[m.tone] } : undefined}>
									{m.value}
								</b>
								<span>{m.label}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>
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
