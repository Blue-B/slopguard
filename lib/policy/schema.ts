import { z } from "zod";
import type { AgentPolicy } from "../agent/types.js";

export const DEFAULT_COMMENT_TEMPLATE = `### 🛡️ SlopGuard review: score **{{score}}/100** ({{verdict}})

{{reasons}}

**Provenance**
{{provenance}}

---
Maintainer actions (comment one of these):
- \`/slop approve\` → remove quarantine, mark cleared
- \`/slop reject\` → close as AI slop (your explicit action)
- \`/slop false-positive\` → open a tuning issue & clear

<sub>SlopGuard never auto-closes. A human is always the final decision-maker. Tune via \`.github/SLOP_POLICY.yml\`.</sub>`;

// Full schema for .github/SLOP_POLICY.yml — everything optional w/ defaults.
export const PolicySchema = z
	.object({
		version: z.number().default(1),
		enabled: z.boolean().default(true),
		scan: z
			.object({
				pull_requests: z.boolean().default(true),
				issues: z.boolean().default(true),
			})
			.default({}),
		thresholds: z
			.object({
				quarantine: z.number().min(0).max(100).default(50),
				high_confidence: z.number().min(0).max(100).default(85),
			})
			.default({}),
		labels: z
			.object({
				quarantine: z.string().default("slop-quarantine"),
				approved: z.string().default("slop-cleared"),
				high_confidence: z.string().default("slop-high-confidence"),
			})
			.default({}),
		allowlist: z
			.object({
				authors: z.array(z.string()).default([]),
				paths: z.array(z.string()).default([]),
			})
			.default({}),
		heuristics: z
			.object({
				weight: z.number().min(0).max(1).default(0.4),
			})
			.default({}),
		llm: z
			.object({
				enabled: z.boolean().default(true),
				provider_order: z
					.array(z.string())
					.default(["gemini", "anthropic", "grok", "openai"]),
				max_diff_chars: z.number().min(500).default(16000),
			})
			.default({}),
		comment_template: z.string().default(DEFAULT_COMMENT_TEMPLATE),
		false_positive: z
			.object({
				open_issue: z.boolean().default(true),
				issue_label: z.string().default("slopguard-feedback"),
			})
			.default({}),
		// Outbound alerts on quarantine (Team plan). Destinations live in the
		// repo policy so there is no dashboard state to store.
		notify: z
			.object({
				slack_webhook: z.string().url().optional(),
				discord_webhook: z.string().url().optional(),
				webhook_url: z.string().url().optional(),
			})
			.default({}),
	})
	.default({});

export type Policy = z.infer<typeof PolicySchema>;

/** Parse arbitrary YAML-derived object into a validated Policy (with defaults). */
export function parsePolicy(raw: unknown): Policy {
	return PolicySchema.parse(raw ?? {});
}

/** Default policy when a repo has no SLOP_POLICY.yml. */
export function defaultPolicy(): Policy {
	return PolicySchema.parse({});
}

/** Project the full policy down to the slice the agent needs. */
export function toAgentPolicy(p: Policy): AgentPolicy {
	return {
		quarantineThreshold: p.thresholds.quarantine,
		highConfidenceThreshold: p.thresholds.high_confidence,
		heuristicWeight: p.heuristics.weight,
		llmEnabled: p.llm.enabled,
		providerOrder: p.llm.provider_order,
		maxDiffChars: p.llm.max_diff_chars,
	};
}
