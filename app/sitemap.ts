import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	// public, indexable pages (account/dashboard are auth-gated, excluded)
	const pages: { path: string; priority: number }[] = [
		{ path: "/", priority: 1 },
		{ path: "/how-it-works", priority: 0.7 },
		{ path: "/docs", priority: 0.6 },
		{ path: "/install", priority: 0.6 },
		{ path: "/setup", priority: 0.3 },
	];
	const entries: MetadataRoute.Sitemap = [];
	for (const { path, priority } of pages) {
		entries.push({ url: `${SITE_URL}${path}`, lastModified: now, priority });
		// Korean variants live under /ko (setup has no /ko route)
		if (path !== "/setup") {
			const ko = path === "/" ? "/ko" : `/ko${path}`;
			entries.push({
				url: `${SITE_URL}${ko}`,
				lastModified: now,
				priority: Math.max(0.3, priority - 0.1),
			});
		}
	}
	return entries;
}
