import type { HeuristicResult, HeuristicSignal, SlopInput } from "../types.js";

// Phrases that leak from chat assistants into PRs/issues.
const ASSISTANT_BOILERPLATE = [
	/as an ai language model/i,
	/as a large language model/i,
	/i hope this helps/i,
	/i'?m sorry,? but i (can'?t|cannot)/i,
	/here'?s? (an?|the) (updated|revised|complete|improved) (version|code|implementation)/i,
	/feel free to (ask|reach out|modify|customize)/i,
	/let me know if you (have|need|'d like)/i,
	/certainly!? (here|below)/i,
	/below is (an?|the)/i,
	/this (code|implementation|solution) (should|will) (work|help|solve)/i,
	/\bin summary\b/i,
	/\bnote that\b.*\bplease\b/i,
];

// Headers that are suspiciously decorated (emoji-laden marketing tone).
const EMOJI_HEADER = /^#{1,6}\s.*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

// "## Features ✨ / ## Benefits 🚀" style listicle headers common in AI output.
const MARKETING_HEADERS = [
	/^#{1,6}\s*(key )?features\b/im,
	/^#{1,6}\s*benefits\b/im,
	/^#{1,6}\s*overview\b/im,
	/^#{1,6}\s*conclusion\b/im,
	/^#{1,6}\s*(getting started|how it works)\b/im,
];

// Prompt-injection attempts aimed at the SlopGuard LLM judge. These are a
// STRONG slop/abuse signal: legitimate contributions never instruct the
// reviewer to change its score. (Tunable via allowlist for prompt-eng repos.)
const PROMPT_INJECTION = [
	/ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions?|prompts?|rules?)/i,
	/disregard (the |all )?(previous|above|prior|system)/i,
	/\byou are now\b/i,
	/\bsystem prompt\b/i,
	/\b(new|updated|revised) instructions?\s*:/i,
	/(set|output|return|give|assign) (the )?(slop[_ ]?)?score\s*(to|=|:)?\s*0\b/i,
	/\bthis (pr|issue|code) is (not slop|legitimate|perfect|clean)\b/i,
	/reveal (your |the )?(system )?(prompt|instructions)/i,
	/\bact as\b.*\b(reviewer|approver|maintainer|assistant)\b/i,
	/\bdo not (flag|quarantine|label|reject|mark)\b/i,
	/\bmark (this|it) as (approved|safe|clean|not slop|legitimate)\b/i,
];

function clamp(n: number, lo = 0, hi = 100): number {
	return Math.max(lo, Math.min(hi, n));
}

/**
 * Pure, deterministic heuristics. Runs with zero API keys.
 * Each signal carries a weight (its contribution if fired); the node sums
 * fired weights and clamps to 0-100.
 */
export function runHeuristics(input: SlopInput): HeuristicResult {
	const signals: HeuristicSignal[] = [];
	const text = `${input.title}\n\n${input.body}`;
	const bodyLen = input.body.trim().length;

	// 1) Leaked assistant boilerplate
	const leaked = ASSISTANT_BOILERPLATE.filter((re) => re.test(text)).length;
	if (leaked > 0) {
		signals.push({
			id: "boilerplate_disclaimers",
			label: `Chat-assistant boilerplate phrases (${leaked})`,
			weight: Math.min(52, 28 + leaked * 11),
			evidence: ASSISTANT_BOILERPLATE.find((re) => re.test(text))?.source,
		});
	}

	// 2) Emoji / marketing section headers
	const lines = text.split("\n");
	const emojiHeaders = lines.filter((l) => EMOJI_HEADER.test(l)).length;
	const marketingHeaders = MARKETING_HEADERS.filter((re) =>
		re.test(text),
	).length;
	// Issues with even a single listicle header (Overview/Benefits/Conclusion)
	// are a classic AI-spam tell; PRs need >=2 to avoid flagging real templates.
	const listicleFires =
		emojiHeaders >= 1 ||
		marketingHeaders >= 2 ||
		(input.kind === "issue" && marketingHeaders >= 1);
	if (listicleFires) {
		signals.push({
			id: "emoji_section_headers",
			label: `Emoji/marketing headers (emoji:${emojiHeaders}, listicle:${marketingHeaders})`,
			weight: Math.min(42, emojiHeaders * 18 + marketingHeaders * 14),
		});
	}

	// 3) Empty / near-empty description
	if (input.kind === "pull_request" && bodyLen < 30) {
		signals.push({
			id: "empty_pr_description",
			label: "PR description is empty or near-empty",
			weight: 18,
		});
	}
	if (input.kind === "issue" && bodyLen < 20) {
		signals.push({
			id: "empty_issue_body",
			label: "Issue body is empty or near-empty",
			weight: 15,
		});
	}

	// 4) Giant unfocused diff
	const churn = input.additions + input.deletions;
	const files = input.changedFiles.length;
	if (churn > 600 && files > 10 && bodyLen < 200) {
		signals.push({
			id: "giant_unfocused_diff",
			label: `Large diff (${churn} lines / ${files} files) with thin description`,
			weight: 30,
		});
	}

	// 5) Title looks auto-generated ("Update X", "Add feature", overly generic)
	if (
		/^(update|add|fix|improve|refactor)\b/i.test(input.title.trim()) &&
		input.title.trim().length < 18
	) {
		signals.push({
			id: "generic_title",
			label: "Generic auto-generated-looking title",
			weight: 8,
		});
	}

	// 6) Hallucinated-API smell: references files not in the changed set (PR only)
	if (input.kind === "pull_request" && input.diff) {
		const referenced = new Set<string>();
		const re = /(?:import|require|from)\s+['"]([^'"]+)['"]/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(input.diff)) !== null) {
			const p = m[1];
			if (p.startsWith(".")) referenced.add(p);
		}
		if (referenced.size > 6) {
			signals.push({
				id: "hallucinated_apis",
				label: `Many relative imports (${referenced.size}) — verify they resolve`,
				weight: 10,
			});
		}
	}

	// 7) Excessive inline explanatory comments (AI loves over-commenting)
	if (input.diff) {
		const added = input.diff.split("\n").filter((l) => l.startsWith("+"));
		const commentLines = added.filter((l) =>
			/^\+\s*(\/\/|#|\*)/.test(l),
		).length;
		const ratio = added.length ? commentLines / added.length : 0;
		if (added.length > 30 && ratio > 0.35) {
			signals.push({
				id: "over_commenting",
				label: `Unusually high comment ratio in added code (${Math.round(ratio * 100)}%)`,
				weight: 16,
			});
		}
	}

	// 8) Prompt-injection attempt against the LLM judge (abuse → high slop).
	const injectionHaystack = `${input.title}\n${input.body}\n${input.diff}`;
	const injectionMatches = PROMPT_INJECTION.filter((re) =>
		re.test(injectionHaystack),
	);
	if (injectionMatches.length > 0) {
		signals.push({
			id: "prompt_injection",
			label: `Prompt-injection attempt against the reviewer (${injectionMatches.length})`,
			weight: Math.min(78, 48 + injectionMatches.length * 12),
			evidence: injectionMatches[0]?.source,
		});
	}

	const score = clamp(signals.reduce((s, sig) => s + sig.weight, 0));
	return { score, signals };
}
