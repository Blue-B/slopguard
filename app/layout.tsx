import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const title = "SlopGuard: AI slop PR/Issue guard for maintainers";
const description =
	"A GitHub App that scores AI slop pull requests and issues, tags provenance, and quarantines them. A human always makes the final call. Never auto-closes.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title,
	description,
	applicationName: "SlopGuard",
	alternates: {
		canonical: "/",
		languages: { en: "/", ko: "/ko" },
	},
	openGraph: {
		type: "website",
		url: SITE_URL,
		siteName: "SlopGuard",
		title,
		description,
		images: ["/hero-emblem.png"],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["/hero-emblem.png"],
	},
	icons: { icon: "/icon.svg" },
	robots: { index: true, follow: true },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
