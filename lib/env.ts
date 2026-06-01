// Centralized env access + GitHub App private-key normalization.

/** Normalize the App private key from either raw PEM or base64. */
export function getPrivateKey(): string {
	const b64 = process.env.GITHUB_APP_PRIVATE_KEY_BASE64;
	if (b64 && b64.trim()) {
		return Buffer.from(b64.trim(), "base64").toString("utf8");
	}
	const raw = process.env.GITHUB_APP_PRIVATE_KEY ?? "";
	// Allow pasting a PEM with literal "\n" escapes (common in .env files).
	return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export interface GitHubAppEnv {
	appId: string;
	privateKey: string;
	webhookSecret: string;
	clientId?: string;
	clientSecret?: string;
}

export function getGitHubAppEnv(): GitHubAppEnv {
	const appId = process.env.GITHUB_APP_ID ?? "";
	const privateKey = getPrivateKey();
	const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
	const missing: string[] = [];
	if (!appId) missing.push("GITHUB_APP_ID");
	if (!privateKey) missing.push("GITHUB_APP_PRIVATE_KEY(_BASE64)");
	if (!webhookSecret) missing.push("GITHUB_WEBHOOK_SECRET");
	if (missing.length) {
		throw new Error(
			`[slopguard] Missing GitHub App env: ${missing.join(", ")}. ` +
				`Set them in .env.local (local) or Vercel env (prod).`,
		);
	}
	return {
		appId,
		privateKey,
		webhookSecret,
		clientId: process.env.GITHUB_APP_CLIENT_ID || undefined,
		clientSecret: process.env.GITHUB_APP_CLIENT_SECRET || undefined,
	};
}

export interface PolarEnv {
	apiToken?: string;
	webhookSecret?: string;
	orgId?: string;
}

/** Polar (Merchant of Record) config. All optional — billing is opt-in. */
export function getPolarEnv(): PolarEnv {
	return {
		apiToken: process.env.POLAR_API_TOKEN || undefined,
		webhookSecret: process.env.POLAR_WEBHOOK_SECRET || undefined,
		orgId: process.env.POLAR_ORG_ID || undefined,
	};
}

export function getAppBaseUrl(): string {
	if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return "http://localhost:3000";
}
