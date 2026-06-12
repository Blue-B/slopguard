// Console-configured quarantine alerts. The /alerts console lets a Team+ owner
// add Slack/Discord/webhook channels and routing rules (repo + pattern + score
// threshold -> channel). This module is what makes those rules ACTUALLY fire on
// a real quarantine: it is called from the webhook handler alongside the
// policy-as-code (.github/SLOP_POLICY.yml `notify:`) path, so both ways of
// configuring alerts work. Every send is recorded in the owner's sentAlerts log
// so the console "sent" view and delivery counts reflect reality.

import type { SlopInput, SlopResult } from "../agent/types.js";
import { isSafeWebhookUrl } from "../net/ssrf.js";
import {
	type Channel,
	ensureConsoleReady,
	flushConsole,
	getState,
	mutateState,
	type SentAlert,
} from "../billing/console-store.js";

const TIMEOUT_MS = 6000;

function repoMatches(ruleRepo: string, repo: string): boolean {
	const r = ruleRepo.trim().toLowerCase();
	const t = repo.toLowerCase();
	if (!r || r === "*") return true;
	if (r === t) return true;
	// "owner/*", match every repo under that owner
	if (r.endsWith("/*")) return t.startsWith(r.slice(0, -1));
	// bare "owner", match every repo under that owner
	if (!r.includes("/")) return t.startsWith(`${r}/`);
	return false;
}

function patternMatches(pattern: string, input: SlopInput): boolean {
	const p = pattern.trim().toLowerCase();
	if (!p) return true;
	return (
		input.title.toLowerCase().includes(p) ||
		input.repo.toLowerCase().includes(p)
	);
}

function itemUrl(input: SlopInput): string {
	return `https://github.com/${input.repo}/${input.kind === "pull_request" ? "pull" : "issues"}/${input.number}`;
}

function payloadFor(
	channel: Channel,
	text: string,
	input: SlopInput,
	result: SlopResult,
	url: string,
): unknown {
	const reasons = result.reasons.slice(0, 4).join("\n");
	if (channel.kind === "slack") {
		return { text: `🛡️ *${text}*\n${reasons}\n<${url}|Review on GitHub>` };
	}
	if (channel.kind === "discord") {
		return { content: `🛡️ **${text}**\n${reasons}\n${url}` };
	}
	return {
		event: "slop.quarantined",
		repo: input.repo,
		number: input.number,
		kind: input.kind,
		author: input.author,
		score: result.score,
		verdict: result.verdict,
		reasons: result.reasons,
		url,
	};
}

async function post(
	url: string,
	body: unknown,
): Promise<{ ok: boolean; latencyMs: number }> {
	const t0 = Date.now();
	// Defense in depth: re-check at send time in case a target was stored before
	// the create-time SSRF validation existed.
	if (!isSafeWebhookUrl(url)) return { ok: false, latencyMs: 0 };
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: ctrl.signal,
		});
		return { ok: res.ok, latencyMs: Date.now() - t0 };
	} catch {
		return { ok: false, latencyMs: Date.now() - t0 };
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Fire the owner's console-configured routing rules for a quarantine. Caller
 * gates this to entitled (Team+) owners. Returns the number of channels sent to.
 */
export async function dispatchConsoleAlerts(
	owner: string,
	input: SlopInput,
	result: SlopResult,
): Promise<number> {
	await ensureConsoleReady();
	const state = getState(owner);
	if (state.rules.length === 0 || state.channels.length === 0) return 0;

	// Collect the unique channels whose rules match this item (dedupe so two
	// rules pointing at the same channel only send once).
	const targets = new Map<string, Channel>();
	for (const rule of state.rules) {
		if (result.score < rule.threshold) continue;
		if (!repoMatches(rule.repo, input.repo)) continue;
		if (!patternMatches(rule.pattern, input)) continue;
		const ch = state.channels.find(
			(c) => c.id === rule.channelId && c.status !== "paused",
		);
		if (ch) targets.set(ch.id, ch);
	}
	if (targets.size === 0) return 0;

	const url = itemUrl(input);
	const kind = input.kind === "pull_request" ? "PR" : "issue";
	const text = `SlopGuard quarantined ${kind} ${input.repo}#${input.number} — score ${result.score}/100 (${result.verdict}) by @${input.author}`;

	const sends = await Promise.all(
		[...targets.values()].map(async (ch) => {
			const r = await post(ch.target, payloadFor(ch, text, input, result, url));
			return { ch, ok: r.ok, latencyMs: r.latencyMs };
		}),
	);

	mutateState(owner, (s) => {
		for (const { ch, ok, latencyMs } of sends) {
			const sent: SentAlert = {
				id: `se_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
				owner: s.owner,
				when: new Date().toISOString().slice(0, 16).replace("T", " "),
				item: `${kind} #${input.number}`,
				score: result.score,
				dest: ch.label,
				channelId: ch.id,
				channelKind: ch.kind,
				status: ok ? "delivered" : "failed",
				latency: `${(latencyMs / 1000).toFixed(1)}s`,
				latencyMs,
			};
			s.sentAlerts = [sent, ...s.sentAlerts].slice(0, 200);
			s.channels = s.channels.map((c) =>
				c.id === ch.id
					? {
							...c,
							status: ok ? "active" : "failed",
							lastSent: sent.when,
							lastLatencyMs: latencyMs,
						}
					: c,
			);
		}
	});
	await flushConsole().catch(() => {});

	return sends.length;
}
