import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import ProfileMenu from "./ProfileMenu";

/**
 * Shared header for the signed-in "app" pages (account, dashboard, repo
 * dashboard). One consistent nav with a working EN/KO switch so these pages
 * stop drifting visually from each other.
 */
export default function AppNav({
	lang,
	enHref,
	koHref,
}: {
	lang: Lang;
	enHref: string;
	koHref: string;
}) {
	const ko = lang === "ko";
	const home = ko ? "/ko" : "/";
	return (
		<nav className="nav">
			<Link className="brand" href={home}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="/shield.svg" alt="SlopGuard" />
				SlopGuard
			</Link>
			<span className="nav-links">
				<Link href={home}>{ko ? "홈" : "Home"}</Link>
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
