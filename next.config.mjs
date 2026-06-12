/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Standalone output: a minimal self-contained server bundle. Drastically
	// reduces runtime memory + disk on small (256MB) hosts like Cloudtype.
	output: "standalone",
	// LangChain + Octokit are server-only; keep them out of the client bundle.
	serverExternalPackages: [
		"@langchain/langgraph",
		"@langchain/core",
		"@langchain/anthropic",
		"@langchain/openai",
		"@octokit/app",
		"@octokit/webhooks",
		"octokit",
		// SAML SP: native/wasm xmllint validator must not be webpack-bundled.
		"samlify",
		"@authenio/samlify-node-xmllint",
		"node-xmllint",
	],
	// Resolve ESM-style ".js" import specifiers to their TypeScript sources
	// (lib/** uses NodeNext-style ".js" extensions; webpack needs this mapping).
	webpack: (config) => {
		config.resolve.extensionAlias = {
			".js": [".ts", ".tsx", ".js"],
			".jsx": [".tsx", ".jsx"],
			".mjs": [".mts", ".mjs"],
		};
		return config;
	},
	// English lives at the root; /en is a common guess that should land there.
	async redirects() {
		return [
			{ source: "/en", destination: "/", permanent: true },
			{ source: "/en/:path*", destination: "/:path*", permanent: true },
		];
	},
	// Baseline security headers. CSP allows inline script/style because Next.js
	// emits inline bootstrapping; frame-ancestors 'none' replaces X-Frame-Options.
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains",
					},
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "DENY" },
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Content-Security-Policy",
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: blob: https:",
							"font-src 'self' data:",
							"connect-src 'self' https:",
							"frame-ancestors 'none'",
							"base-uri 'self'",
							"form-action 'self' https://buy.polar.sh https://polar.sh https://github.com",
						].join("; "),
					},
				],
			},
		];
	},
};

export default nextConfig;
