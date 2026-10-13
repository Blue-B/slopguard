import { test } from "node:test";
import assert from "node:assert/strict";
import { applyVerdict } from "../lib/github/actions.js";
import { defaultPolicy } from "../lib/policy/schema.js";
import type { InstallationClient } from "../lib/github/app.js";
import type { SlopInput, SlopResult } from "../lib/agent/types.js";

// Fake Octokit: records label writes, reports `existing` labels on the issue.
function fakeOctokit(existing: string[]) {
	const added: string[][] = [];
	const ok = async () => ({ data: [] });
	const octokit = {
		rest: {
			issues: {
				listLabelsOnIssue: async () => ({
					data: existing.map((name) => ({ name })),
				}),
				getLabel: ok,
				createLabel: ok,
				removeLabel: ok,
				addLabels: async ({ labels }: { labels: string[] }) => {
					added.push(labels);
					return { data: [] };
				},
				listComments: ok,
				createComment: ok,
				updateComment: ok,
			},
		},
	} as unknown as InstallationClient;
	return { octokit, added };
}

const input = { kind: "issue", repo: "o/r", number: 1 } as SlopInput;
const slop = {
	score: 90,
	verdict: "likely-slop",
	shouldQuarantine: true,
	highConfidence: true,
	reasons: [],
	llm: { reasons: [], provider: null },
	provenance: { modelHints: [], leakedAssistantPhrases: [] },
} as unknown as SlopResult;

test("quarantines a slop contribution", async () => {
	const { octokit, added } = fakeOctokit([]);
	const r = await applyVerdict(octokit, "o", "r", defaultPolicy(), input, slop);
	assert.equal(r, "quarantined");
	assert.deepEqual(added, [["slop-quarantine", "slop-high-confidence"]]);
});

test("never re-quarantines after a maintainer approved it", async () => {
	const { octokit, added } = fakeOctokit(["slop-cleared"]);
	const r = await applyVerdict(octokit, "o", "r", defaultPolicy(), input, slop);
	assert.equal(r, "approved");
	assert.deepEqual(added, []);
});
