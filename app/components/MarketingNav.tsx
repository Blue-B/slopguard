import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import ProfileMenu from "./ProfileMenu";

/**
 * One header for every marketing page (home, how-it-works, docs). The links
 * point at real routes, not in-page anchors, so the top nav behaves like a
 * real site: clicking changes the page. enHref/koHref are the current page's
 * own URLs so the language switch stays in place.
 */
export default function MarketingNav({
	lang,
	enHref,
	koHref,
	active,
}: {
	lang: Lang;
	enHref: string;
	koHref: string;
	active?: "how" | "docs";
}) {
	const ko = lang === "ko";
	const home = ko ? "/ko" : "/";
	const how = ko ? "/ko/how-it-works" : "/how-it-works";
	const docs = ko ? "/ko/docs" : "/docs";
	const t = ko
		? { how: "동작 방식", docs: "문서" }
		: {
				how: "How it works",
				docs: "Docs",
			};
	return (
		<nav className="nav">
			<Link className="brand" href={home}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="/shield.svg" alt="SlopGuard" />
				SlopGuard
			</Link>
			<span className="nav-links">
				<Link className={active === "how" ? "on" : ""} href={how}>
					{t.how}
				</Link>
				<Link className={active === "docs" ? "on" : ""} href={docs}>
					{t.docs}
				</Link>
				<span className="lang-switch">
					<Link className={lang === "en" ? "on" : ""} href={enHref}>
						EN
					</Link>
					<Link className={lang === "ko" ? "on" : ""} href={koHref}>
						KO
					</Link>
				</span>
				<ProfileMenu lang={lang} />
			</span>
		</nav>
	);
}
