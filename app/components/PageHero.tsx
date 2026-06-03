import type { ReactNode } from "react";

/**
 * Shared page header used across every marketing/app page. A mono "terminal"
 * rule (faux path + ticks) over an eyebrow, big title, and optional sub, so
 * all pages share one framed, art-directed header instead of ad-hoc markup.
 */
export default function PageHero({
	eyebrow,
	title,
	sub,
	children,
}: {
	path?: string;
	eyebrow: string;
	title: ReactNode;
	sub?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<header className="page-hero">
			<span className="eyebrow">{eyebrow}</span>
			<h1 className="page-h1">{title}</h1>
			{sub ? <p className="page-sub">{sub}</p> : null}
			{children}
		</header>
	);
}
