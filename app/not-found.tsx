import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = { title: "Page not found | SlopGuard" };

export default function NotFound() {
	return (
		<>
			<MarketingNav lang="en" enHref="/" koHref="/ko" />
			<main className="wide" style={{ padding: "72px 24px 96px" }}>
				<span className="eyebrow">404</span>
				<h1 className="page-h1">This page slipped through.</h1>
				<p className="page-sub">
					The page you are looking for does not exist or has moved. Even
					SlopGuard cannot triage a dead link.
				</p>
				<div className="btn-row" style={{ marginTop: 28 }}>
					<Link className="btn btn-primary btn-lg" href="/">
						Back to home
					</Link>
					<Link className="btn btn-ghost btn-lg" href="/docs">
						Read the docs
					</Link>
				</div>
			</main>
			<SiteFooter lang="en" />
		</>
	);
}
