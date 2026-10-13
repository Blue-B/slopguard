import { NextResponse } from "next/server";
import { failedWebhookCount } from "@/lib/ops/deadletter";
import { installsSummary } from "@/lib/ops/installs";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Live dependency probe for Upstash. A configured-but-dead Redis is worse than
// an unconfigured one (data silently stops persisting), so we actually ping it.
async function redisHealth(): Promise<"ok" | "down" | "unconfigured"> {
	const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
	const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
	if (!url || !token) return "unconfigured";
	try {
		const r = new Redis({ url, token, retry: { retries: 1, backoff: () => 150 } });
		const pong = await Promise.race([
			r.ping(),
			new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
		]);
		return pong === "PONG" || pong === "pong" ? "ok" : "down";
	} catch {
		return "down";
	}
}

export async function GET() {
	const providers = {
		gemini: Boolean(process.env.GEMINI_API_KEY),
		anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
		grok: Boolean(process.env.XAI_API_KEY),
		openai: Boolean(process.env.OPENAI_API_KEY),
	};

	const githubAppConfigured = Boolean(
		process.env.GITHUB_APP_ID && process.env.GITHUB_WEBHOOK_SECRET,
	);
	const redis = await redisHealth();
	const failedWebhooks = await failedWebhookCount().catch(() => 0);
	const installs = await installsSummary().catch(() => ({ current: 0, recent: [] }));
	const anyLlm = Object.values(providers).some(Boolean);

	// Overall status: "ok" when every critical dependency is healthy, "degraded"
	// when the app runs but something users rely on is broken. A
	// watchdog can alert on anything other than "ok".
	const degraded =
		!githubAppConfigured ||
		!anyLlm ||
		redis === "down";

	return NextResponse.json(
		{
			name: "slopguard",
			status: degraded ? "degraded" : "ok",
			time: new Date().toISOString(),
			githubAppConfigured,
			redis,
			failedWebhooks,
			installs,
			llmProviders: providers,
			providerOrder: (
				process.env.LLM_PROVIDER_ORDER ?? "gemini,anthropic,grok,openai"
			)
				.split(",")
				.map((s) => s.trim()),
		},
		{ status: degraded ? 503 : 200 },
	);
}
