// Webhook dead-letter log. The webhook route ACKs 202 before processing, so
// GitHub never redelivers on our processing failures. We can't make the work
// durable without a real queue, but we CAN make failures visible: every failed
// background run is recorded here, surfaces in /api/health, and can be replayed
// manually from the GitHub App's "Advanced > Recent Deliveries" page.

import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";
const KEY = "ops:webhook-failed";
const MAX = 100;
const TTL_S = 60 * 60 * 24 * 14;
const TIMEOUT_MS = 3000;

let client: Redis | null = null;
function redis(): Redis | null {
	if (!REDIS_URL || !REDIS_TOKEN) return null;
	if (!client)
		client = new Redis({
			url: REDIS_URL,
			token: REDIS_TOKEN,
			retry: { retries: 1, backoff: () => 150 },
		});
	return client;
}

function guard<T>(op: Promise<T>): Promise<T> {
	let timer: ReturnType<typeof setTimeout>;
	const t = new Promise<T>((_, rej) => {
		timer = setTimeout(() => rej(new Error("redis timeout")), TIMEOUT_MS);
	});
	return Promise.race([op, t]).finally(() => clearTimeout(timer)) as Promise<T>;
}

/** Record a failed webhook processing run (best-effort, never throws). */
export async function recordFailedWebhook(
	deliveryId: string,
	event: string,
	error: unknown,
): Promise<void> {
	const r = redis();
	if (!r) return;
	try {
		const entry = JSON.stringify({
			id: deliveryId,
			event,
			error: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300),
			at: new Date().toISOString(),
		});
		await guard(
			Promise.all([
				r.lpush(KEY, entry),
				r.ltrim(KEY, 0, MAX - 1),
				r.expire(KEY, TTL_S),
			]),
		);
	} catch {
		/* best-effort */
	}
}

/** How many webhook failures are on record (for /api/health). */
export async function failedWebhookCount(): Promise<number> {
	const r = redis();
	if (!r) return 0;
	try {
		return await guard(r.llen(KEY));
	} catch {
		return 0;
	}
}
