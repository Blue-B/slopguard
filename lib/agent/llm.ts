import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface ResolvedModel {
	model: BaseChatModel;
	provider: string;
	modelName: string;
}

/** Is a given provider configured (has an API key)? */
export function providerAvailable(provider: string): boolean {
	switch (provider) {
		case "gemini":
			return Boolean(process.env.GEMINI_API_KEY);
		case "anthropic":
			return Boolean(process.env.ANTHROPIC_API_KEY);
		case "grok":
			return Boolean(process.env.XAI_API_KEY);
		case "openai":
			return Boolean(process.env.OPENAI_API_KEY);
		default:
			return false;
	}
}

export async function buildProvider(
	provider: string,
): Promise<ResolvedModel | null> {
	return build(provider);
}

async function build(provider: string): Promise<ResolvedModel | null> {
	if (!providerAvailable(provider)) return null;

	if (provider === "gemini") {
		const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
		const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
		return {
			provider,
			modelName,
			model: new ChatGoogleGenerativeAI({
				model: modelName,
				temperature: 0,
				maxOutputTokens: 1024,
				// Don't burn the webhook window retrying a 429, fall back fast.
				maxRetries: 0,
				apiKey: process.env.GEMINI_API_KEY,
			}),
		};
	}

	if (provider === "anthropic") {
		const { ChatAnthropic } = await import("@langchain/anthropic");
		const modelName = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
		return {
			provider,
			modelName,
			model: new ChatAnthropic({
				model: modelName,
				temperature: 0,
				maxTokens: 1024,
				maxRetries: 0,
				apiKey: process.env.ANTHROPIC_API_KEY,
			}),
		};
	}

	if (provider === "grok") {
		const { ChatOpenAI } = await import("@langchain/openai");
		const modelName = process.env.XAI_MODEL ?? "grok-4";
		return {
			provider,
			modelName,
			model: new ChatOpenAI({
				model: modelName,
				temperature: 0,
				maxTokens: 1024,
				maxRetries: 0,
				apiKey: process.env.XAI_API_KEY,
				configuration: {
					baseURL: process.env.XAI_BASE_URL ?? "https://api.x.ai/v1",
				},
			}),
		};
	}

	if (provider === "openai") {
		const { ChatOpenAI } = await import("@langchain/openai");
		const modelName = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
		return {
			provider,
			modelName,
			model: new ChatOpenAI({
				model: modelName,
				temperature: 0,
				maxTokens: 1024,
				maxRetries: 0,
				apiKey: process.env.OPENAI_API_KEY,
			}),
		};
	}

	return null;
}

/**
 * Resolve the first available chat model in preference order.
 * Returns null when NO provider is configured → caller runs heuristics-only.
 */
export async function resolveModel(
	providerOrder: string[],
): Promise<ResolvedModel | null> {
	for (const provider of providerOrder) {
		const resolved = await build(provider);
		if (resolved) return resolved;
	}
	return null;
}
