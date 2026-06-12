import type { SlopInput, SlopResult } from "../agent/types.js";
import type { Policy } from "../policy/schema.js";
import type { InstallationClient } from "./app.js";
import { getAppBaseUrl } from "../env.js";

const MARKER = "<!-- slopguard:bot-comment -->";

const LABEL_COLORS: Record<string, string> = {
	quarantine: "d29922",
	approved: "2da44e",
	high_confidence: "cf222e",
	feedback: "8250df",
};

/** Idempotently ensure a label exists (create on 404). */
export async function ensureLabel(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	name: string,
	color = "ededed",
	description = "",
): Promise<void> {
	try {
		await octokit.rest.issues.getLabel({ owner, repo, name });
	} catch (err: unknown) {
		if ((err as { status?: number })?.status === 404) {
			await octokit.rest.issues
				.createLabel({ owner, repo, name, color, description })
				.catch(() => void 0);
		}
	}
}

export async function addLabels(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issue_number: number,
	labels: string[],
): Promise<void> {
	if (!labels.length) return;
	await octokit.rest.issues.addLabels({ owner, repo, issue_number, labels });
}

export async function removeLabel(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issue_number: number,
	name: string,
): Promise<void> {
	await octokit.rest.issues
		.removeLabel({ owner, repo, issue_number, name })
		.catch(() => void 0); // 404 if not present, fine
}

/** Author / path allowlist check. */
export function isAllowlisted(policy: Policy, input: SlopInput): boolean {
	if (policy.allowlist.authors.includes(input.author)) return true;
	const globs = policy.allowlist.paths;
	if (globs.length && input.changedFiles.length) {
		const matchAll = input.changedFiles.every((f) =>
			globs.some((g) => matchGlob(g, f)),
		);
		if (matchAll) return true;
	}
	return false;
}

// ReDoS-free glob matcher (DP). `*` matches within a path segment (no `/`),
// `**` matches across segments. No dynamic RegExp construction.
function matchGlob(glob: string, path: string): boolean {
	const STAR = "\u0001"; // single *
	const DSTAR = "\u0000"; // **
	const g = glob.replace(/\*\*/g, DSTAR).replace(/\*/g, STAR);
	const G = g.length;
	const P = path.length;
	const dp: boolean[][] = Array.from({ length: G + 1 }, () =>
		new Array<boolean>(P + 1).fill(false),
	);
	dp[0][0] = true;
	for (let i = 1; i <= G; i++) {
		if (g[i - 1] === STAR || g[i - 1] === DSTAR) dp[i][0] = dp[i - 1][0];
	}
	for (let i = 1; i <= G; i++) {
		const c = g[i - 1];
		for (let j = 1; j <= P; j++) {
			const pc = path[j - 1];
			if (c === DSTAR) {
				dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
			} else if (c === STAR) {
				dp[i][j] = dp[i - 1][j] || (pc !== "/" && dp[i][j - 1]);
			} else {
				dp[i][j] = dp[i - 1][j - 1] && c === pc;
			}
		}
	}
	return dp[G][P];
}

function provenanceBlock(result: SlopResult): string {
	const p = result.provenance;
	const lines = [
		`- model hints: ${p.modelHints.length ? p.modelHints.join(", ") : "none detected"}`,
		`- prompt fingerprint: \`${p.promptFingerprint}\``,
		`- leaked assistant phrases: ${p.leakedAssistantPhrases.length}`,
		`- analyzed at: ${p.analyzedAt}`,
	];
	if (result.llm.provider) {
		lines.unshift(`- judge: ${result.llm.provider} (${result.llm.model})`);
	} else {
		// reasons[0] carries the degrade reason (rate-limit vs none configured)
		const why = result.llm.reasons[0] ?? "heuristics-only";
		lines.unshift(`- judge: ${why}`);
	}
	return lines.join("\n");
}

/** Render the comment body from the policy template. */
export function renderComment(
	policy: Policy,
	input: SlopInput,
	result: SlopResult,
): string {
	const baseUrl = getAppBaseUrl();
	const dashboard = `${baseUrl}/dashboard/${input.repo}`;
	const body = policy.comment_template
		.replaceAll("{{score}}", String(result.score))
		.replaceAll("{{verdict}}", result.verdict)
		.replaceAll("{{threshold}}", String(policy.thresholds.quarantine))
		.replaceAll("{{reasons}}", result.reasons.join("\n"))
		.replaceAll("{{provenance}}", provenanceBlock(result))
		.replaceAll("{{approve_cmd}}", "`/slop approve`")
		.replaceAll("{{reject_cmd}}", "`/slop reject`")
		.replaceAll("{{fp_cmd}}", "`/slop false-positive`")
		.replaceAll("{{dashboard}}", dashboard);
	return `${MARKER}\n${body}`;
}

/** Post or update the SlopGuard comment (upsert by marker). */
export async function upsertComment(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issue_number: number,
	body: string,
): Promise<void> {
	const existing = await octokit.rest.issues
		.listComments({ owner, repo, issue_number, per_page: 100 })
		.then((r) => r.data.find((c) => c.body?.includes(MARKER)))
		.catch(() => undefined);

	if (existing) {
		await octokit.rest.issues.updateComment({
			owner,
			repo,
			comment_id: existing.id,
			body,
		});
	} else {
		await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number,
			body,
		});
	}
}

/** Create a tuning issue when a maintainer flags a false positive. */
export async function createFeedbackIssue(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	policy: Policy,
	sourceNumber: number,
	flaggedBy: string,
): Promise<void> {
	if (!policy.false_positive.open_issue) return;
	const label = policy.false_positive.issue_label;
	await ensureLabel(
		octokit,
		owner,
		repo,
		label,
		LABEL_COLORS.feedback,
		"SlopGuard tuning feedback",
	);
	await octokit.rest.issues.create({
		owner,
		repo,
		title: `SlopGuard false positive on #${sourceNumber}`,
		labels: [label],
		body: [
			`@${flaggedBy} flagged SlopGuard's verdict on #${sourceNumber} as a **false positive**.`,
			``,
			`Consider tuning \`.github/SLOP_POLICY.yml\`:`,
			`- raise \`thresholds.quarantine\``,
			`- add the author to \`allowlist.authors\``,
			`- add affected paths to \`allowlist.paths\``,
			`- lower \`heuristics.weight\``,
		].join("\n"),
	});
}

export { LABEL_COLORS };
