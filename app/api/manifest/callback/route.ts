import { Octokit } from "octokit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GitHub App "create from manifest" callback.
 * GitHub redirects here with ?code=... after the maintainer creates the App.
 * We exchange the code for the App credentials and show them ONCE so they can
 * be pasted into .env.local / Vercel env. (Secrets are never persisted.)
 */
export async function GET(req: Request) {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	if (!code) {
		return new Response("Missing ?code from GitHub manifest flow.", {
			status: 400,
		});
	}

	try {
		const octokit = new Octokit();
		const { data } = await octokit.request(
			"POST /app-manifests/{code}/conversions",
			{ code },
		);

		const pemB64 = Buffer.from(data.pem ?? "", "utf8").toString("base64");
		const env = [
			`GITHUB_APP_ID=${data.id}`,
			`GITHUB_APP_CLIENT_ID=${data.client_id}`,
			`GITHUB_APP_CLIENT_SECRET=${data.client_secret}`,
			`GITHUB_WEBHOOK_SECRET=${data.webhook_secret}`,
			`GITHUB_APP_PRIVATE_KEY_BASE64=${pemB64}`,
		].join("\n");

		const html = `<!doctype html><html><head><meta charset="utf-8">
<title>SlopGuard, App created</title>
<style>body{font-family:ui-sans-serif,system-ui;background:#0d1117;color:#e6edf3;max-width:820px;margin:40px auto;padding:0 20px}
code,pre{background:#161b22;border:1px solid #30363d;border-radius:8px}
pre{padding:16px;white-space:pre-wrap;word-break:break-all}
a{color:#d29922}.ok{color:#2da44e}</style></head><body>
<h1>✅ App "<code>${data.slug}</code>" created</h1>
<p class="ok">Copy these into <code>.env.local</code> (local) and your Vercel project env, then redeploy:</p>
<pre>${env.replace(/</g, "&lt;")}</pre>
<p><strong>Next:</strong> install it on a repo →
<a href="${data.html_url}/installations/new">${data.html_url}/installations/new</a></p>
<p style="color:#8b949e">These secrets are shown once and are not stored by SlopGuard.</p>
</body></html>`;

		return new Response(html, {
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return new Response(`Manifest conversion failed: ${message}`, {
			status: 500,
		});
	}
}
