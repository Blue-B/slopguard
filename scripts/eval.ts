/**
 * Golden-set evaluation harness for the SlopGuard agent.
 *
 *   npm run eval                       # heuristics-only (no keys)
 *   node --env-file-if-exists=.env.local --import tsx scripts/eval.ts   # with LLM
 *
 * Prints a confusion matrix, precision/recall/F1/accuracy at the default
 * threshold, a threshold sweep (to calibrate), and any misclassifications.
 */
import { analyzeSlop } from "../lib/agent/graph.js";
import { DEFAULT_AGENT_POLICY } from "../lib/agent/types.js";
import { FIELD } from "../test/fixtures/field.js";
import { GOLDEN } from "../test/fixtures/golden.js";

interface Row {
	name: string;
	label: boolean; // true = slop
	score: number;
	predicted: boolean; // shouldQuarantine at default threshold
	llm: string | null;
}

function metrics(rows: { label: boolean; predicted: boolean }[]) {
	let tp = 0,
		fp = 0,
		fn = 0,
		tn = 0;
	for (const r of rows) {
		if (r.label && r.predicted) tp++;
		else if (!r.label && r.predicted) fp++;
		else if (r.label && !r.predicted) fn++;
		else tn++;
	}
	const precision = tp + fp ? tp / (tp + fp) : 1;
	const recall = tp + fn ? tp / (tp + fn) : 1;
	const f1 =
		precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
	const accuracy = (tp + tn) / Math.max(1, rows.length);
	return { tp, fp, fn, tn, precision, recall, f1, accuracy };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

async function main() {
	const setArg = process.argv.find((a) => a.startsWith("--set="))?.slice(6) ?? "golden";
	const cases =
		setArg === "field"
			? FIELD
			: setArg === "all"
				? [...GOLDEN, ...FIELD]
				: GOLDEN;
	const threshold = DEFAULT_AGENT_POLICY.quarantineThreshold;
	const rows: Row[] = [];

	for (const c of cases) {
		const r = await analyzeSlop(c.input);
		rows.push({
			name: c.name,
			label: c.slop,
			score: r.score,
			predicted: r.shouldQuarantine,
			llm: r.llm.provider,
		});
	}

	const usedLlm = rows.some((r) => r.llm !== null);
	const m = metrics(rows);

	console.log("\n" + "═".repeat(66));
	console.log(`SlopGuard ${setArg}-set eval — ${cases.length} cases`);
	console.log(
		`mode: ${usedLlm ? `LLM+heuristics (${rows.find((r) => r.llm)?.llm})` : "heuristics-only (no LLM key)"}`,
	);
	console.log(`threshold: ${threshold}`);
	console.log("═".repeat(66));

	console.log("\nConfusion matrix (positive = slop):");
	console.log(`            predicted slop   predicted clean`);
	console.log(
		`  is slop        TP ${String(m.tp).padStart(3)}         FN ${String(m.fn).padStart(3)}`,
	);
	console.log(
		`  is clean       FP ${String(m.fp).padStart(3)}         TN ${String(m.tn).padStart(3)}`,
	);

	console.log("\nMetrics @ threshold " + threshold + ":");
	console.log(
		`  precision : ${pct(m.precision)}   (of flagged, how many were real slop)`,
	);
	console.log(
		`  recall    : ${pct(m.recall)}   (of real slop, how many we caught)`,
	);
	console.log(`  F1        : ${pct(m.f1)}`);
	console.log(`  accuracy  : ${pct(m.accuracy)}`);

	// Threshold sweep, recompute predictions from raw scores.
	console.log("\nThreshold sweep (F1):");
	let best = { t: threshold, f1: -1 };
	for (let t = 35; t <= 85; t += 5) {
		const sweep = rows.map((r) => ({
			label: r.label,
			predicted: r.score >= t,
		}));
		const sm = metrics(sweep);
		const mark = sm.f1 > best.f1 ? " ←" : "";
		if (sm.f1 > best.f1) best = { t, f1: sm.f1 };
		console.log(
			`  t=${String(t).padStart(2)}  P=${pct(sm.precision).padStart(6)}  R=${pct(sm.recall).padStart(6)}  F1=${pct(sm.f1).padStart(6)}${mark}`,
		);
	}
	console.log(`  → best F1 at threshold ${best.t} (${pct(best.f1)})`);

	// Misclassifications at default threshold.
	const wrong = rows.filter((r) => r.label !== r.predicted);
	console.log(`\nMisclassified @ ${threshold}: ${wrong.length}`);
	for (const r of wrong) {
		const kind = r.label ? "FN (missed slop)" : "FP (flagged clean)";
		console.log(`  [${kind}] ${r.name}  score=${r.score}`);
	}
	if (wrong.length === 0) console.log("  none 🎉");

	console.log("\n" + "═".repeat(66));
	if (!usedLlm) {
		console.log(
			"Note: heuristics-only. FNs on subtle cases (giant diffs, over-commenting)\n" +
				"are expected — add an LLM key to lift recall. Run with:\n" +
				"  node --env-file-if-exists=.env.local --import tsx scripts/eval.ts",
		);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
