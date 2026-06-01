import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	return [
		{ url: `${SITE_URL}/`, lastModified: now, priority: 1 },
		{ url: `${SITE_URL}/ko`, lastModified: now, priority: 0.9 },
		{ url: `${SITE_URL}/setup`, lastModified: now, priority: 0.5 },
	];
}
