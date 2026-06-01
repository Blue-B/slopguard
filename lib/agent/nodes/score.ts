import type {
	AgentPolicy,
	HeuristicResult,
	LlmVerdict,
	Provenance,
	SlopResult,
} from "../types.js";

function clamp(n: number, lo = 0, hi = 100): number {
	return Math.max(lo, Math.min(hi, Math.round(n)));
}

function verdictFromScore(
	score: number,
	policy: AgentPolicy,
): SlopResult["verdict"] {
	if (score >= policy.highConfidenceThreshold) return "likely-slop";
	if (score >= policy.quarantineThreshold) return "suspicious";
	return "clean";
}

/**
 * Blend heuristic + LLM scores.
 *  - If LLM produced a verdict (provider !== null): blended = w*heur + (1-w)*llm
 *  - If LLM unavailable (provider === null): heuristics-only.
 * Leaked assistant phrases add a small provenance bump (capped).
 */
export function computeScore(
	heuristics: HeuristicResult,
	llm: LlmVerdict,
	provenance: Provenance,
	policy: AgentPolicy,
): SlopResult {
	const w = Math.max(0, Math.min(1, policy.heuristicWeight));
	const llmActive = llm.provider !== null;

	let blended = llmActive
		? w * heuristics.score + (1 - w) * llm.score
		: heuristics.score;

	// Provenance nudge: leaked chat phrases are a strong tell.
	if (provenance.leakedAssistantPhrases.length > 0) {
		blended += Math.min(12, provenance.leakedAssistantPhrases.length * 6);
	}

	// Prompt-injection is abuse: floor the score so a tricked LLM cannot
	// dilute the heuristic signal below the quarantine threshold.
	if (heuristics.signals.some((s) => s.id === "prompt_injection")) {
		blended = Math.max(blended, policy.highConfidenceThreshold);
	}

	const score = clamp(blended);
	const verdict = verdictFromScore(score, policy);

	const reasons = [
		...heuristics.signals.map((s) => `• ${s.label}`),
		...llm.reasons.map((r) => `• ${r}`),
	];
	if (provenance.modelHints.length > 0) {
		reasons.push(`• Generator hints: ${provenance.modelHints.join(", ")}`);
	}
	if (reasons.length === 0) {
		reasons.push("• No slop signals detected.");
	}

	return {
		score,
		verdict,
		shouldQuarantine: score >= policy.quarantineThreshold,
		highConfidence: score >= policy.highConfidenceThreshold,
		heuristics,
		llm,
		provenance,
		reasons,
	};
}
