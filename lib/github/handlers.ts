import type { App } from "@octokit/app";
import type { InstallationClient } from "./app.js";
import { analyzeSlop } from "../agent/graph.js";
import { loadPolicy } from "../policy/load.js";
import { toAgentPolicy } from "../policy/schema.js";
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
	applyVerdict,
	isAllowlisted,
	renderComment,
	runSlopCommand,
} from "./actions.js";
import {
	getCachedAnalysis,
	inputCacheKey,
	setCachedAnalysis,
} from "../cache.js";
import { rateLimit } from "../util.js";

/** Shared analyze → label → comment pipeline for PRs and issues. */
async function review(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	input: Parameters<typeof renderComment>[1],
): Promise<void> {
	const policy = await loadPolicy(octokit, owner, repo);
	if (!policy.enabled) return;
	if (input.kind === "pull_request" && !policy.scan.pull_requests) return;
	if (input.kind === "issue" && !policy.scan.issues) return;
	if (isAllowlisted(policy, input)) {
		console.log(`[slopguard] allowlisted: ${input.repo}#${input.number}`);
		return;
	}

	// Rate-limit per repo to absorb PR-spam floods (configurable).
	if (!rateLimit(`analyze:${input.repo}`)) {
		console.warn(`[slopguard] rate-limited: ${input.repo}#${input.number}`);
		return;
	}

	// Reuse a cached verdict for identical content (repeated synchronize events
	// or GitHub re-deliveries) to avoid re-invoking the LLM.
	const cacheKey = inputCacheKey(input);
	let result = getCachedAnalysis(cacheKey);
	if (!result) {
		result = await analyzeSlop(input, toAgentPolicy(policy));
		setCachedAnalysis(cacheKey, result);
	}

	// Cross-repo bot-campaign detection: the same prompt fingerprint landing
	// across several of the owner's repos boosts the score.
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

	// Network intelligence (hosted-only): a fingerprint flagged across many
	// OTHER installations boosts the score; one repeatedly cleared as a false
	// positive network-wide is suppressed. Read before recording this sighting so
	// the counts reflect other owners, not us. Best-effort, never blocks.
	if (policy.share_intel !== false) {
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

	const action = await applyVerdict(octokit, owner, repo, policy, input, result);
	console.log(
		`[slopguard] ${action} ${input.repo}#${input.number} (${result.score})`,
	);
	if (action !== "quarantined") return;

	// Outbound alerts. Best-effort, time-boxed; never blocks the webhook.
	// Two independent configuration paths, both real and additive: policy-as-code
	// (.github/SLOP_POLICY.yml `notify:`) and the /alerts console (channels +
	// routing rules). If the same destination is configured in both, it receives
	// one message per path by design, they are separate surfaces.
	await sendQuarantineAlerts(policy.notify, input, result).catch(() => 0);
	await dispatchConsoleAlerts(owner, input, result).catch(() => 0);

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

/** /slop command + hosted outcome tracking. */
async function handleCommand(
	octokit: InstallationClient,
	owner: string,
	repo: string,
	issueNumber: number,
	commenter: string,
	body: string,
): Promise<void> {
	const ran = await runSlopCommand(
		octokit,
		owner,
		repo,
		issueNumber,
		commenter,
		body,
	);
	if (!ran) return;
	if (ran.policy.share_intel !== false)
		await recordOutcome(owner, repo, issueNumber, ran.outcome).catch(() => {});
	if (ran.outcome === "cleared")
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
