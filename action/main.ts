// GitHub Action entrypoint: the same detection + triage as the App, run on
// the workflow's own token. No server, no App registration, no billing.
// Bundled to action/dist/index.mjs by `npm run build:action`.
import { appendFileSync, readFileSync } from "node:fs";
import { Octokit } from "octokit";
import { analyzeSlop } from "../lib/agent/graph.js";
import { loadPolicy } from "../lib/policy/load.js";
import { toAgentPolicy } from "../lib/policy/schema.js";
import {
	buildIssueInput,
	buildPullRequestInput,
} from "../lib/github/build-input.js";
import {
	applyVerdict,
	isAllowlisted,
	runSlopCommand,
} from "../lib/github/actions.js";

async function main(): Promise<void> {
	const token = process.env.INPUT_TOKEN || process.env.GITHUB_TOKEN;
	if (!token) throw new Error("missing token input");
	const event = process.env.GITHUB_EVENT_NAME ?? "";
	let payload;
	try {
		payload = JSON.parse(
			readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8"),
		);
	} catch (err) {
		throw new Error(`cannot read GITHUB_EVENT_PATH: ${err}`);
	}
	// GITHUB_API_URL keeps GitHub Enterprise Server runners working.
	const octokit = new Octokit({
		auth: token,
		baseUrl: process.env.GITHUB_API_URL,
	});
	const owner: string = payload.repository.owner.login;
	const repo: string = payload.repository.name;

	if (event === "issue_comment") {
		if (payload.action !== "created" || payload.sender?.type === "Bot") return;
		await runSlopCommand(
			octokit,
			owner,
			repo,
			payload.issue.number,
			payload.comment.user?.login ?? payload.sender.login,
			payload.comment.body ?? "",
		);
		return;
	}

	if (!["opened", "reopened", "synchronize"].includes(payload.action)) return;
	let input;
	if (event === "pull_request" || event === "pull_request_target") {
		input = await buildPullRequestInput(
			octokit,
			payload.repository,
			payload.pull_request,
		);
	} else if (event === "issues") {
		input = buildIssueInput(payload.repository, payload.issue);
	} else {
		console.log(`[slopguard] ignoring event ${event}`);
		return;
	}

	const policy = await loadPolicy(octokit, owner, repo);
	if (!policy.enabled) return;
	if (input.kind === "pull_request" && !policy.scan.pull_requests) return;
	if (input.kind === "issue" && !policy.scan.issues) return;
	if (isAllowlisted(policy, input)) {
		console.log(`[slopguard] allowlisted: ${input.repo}#${input.number}`);
		return;
	}

	const result = await analyzeSlop(input, toAgentPolicy(policy));
	const action = await applyVerdict(octokit, owner, repo, policy, input, result);
	console.log(
		`[slopguard] ${action} ${input.repo}#${input.number} (${result.score}, ${result.verdict})`,
	);
	if (process.env.GITHUB_OUTPUT) {
		appendFileSync(
			process.env.GITHUB_OUTPUT,
			`score=${result.score}\nverdict=${result.verdict}\nquarantined=${action === "quarantined"}\n`,
		);
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
