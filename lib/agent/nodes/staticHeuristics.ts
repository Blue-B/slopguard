import type { HeuristicResult, HeuristicSignal, SlopInput } from "../types.js";

// Machine-certain phrases: chat assistants leak these, humans essentially
// never type them in their own voice.
const STRONG_BOILERPLATE = [
	/as an ai language model/i,
	/as a large language model/i,
	/i'?m sorry,? but i (can'?t|cannot)/i,
	/here'?s? (an?|the) (updated|revised|complete|improved) (version|code|implementation)/i,
	/certainly!? (here|below|i)/i,
	/below is (an?|the)/i,
	/this (code|implementation|solution) (should|will) (work|help|solve)/i,
];

// Polite filler that AI overuses but real humans also write. Low weight:
// these must co-occur with structural signals to matter, so a courteous
// human bug report never gets quarantined on manners alone.
const POLITE_PHRASES = [
	/i hope this helps/i,
	/feel free to (ask|reach out|modify|customize)/i,
	/let me know if/i,
	/\bin summary\b/i,
	/\bnote that\b.*\bplease\b/i,
];

// 2026-era agent-report tells: coding agents narrate their work in a
// distinctive consultant voice when they file issues/PRs.
const AGENT_REPORT = [
	/after conducting (a |an )?(comprehensive|thorough|detailed) (analysis|review|investigation)/i,
	/comprehensive (analysis|review|audit) of (the |this |your |all )?(codebase|repository|repo|project)/i,
	/this (pull request|pr) introduces (a )?comprehensive/i,
	/i'?ve identified several (areas|issues|improvements|opportunities)/i,
	/\banalysis (results|complete)\b/i,
	/no changes (are |were )?(needed|required|necessary)/i,
	/\b(addresses|per|resolves) the user'?s (concern|request|feedback)\b/i,
	/enhance(s)? (usability|maintainability|user experience|code quality|readability)/i,
];

// Marketing superlatives, fired only in pairs (one "seamless" is forgivable).
const SUPERLATIVES =
	/\b(ultimate|extraordinary|revolutionary|game.?chang\w*|cutting.?edge|seamless(?:ly)?|effortless(?:ly)?|blazing(?:ly)? fast)\b/gi;

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

// "### **Problem Statement**" style bold-decorated headers (AI loves these).
const BOLD_HEADER = /^#{1,6}\s*\*\*[^*\n]+\*\*/;

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

// Phrase matching must ignore quoted material: a human pasting a model
// transcript into a bug report quotes "As an AI..." without being slop.
function stripQuoted(text: string): string {
	let t = text.replace(/```[\s\S]*?```/g, " ");
	// A truncated body can leave an unterminated fence; everything after it
	// is quoted material too.
	const dangling = t.indexOf("```");
	if (dangling !== -1) t = t.slice(0, dangling);
	return t
		.split("\n")
		.filter((l) => !/^\s*>/.test(l))
		.join("\n");
}

// Concrete anchors a real report tends to carry: file paths, line refs,
// code fences, or links into source.
function hasConcreteReference(input: SlopInput): boolean {
	const t = `${input.title}\n${input.body}`;
	return (
		/```/.test(input.body) ||
		/\b[\w./-]+\.(ts|tsx|js|jsx|mjs|py|go|rs|java|kt|c|h|cpp|cs|rb|php|swift|sh|yml|yaml|toml|json)\b/i.test(
			t,
		) ||
		/\bline\s+\d+/i.test(t) ||
		/[a-z_][\w.]*\(\)/i.test(t) ||
		/github\.com\/[\w-]+\/[\w-]+\/(blob|blame|commit)/i.test(t)
	);
}

/**
 * Pure, deterministic heuristics. Runs with zero API keys.
 * Each signal carries a weight (its contribution if fired); the node sums
 * fired weights and clamps to 0-100.
 *
 * Design rule: no single human-plausible behavior (politeness, a template,
 * one decorated header) may cross the quarantine threshold on its own;
 * machine-certain tells carry the big weights.
 */
export function runHeuristics(input: SlopInput): HeuristicResult {
	const signals: HeuristicSignal[] = [];
	const text = `${input.title}\n\n${input.body}`;
	const prose = stripQuoted(text);
	const bodyLen = input.body.trim().length;

	// 1a) Leaked assistant boilerplate (machine-certain, prose only)
	const leaked = STRONG_BOILERPLATE.filter((re) => re.test(prose)).length;
	if (leaked > 0) {
		signals.push({
			id: "boilerplate_disclaimers",
			label: `Chat-assistant boilerplate phrases (${leaked})`,
			weight: Math.min(52, 28 + leaked * 11),
			evidence: STRONG_BOILERPLATE.find((re) => re.test(prose))?.source,
		});
	}

	// 1b) Polite filler (human-plausible, low weight, co-occurrence fodder)
	const polite = POLITE_PHRASES.filter((re) => re.test(prose)).length;
	if (polite > 0) {
		signals.push({
			id: "polite_filler",
			label: `Assistant-style polite filler (${polite})`,
			weight: Math.min(24, polite * 8),
		});
	}

	// 1c) Agent-report voice ("After conducting a comprehensive analysis…")
	const agentTells = AGENT_REPORT.filter((re) => re.test(prose)).length;
	if (agentTells > 0) {
		signals.push({
			id: "agent_report_voice",
			label: `Agent-report narration (${agentTells})`,
			weight: Math.min(54, 30 + agentTells * 12),
			evidence: AGENT_REPORT.find((re) => re.test(prose))?.source,
		});
	}

	// 1d) Marketing superlatives, two or more distinct hits
	const superlatives = new Set(
		(prose.match(SUPERLATIVES) ?? []).map((s) => s.toLowerCase()),
	).size;
	if (superlatives >= 2) {
		signals.push({
			id: "marketing_superlatives",
			label: `Marketing superlatives (${superlatives})`,
			weight: Math.min(26, 10 + superlatives * 8),
		});
	}

	// 2) Emoji / marketing / bold-decorated section headers
	const lines = text.split("\n");
	const emojiHeaders = lines.filter((l) => EMOJI_HEADER.test(l)).length;
	const boldHeaders = lines.filter((l) => BOLD_HEADER.test(l)).length;
	const marketingHeaders = MARKETING_HEADERS.filter((re) =>
		re.test(text),
	).length;
	// Issues with even a single listicle header (Overview/Benefits/Conclusion)
	// are a classic AI-spam tell; PRs need >=2 to avoid flagging real templates.
	const listicleFires =
		emojiHeaders >= 1 ||
		marketingHeaders >= 2 ||
		boldHeaders >= 3 ||
		(input.kind === "issue" && marketingHeaders >= 1);
	if (listicleFires) {
		signals.push({
			id: "emoji_section_headers",
			label: `Decorated headers (emoji:${emojiHeaders}, listicle:${marketingHeaders}, bold:${boldHeaders})`,
			// A wall of bold-decorated headers is machine formatting; let it
			// clear the bar on its own.
			weight: Math.min(
				boldHeaders >= 8 ? 50 : 42,
				emojiHeaders * 18 + marketingHeaders * 14 + boldHeaders * 10,
			),
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

	// 4b) No-op PR: a confident write-up wrapping zero code changes is an
	// agent filing busywork, not a contribution.
	if (input.kind === "pull_request" && churn === 0 && bodyLen > 120) {
		signals.push({
			id: "noop_pr",
			label: "PR changes no code despite a substantial write-up",
			weight: 32,
		});
	}

	// 4c) Dramatic claim with nothing to grab: "critical/vulnerability/leak"
	// in an issue that cites no file, line, code, or link.
	if (
		input.kind === "issue" &&
		/\b(critical|severe|urgent|vulnerab\w+|security|memory leak|data loss)\b/i.test(
			text,
		) &&
		!hasConcreteReference(input) &&
		bodyLen > 80
	) {
		signals.push({
			id: "unsubstantiated_claim",
			label: "Dramatic claim with no file/line/code reference",
			weight: 24,
		});
	}

	// 4d) Content-free praise/filler issue: courteous noises and decoration
	// wrapped around nothing a maintainer could act on.
	if (
		input.kind === "issue" &&
		bodyLen >= 40 &&
		bodyLen <= 600 &&
		!hasConcreteReference(input) &&
		(polite >= 1 || listicleFires || superlatives >= 2)
	) {
		signals.push({
			id: "no_actionable_content",
			label: "No actionable content (no file, line, code, or link)",
			weight: 22,
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
