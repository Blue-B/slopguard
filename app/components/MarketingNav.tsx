import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import ProfileMenu from "./ProfileMenu";

/**
 * One header for every marketing page (home, how-it-works, pricing). The links
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
	active?: "how" | "pricing" | "docs";
}) {
	const ko = lang === "ko";
	const home = ko ? "/ko" : "/";
	const how = ko ? "/ko/how-it-works" : "/how-it-works";
	const pricing = ko ? "/ko/pricing" : "/pricing";
	const docs = ko ? "/ko/docs" : "/docs";
	const install = ko ? "/ko/install" : "/install";
	const t = ko
		? { how: "동작 방식", pricing: "가격", docs: "문서", install: "설치" }
		: {
				how: "How it works",
				pricing: "Pricing",
				docs: "Docs",
				install: "Install",
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
				<Link className={active === "pricing" ? "on" : ""} href={pricing}>
					{t.pricing}
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
				<Link className="btn btn-primary nav-cta" href={install}>
					{t.install}
				</Link>
				<ProfileMenu lang={lang} />
			</span>
		</nav>
	);
}
