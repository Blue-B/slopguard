// Shared types for the SlopGuard detection agent.
// Kept framework-free so they can be reused by the webhook, dashboard, and CLI.

export type SlopKind = "pull_request" | "issue";

/** Normalized input the agent scores. Built by the webhook from GitHub payloads. */
export interface SlopInput {
	kind: SlopKind;
	/** owner/repo */
	repo: string;
	number: number;
	title: string;
	/** PR/issue body (markdown) */
	body: string;
	/** unified diff for PRs; empty for issues */
	diff: string;
	author: string;
	/** files changed (PR only) */
	changedFiles: string[];
	additions: number;
	deletions: number;
	createdAt: string;
}

/** One fired heuristic signal. */
export interface HeuristicSignal {
	id: string;
	label: string;
	/** 0-100 contribution toward "this is slop" */
	weight: number;
	evidence?: string;
}

export interface HeuristicResult {
	/** 0-100 heuristic-only score */
	score: number;
	signals: HeuristicSignal[];
}

/** Structured verdict from the LLM judge. */
export interface LlmVerdict {
	/** 0-100, higher = more likely AI slop */
	score: number;
	verdict: "clean" | "suspicious" | "likely-slop";
	reasons: string[];
	/** provider that produced this verdict, or null if heuristics-only */
	provider: string | null;
	model: string | null;
}

/** Provenance metadata extracted from the contribution. */
export interface Provenance {
	/** Detected generator hints, e.g. ["chatgpt", "copilot"] */
	modelHints: string[];
	/** Stable fingerprint of the body+diff (for dedupe / "same prompt" detection) */
	promptFingerprint: string;
	/** Detected boilerplate phrases that leaked from a chat assistant */
	leakedAssistantPhrases: string[];
	createdAt: string;
	analyzedAt: string;
}

/** Minimal policy slice the agent needs (full schema lives in lib/policy). */
export interface AgentPolicy {
	quarantineThreshold: number;
	highConfidenceThreshold: number;
	heuristicWeight: number; // 0-1; llm weight = 1 - this
	llmEnabled: boolean;
	providerOrder: string[];
	maxDiffChars: number;
}

export const DEFAULT_AGENT_POLICY: AgentPolicy = {
	quarantineThreshold: Number(process.env.DEFAULT_SLOP_THRESHOLD ?? 50),
	highConfidenceThreshold: 85,
	heuristicWeight: 0.4,
	llmEnabled: true,
	providerOrder: (
		process.env.LLM_PROVIDER_ORDER ?? "gemini,anthropic,grok,openai"
	)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean),
	maxDiffChars: 16000,
};

/** Final agent output. */
export interface SlopResult {
	score: number; // 0-100 blended
	verdict: "clean" | "suspicious" | "likely-slop";
	shouldQuarantine: boolean;
	highConfidence: boolean;
	heuristics: HeuristicResult;
	llm: LlmVerdict;
	provenance: Provenance;
	/** human-readable bullet reasons merged from heuristics + llm */
	reasons: string[];
}
