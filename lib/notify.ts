import type { SlopInput, SlopResult } from "./agent/types.js";
import { withTimeout } from "./util.js";

// Outbound alerts on quarantine (a Team feature). Destinations are configured
// per-repo in .github/SLOP_POLICY.yml under `notify:`, policy-as-code, so no
// dashboard state to store. We support Slack incoming webhooks, Discord
// webhooks, and a generic JSON webhook. All are best-effort and time-boxed so
// a slow/broken webhook never blocks webhook processing.

export interface NotifyConfig {
	slack_webhook?: string;
	discord_webhook?: string;
	webhook_url?: string;
}

const TIMEOUT_MS = 6000;

function itemUrl(input: SlopInput): string {
	// /issues/<n> redirects to the PR for pull requests, so this works for both.
	return `https://github.com/${input.repo}/${input.kind === "pull_request" ? "pull" : "issues"}/${input.number}`;
}

function summary(input: SlopInput, result: SlopResult): string {
	const kind = input.kind === "pull_request" ? "PR" : "issue";
	return `SlopGuard quarantined ${kind} ${input.repo}#${input.number} — score ${result.score}/100 (${result.verdict}) by @${input.author}`;
}

async function post(url: string, body: unknown): Promise<void> {
	try {
		await withTimeout(
			fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			}),
			TIMEOUT_MS,
			"notify",
		);
	} catch (err) {
		console.warn("[slopguard] notify failed:", err);
	}
}

/**
 * Fire all configured quarantine alerts. Caller is responsible for gating this
 * to entitled (Team+) owners. Returns the number of destinations contacted.
 */
export async function sendQuarantineAlerts(
	notify: NotifyConfig | undefined,
	input: SlopInput,
	result: SlopResult,
): Promise<number> {
	if (!notify) return 0;
	const url = itemUrl(input);
	const text = summary(input, result);
	const topReasons = result.reasons.slice(0, 4).join("\n");
	const jobs: Promise<void>[] = [];

	if (notify.slack_webhook) {
		jobs.push(
			post(notify.slack_webhook, {
				text: `🛡️ *${text}*\n${topReasons}\n<${url}|Review on GitHub>`,
			}),
		);
	}
	if (notify.discord_webhook) {
		jobs.push(
			post(notify.discord_webhook, {
				content: `🛡️ **${text}**\n${topReasons}\n${url}`,
			}),
		);
	}
	if (notify.webhook_url) {
		jobs.push(
			post(notify.webhook_url, {
				event: "slop.quarantined",
				repo: input.repo,
				number: input.number,
				kind: input.kind,
				author: input.author,
				score: result.score,
				verdict: result.verdict,
				reasons: result.reasons,
				url,
			}),
		);
	}

	await Promise.allSettled(jobs);
	return jobs.length;
}
