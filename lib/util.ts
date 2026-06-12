import { LRUCache } from "lru-cache";

/** Reject after `ms` with a timeout error, otherwise resolve the promise. */
export async function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	label = "operation",
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(
			() => reject(new Error(`${label} timed out after ${ms}ms`)),
			ms,
		);
	});
	try {
		return await Promise.race([promise, timeout]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

// Fixed-window rate limiter (per key, in-memory)
interface Window {
	count: number;
	resetAt: number;
}
const windows = new LRUCache<string, Window>({
	max: 10000,
	ttl: 1000 * 60 * 10,
});

/**
 * Returns true if the action is ALLOWED, false if the key is over its limit.
 * Default: 30 analyses per repo per 60s (protects against PR-spam floods).
 */
export function rateLimit(
	key: string,
	limit = Number(process.env.RATE_LIMIT_PER_MIN ?? 30),
	windowMs = 60_000,
): boolean {
	const now = Date.now();
	const w = windows.get(key);
	if (!w || now >= w.resetAt) {
		windows.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}
	if (w.count >= limit) return false;
	w.count += 1;
	return true;
}
