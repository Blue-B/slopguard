import { createHash } from "node:crypto";
import { LRUCache } from "lru-cache";
import type { SlopInput, SlopResult } from "./agent/types.js";

// Analysis result cache
// Keyed by a hash of the contribution content so repeated `synchronize`
// deliveries with identical content don't re-invoke the (paid) LLM.
const analysisCache = new LRUCache<string, SlopResult>({
	max: 2000,
	ttl: 1000 * 60 * 10, // 10 min
});

export function inputCacheKey(input: SlopInput): string {
	const h = createHash("sha256")
		.update(
			`${input.kind}|${input.repo}|${input.number}|${input.title}|${input.body}|${input.diff}`,
		)
		.digest("hex")
		.slice(0, 24);
	return `${input.repo}#${input.number}:${h}`;
}

export function getCachedAnalysis(key: string): SlopResult | undefined {
	return analysisCache.get(key);
}

export function setCachedAnalysis(key: string, result: SlopResult): void {
	analysisCache.set(key, result);
}

// Webhook delivery de-duplication
// GitHub re-delivers on timeout/non-2xx. Within a warm instance we skip
// deliveries we've already accepted. (Cross-instance dedup relies on the
// idempotent upsert in actions.ts.)
const deliveryCache = new LRUCache<string, true>({
	max: 10000,
	ttl: 1000 * 60 * 60, // 1 h
});

/** Returns true the FIRST time a delivery id is seen, false on repeats. */
export function claimDelivery(deliveryId: string): boolean {
	if (deliveryCache.has(deliveryId)) return false;
	deliveryCache.set(deliveryId, true);
	return true;
}
