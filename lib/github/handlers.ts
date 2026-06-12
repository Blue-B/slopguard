import type { App } from "@octokit/app";
import type { InstallationClient } from "./app.js";
import { analyzeSlop } from "../agent/graph.js";
import { loadPolicy } from "../policy/load.js";
import { toAgentPolicy } from "../policy/schema.js";
import { planForOwner } from "../billing/entitlement.js";
import { PLANS } from "../billing/plans.js";
import { recordAndDetect, CAMPAIGN_SCORE_BUMP } from "../agent/campaign.js";
import {
	getNetworkSignal,
	recordOutcome,
	recordSighting,
	recordTrendEvent,
} from "../intel/network.js";
import { recordInstallEvent } from "../ops/installs.js";
import { dispatchConsoleAlerts } from "../alerts/dispatch.js";
import { sendQuarantineAlerts } from "../notify.js";
import { buildIssueInput, buildPullRequestInput } from "./build-input.js";
import {
	addLabels,
	createFeedbackIssue,
	ensureLabel,
	isAllowlisted,
	LABEL_COLORS,
	removeLabel,
	renderComment,
	upsertComment,
} from "./actions.js";
import {
	getCachedAnalysis,
	inputCacheKey,
	setCachedAnalysis,
} from "../cache.js";
import { rateLimit } from "../util.js";

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

/** Shared analyze → label → comment pipeline for PRs and issues. */
async function review(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	input: Parameters<typeof renderComment>[1],
	isPrivate: boolean,
): Promise<void> {
	const policy = await loadPolicy(octokit, owner, repo);
	if (!policy.enabled) return;
	if (input.kind === "pull_request" && !policy.scan.pull_requests) return;
	if (input.kind === "issue" && !policy.scan.issues) return;
	if (isAllowlisted(policy, input)) {
		console.log(`[slopguard] allowlisted: ${input.repo}#${input.number}`);
		return;
	}

	// Resolve the owner's plan once (cached Polar lookup) -> entitlements.
	const plan = PLANS[await planForOwner(owner)];

	// Private repos are a paid feature (Pro/Team/Enterprise). Public = free.
	if (isPrivate && !plan.privateRepos) {
		console.log(
			`[slopguard] private repo on free plan, skipping: ${input.repo}#${input.number}`,
		);
		return;
	}

	// Rate-limit per repo to absorb PR-spam floods (configurable).
	if (!rateLimit(`analyze:${input.repo}`)) {
		console.warn(`[slopguard] rate-limited: ${input.repo}#${input.number}`);
		return;
	}

	// The real, enforced Free<->Paid difference: the hosted Free tier runs
	// heuristics-only (zero LLM cost to us), and paid tiers (managedLlm) add the
	// LLM judge that we pay for. This keeps our LLM bill tied to revenue and gives
	// paying customers genuinely deeper detection on the subtlest cases. (A
	// self-hoster can still wire their own LLM key in the source-available core;
	// this gate only governs OUR hosted LLM spend.)
	let agentPolicy = toAgentPolicy(policy);
	if (!plan.managedLlm) {
		agentPolicy = { ...agentPolicy, llmEnabled: false };
	}

	// Reuse a cached verdict for identical content (repeated synchronize events
	// or GitHub re-deliveries) to avoid re-invoking the LLM.
	const cacheKey = inputCacheKey(input);
	let result = getCachedAnalysis(cacheKey);
	if (!result) {
		result = await analyzeSlop(input, agentPolicy);
		setCachedAnalysis(cacheKey, result);
	}

	// Cross-repo bot-campaign detection (Pro/Team): the same prompt fingerprint
	// landing across several of the owner's repos boosts the score.
	if (plan.campaignDetection) {
		const camp = recordAndDetect(
			owner,
			result.provenance.promptFingerprint,
			input.repo,
			input.author,
		);
		if (camp) {
			const boosted = Math.min(100, result.score + CAMPAIGN_SCORE_BUMP);
			result = {
				...result,
				score: boosted,
				shouldQuarantine: boosted >= policy.thresholds.quarantine,
				highConfidence: boosted >= policy.thresholds.high_confidence,
				verdict:
					boosted >= policy.thresholds.high_confidence
						? "likely-slop"
						: boosted >= policy.thresholds.quarantine
							? "suspicious"
							: "clean",
				reasons: [
					...result.reasons,
					`• Cross-repo campaign: same prompt fingerprint in ${camp.repoCount} repo(s), ${camp.totalCount}x total`,
				],
			};
		}
	}

	// Network intelligence (Pro+, hosted-only): a fingerprint flagged across many
	// OTHER installations boosts the score; one repeatedly cleared as a false
	// positive network-wide is suppressed. Read before recording this sighting so
	// the counts reflect other owners, not us. Best-effort, never blocks.
	if (plan.networkIntel && policy.share_intel !== false) {
		const sig = await getNetworkSignal(
			result.provenance.promptFingerprint,
		).catch(() => null);
		if (sig && sig.delta !== 0) {
			const adjusted = Math.max(0, Math.min(100, result.score + sig.delta));
			result = {
				...result,
				score: adjusted,
				shouldQuarantine: adjusted >= policy.thresholds.quarantine,
				highConfidence: adjusted >= policy.thresholds.high_confidence,
				verdict:
					adjusted >= policy.thresholds.high_confidence
						? "likely-slop"
						: adjusted >= policy.thresholds.quarantine
							? "suspicious"
							: "clean",
				reasons: sig.reason
					? [...result.reasons, `• ${sig.reason}`]
					: result.reasons,
			};
		}
	}

	const qLabel = policy.labels.quarantine;

	if (!result.shouldQuarantine) {
		// Clean now, clear a stale quarantine label if present (e.g. PR updated).
		await removeLabel(octokit, owner, repo, input.number, qLabel);
		console.log(
			`[slopguard] clean ${input.repo}#${input.number} (${result.score})`,
		);
		return;
	}

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
	console.log(
		`[slopguard] quarantined ${input.repo}#${input.number} (${result.score})`,
	);

	// Outbound alerts (Team). Best-effort, time-boxed; never blocks the webhook.
	// Two independent configuration paths, both real and additive: policy-as-code
	// (.github/SLOP_POLICY.yml `notify:`) and the /alerts console (channels +
	// routing rules). If the same destination is configured in both, it receives
	// one message per path by design, they are separate surfaces.
	if (plan.alerts) {
		await sendQuarantineAlerts(policy.notify, input, result).catch(() => 0);
		await dispatchConsoleAlerts(owner, input, result).catch(() => 0);
	}

	// Contribute this sighting to the hosted network (anonymized). Every hosted
	// install feeds the network so the cross-customer signal grows; opt out with
	// share_intel: false. Best-effort, never blocks the webhook.
	if (policy.share_intel !== false) {
		await recordSighting(
			owner,
			repo,
			input.number,
			result.provenance.promptFingerprint,
		).catch(() => {});
	}
	// Long-term trend (hosting-only): count this quarantine in the owner's daily
	// bucket so the org dashboard can show history beyond GitHub's live window.
	await recordTrendEvent(owner, "quarantined").catch(() => {});
}

/** /slop command handling (human-in-the-loop). */
async function handleCommand(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issueNumber: number,
	commenter: string,
	body: string,
): Promise<void> {
	const m = body.match(/^\s*\/slop\s+(approve|reject|false-positive|fp)\b/im);
	if (!m) return;
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
		return;
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
		if (policy.share_intel !== false)
			await recordOutcome(owner, repo, issueNumber, "cleared").catch(() => {});
		await recordTrendEvent(owner, "cleared").catch(() => {});
		return;
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
		if (policy.share_intel !== false)
			await recordOutcome(owner, repo, issueNumber, "confirmed").catch(() => {});
		return;
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
	if (policy.share_intel !== false)
		await recordOutcome(owner, repo, issueNumber, "cleared").catch(() => {});
	await recordTrendEvent(owner, "cleared").catch(() => {});
}

/** Register all webhook event handlers on the App. Called once. */
export function registerWebhookHandlers(app: App): void {
	app.webhooks.on(
		[
			"pull_request.opened",
			"pull_request.synchronize",
			"pull_request.reopened",
		],
		async ({ octokit, payload }) => {
			const owner = payload.repository.owner.login;
			const repo = payload.repository.name;
			const input = await buildPullRequestInput(
				octokit as unknown as InstallationClient,
				payload.repository,
				payload.pull_request,
			);
			await review(
				octokit as unknown as InstallationClient,
				owner,
				repo,
				input,
				Boolean(payload.repository.private),
			);
		},
	);

	app.webhooks.on(
		["issues.opened", "issues.reopened"],
		async ({ octokit, payload }) => {
			const owner = payload.repository.owner.login;
			const repo = payload.repository.name;
			const input = buildIssueInput(payload.repository, payload.issue);
			await review(
				octokit as unknown as InstallationClient,
				owner,
				repo,
				input,
				Boolean(payload.repository.private),
			);
		},
	);

	app.webhooks.on("issue_comment.created", async ({ octokit, payload }) => {
		if (payload.sender.type === "Bot") return;
		const body = payload.comment.body ?? "";
		if (!/\/slop\s+/i.test(body)) return;
		const owner = payload.repository.owner.login;
		const repo = payload.repository.name;
		await handleCommand(
			octokit as unknown as InstallationClient,
			owner,
			repo,
			payload.issue.number,
			payload.comment.user?.login ?? payload.sender.login,
			body,
		);
	});

	// Install tracking: record who installed/uninstalled so the owner can see
	// growth from /api/health without digging through App settings.
	app.webhooks.on("installation.created", async ({ payload }) => {
		const account =
			(payload.installation.account as { login?: string } | null)?.login ??
			"unknown";
		const repos = payload.repositories?.length ?? 0;
		console.log(`[slopguard] installed by ${account} (${repos} repos)`);
		await recordInstallEvent("installed", account, repos).catch(() => {});
	});
	app.webhooks.on("installation.deleted", async ({ payload }) => {
		const account =
			(payload.installation.account as { login?: string } | null)?.login ??
			"unknown";
		const repos = payload.repositories?.length ?? 0;
		console.log(`[slopguard] uninstalled by ${account}`);
		await recordInstallEvent("uninstalled", account, repos).catch(() => {});
	});

	app.webhooks.onError((err) => {
		console.error("[slopguard] webhook error:", err);
	});
}
