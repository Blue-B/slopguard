import type { SlopInput, SlopResult } from "../agent/types.js";
import type { Policy } from "../policy/schema.js";
import type { InstallationClient } from "./app.js";
import { getAppBaseUrl } from "../env.js";
import { loadPolicy } from "../policy/load.js";

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

/**
 * Label + comment a scored contribution. A maintainer's earlier
 * `/slop approve` (approved label) is final: new commits never re-quarantine.
 */
export async function applyVerdict(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	policy: Policy,
	input: SlopInput,
	result: SlopResult,
): Promise<"clean" | "quarantined" | "approved"> {
	const qLabel = policy.labels.quarantine;

	if (!result.shouldQuarantine) {
		// Clean now, clear a stale quarantine label if present (e.g. PR updated).
		await removeLabel(octokit, owner, repo, input.number, qLabel);
		return "clean";
	}

	const current = await octokit.rest.issues
		.listLabelsOnIssue({ owner, repo, issue_number: input.number })
		.then((r) => r.data.map((l) => l.name))
		.catch(() => [] as string[]);
	if (current.includes(policy.labels.approved)) return "approved";

	await ensureLabel(
		octokit,
		owner,
		repo,
		qLabel,
		LABEL_COLORS.quarantine,
		"Held for maintainer review by SlopGuard",
	);
	const labels = [qLabel];
	if (result.highConfidence) {
		await ensureLabel(
			octokit,
			owner,
			repo,
			policy.labels.high_confidence,
			LABEL_COLORS.high_confidence,
			"High-confidence AI slop",
		);
		labels.push(policy.labels.high_confidence);
	}
	await addLabels(octokit, owner, repo, input.number, labels);
	await upsertComment(
		octokit,
		owner,
		repo,
		input.number,
		renderComment(policy, input, result),
	);
	return "quarantined";
}

const MAINTAINER_PERMS = new Set(["admin", "write", "maintain"]);

async function isMaintainer(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	username: string,
): Promise<boolean> {
	try {
		const r = await octokit.rest.repos.getCollaboratorPermissionLevel({
			owner,
			repo,
			username,
		});
		return (
			MAINTAINER_PERMS.has(r.data.permission) ||
			MAINTAINER_PERMS.has(r.data.role_name ?? "")
		);
	} catch {
		return false;
	}
}

/**
 * /slop command handling (human-in-the-loop). Returns the outcome for
 * callers that track it, or null when nothing ran.
 */
export async function runSlopCommand(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issueNumber: number,
	commenter: string,
	body: string,
): Promise<{ outcome: "cleared" | "confirmed"; policy: Policy } | null> {
	const m = body.match(/^\s*\/slop\s+(approve|reject|false-positive|fp)\b/im);
	if (!m) return null;
	const cmd = m[1].toLowerCase();

	if (!(await isMaintainer(octokit, owner, repo, commenter))) {
		await octokit.rest.issues
			.createComment({
				owner,
				repo,
				issue_number: issueNumber,
				body: `@${commenter} only maintainers (write access) can run SlopGuard commands.`,
			})
			.catch(() => void 0);
		return null;
	}

	const policy = await loadPolicy(octokit, owner, repo);
	const qLabel = policy.labels.quarantine;

	if (cmd === "approve") {
		await removeLabel(octokit, owner, repo, issueNumber, qLabel);
		await removeLabel(
			octokit,
			owner,
			repo,
			issueNumber,
			policy.labels.high_confidence,
		);
		await ensureLabel(
			octokit,
			owner,
			repo,
			policy.labels.approved,
			LABEL_COLORS.approved,
			"Cleared by maintainer",
		);
		await addLabels(octokit, owner, repo, issueNumber, [
			policy.labels.approved,
		]);
		await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: issueNumber,
			body: `✅ Quarantine cleared by @${commenter}. Thanks for reviewing!`,
		});
		return { outcome: "cleared", policy };
	}

	if (cmd === "reject") {
		await octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: issueNumber,
			body: `❌ Closed as AI slop by @${commenter} (explicit maintainer action).`,
		});
		await octokit.rest.issues.update({
			owner,
			repo,
			issue_number: issueNumber,
			state: "closed",
			state_reason: "not_planned",
		});
		return { outcome: "confirmed", policy };
	}

	// false-positive / fp
	await createFeedbackIssue(
		octokit,
		owner,
		repo,
		policy,
		issueNumber,
		commenter,
	);
	await removeLabel(octokit, owner, repo, issueNumber, qLabel);
	await octokit.rest.issues.createComment({
		owner,
		repo,
		issue_number: issueNumber,
		body: `🙏 Marked as false positive by @${commenter}. Quarantine cleared and a tuning issue was opened. Sorry for the noise!`,
	});
	return { outcome: "cleared", policy };
}

export { LABEL_COLORS };
