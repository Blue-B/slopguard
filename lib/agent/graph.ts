import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import {
	DEFAULT_AGENT_POLICY,
	type AgentPolicy,
	type HeuristicResult,
	type LlmVerdict,
	type Provenance,
	type SlopInput,
	type SlopResult,
} from "./types.js";
import { runHeuristics } from "./nodes/staticHeuristics.js";
import { extractProvenance } from "./nodes/provenance.js";
import { runLlmAnalysis } from "./nodes/llmAnalysis.js";
import { computeScore } from "./nodes/score.js";

// Graph state
const SlopState = Annotation.Root({
	input: Annotation<SlopInput>,
	policy: Annotation<AgentPolicy>,
	heuristics: Annotation<HeuristicResult | undefined>,
	provenance: Annotation<Provenance | undefined>,
	llm: Annotation<LlmVerdict | undefined>,
	result: Annotation<SlopResult | undefined>,
});

// Nodes
// 1) deterministic, zero-cost static pass (heuristics + provenance)
function analyzeStatic(state: typeof SlopState.State) {
	return {
		heuristics: runHeuristics(state.input),
		provenance: extractProvenance(state.input),
	};
}

// 2) LLM judge (degrades to neutral if no keys / error)
async function llmJudge(state: typeof SlopState.State) {
	return { llm: await runLlmAnalysis(state.input, state.policy) };
}

// 3) blend → final SlopResult
function score(state: typeof SlopState.State) {
	const result = computeScore(
		state.heuristics!,
		state.llm!,
		state.provenance!,
		state.policy,
	);
	return { result };
}

// Wiring
const workflow = new StateGraph(SlopState)
	.addNode("analyze_static", analyzeStatic)
	.addNode("llm_judge", llmJudge)
	.addNode("score", score)
	.addEdge(START, "analyze_static")
	.addEdge("analyze_static", "llm_judge")
	.addEdge("llm_judge", "score")
	.addEdge("score", END);

export const slopGraph = workflow.compile();

/**
 * Public entrypoint: analyze a normalized contribution → SlopResult.
 * Used by the webhook (Step 3) and the CLI smoke test.
 */
export async function analyzeSlop(
	input: SlopInput,
	policy: AgentPolicy = DEFAULT_AGENT_POLICY,
): Promise<SlopResult> {
	const final = await slopGraph.invoke({ input, policy });
	if (!final.result) throw new Error("agent produced no result");
	return final.result;
}
