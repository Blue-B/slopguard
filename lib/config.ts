// Single source of truth for external URLs and the public site origin.
// Avoids the slug/URL drift that produced a 404 install link.

export const APP_SLUG = process.env.GITHUB_APP_SLUG ?? "slopguard-blue-b-2026";

/** Public install/manage page for the hosted GitHub App. */
export const INSTALL_URL = `https://github.com/apps/${APP_SLUG}/installations/new`;

/** Polar customer portal (override per-org via env). */
export const PORTAL_URL =
	process.env.POLAR_PORTAL_URL ?? "https://polar.sh/slopguard/portal";

/** Canonical public site origin (used for metadata / sitemap). */
export const SITE_URL = process.env.APP_BASE_URL ?? "https://slopguard.app";

export const REPO_URL = "https://github.com/Blue-B/slopguard";
