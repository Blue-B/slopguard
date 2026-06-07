// Tiny persistence layer with three backends, picked at runtime:
//
//   1. Upstash Redis  — if UPSTASH_REDIS_REST_URL + _TOKEN are set. Durable,
//      free, survives redeploys, no disk needed. RECOMMENDED for production.
//   2. JSON file      — if DATA_DIR is set (a mounted disk). Durable on hosts
//      that support persistent volumes.
//   3. In-memory only — neither configured. Works with zero setup; data lives
//      for the process lifetime only (lost on redeploy).
//
// The public API is synchronous (get/set/delete) so existing callers are
// unchanged. Reads come from an in-memory mirror; writes update the mirror and
// (for Redis/file) persist in the background. Before reading data that must be
// fresh after a cold start, await `ready()` so the mirror is hydrated.
import { promises as fs } from "node:fs";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

const DATA_DIR = process.env.DATA_DIR?.trim() || "";
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";

type Backend = "redis" | "file" | "memory";

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
	if (!REDIS_URL || !REDIS_TOKEN) return null;
	if (!redisClient) {
		redisClient = new Redis({
			url: REDIS_URL,
			token: REDIS_TOKEN,
			retry: { retries: 1, backoff: () => 200 },
		});
	}
	return redisClient;
}

// Hard ceiling so a black-holed Redis (connects, never responds) can never hang
// a flush() — the request would otherwise wait forever on a long-running server.
const REDIS_TIMEOUT_MS = 4000;
function withTimeout<T>(op: Promise<T>, label: string): Promise<T> {
	return Promise.race([
		op,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(`redis ${label} timeout`)), REDIS_TIMEOUT_MS),
		),
	]);
}

function chooseBackend(): Backend {
	if (REDIS_URL && REDIS_TOKEN) return "redis";
	if (DATA_DIR) return "file";
	return "memory";
}

// ── file helpers ─────────────────────────────────────────────────────────
let dirReady = false;
function ensureDir(): boolean {
	if (!DATA_DIR) return false;
	if (dirReady) return true;
	try {
		if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
		dirReady = true;
		return true;
	} catch (err) {
		console.error("[persist] cannot create DATA_DIR:", err);
		return false;
	}
}

const allMaps: PersistentMap<unknown>[] = [];

/**
 * A string-keyed persistent map. Synchronous reads from an in-memory mirror;
 * writes mirror + persist in the background to the chosen backend.
 */
export class PersistentMap<V> {
	private mem = new Map<string, V>();
	private backend: Backend;
	private redisPrefix: string;
	private file: string | null;

	// file write coalescing
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	private dirty = false;
	private writing: Promise<void> = Promise.resolve();
	// tail of pending durable writes (redis or file) — await via flush()
	private pending: Promise<void> = Promise.resolve();

	// hydration guard
	private hydrated = false;
	private hydrating: Promise<void> | null = null;

	constructor(private name: string) {
		this.backend = chooseBackend();
		this.redisPrefix = `sg:${name}:`;
		this.file = DATA_DIR ? path.join(DATA_DIR, `${name}.json`) : null;
		// File backend can hydrate synchronously on construct (cheap, local).
		if (this.backend === "file") this.loadFileSync();
		else if (this.backend === "memory") this.hydrated = true;
		allMaps.push(this as PersistentMap<unknown>);
	}

	// ── hydration ──────────────────────────────────────────────────────────
	/** Ensure the in-memory mirror is loaded from the backend (Redis cold start). */
	async ready(): Promise<void> {
		if (this.hydrated) return;
		if (!this.hydrating) this.hydrating = this.hydrate();
		await this.hydrating;
	}

	private async hydrate(): Promise<void> {
		if (this.backend === "redis") {
			const redis = getRedis();
			if (redis) {
				try {
					let cursor = "0";
					do {
						const [next, keys] = await withTimeout(
							redis.scan(cursor, { match: `${this.redisPrefix}*`, count: 200 }),
							"scan",
						);
						cursor = next;
						for (const fullKey of keys) {
							const key = fullKey.slice(this.redisPrefix.length);
							const val = await withTimeout(redis.get<V>(fullKey), "get");
							if (val !== null && val !== undefined) this.mem.set(key, val);
						}
					} while (cursor !== "0");
				} catch (err) {
					console.error(`[persist] redis hydrate ${this.name} failed:`, err);
				}
			}
		}
		this.hydrated = true;
	}

	private loadFileSync(): void {
		if (!this.file || !ensureDir()) {
			this.hydrated = true;
			return;
		}
		try {
			if (existsSync(this.file)) {
				const obj = JSON.parse(readFileSync(this.file, "utf8")) as Record<string, V>;
				for (const [k, v] of Object.entries(obj)) this.mem.set(k, v);
			}
		} catch (err) {
			console.error(`[persist] load ${this.name} failed:`, err);
		}
		this.hydrated = true;
	}

	// ── writes ───────────────────────────────────────────────────────────
	private persistKey(key: string, value: V): void {
		if (this.backend === "redis") {
			const redis = getRedis();
			if (redis) {
				this.pending = this.pending.then(() =>
					withTimeout(redis.set(`${this.redisPrefix}${key}`, value), "set")
						.then(() => undefined)
						.catch((err) =>
							console.error(`[persist] redis set ${this.name} failed:`, err),
						),
				);
			}
		} else if (this.backend === "file") {
			this.scheduleFlush();
		}
	}

	private persistDelete(key: string): void {
		if (this.backend === "redis") {
			const redis = getRedis();
			if (redis) {
				this.pending = this.pending.then(() =>
					withTimeout(redis.del(`${this.redisPrefix}${key}`), "del")
						.then(() => undefined)
						.catch((err) =>
							console.error(`[persist] redis del ${this.name} failed:`, err),
						),
				);
			}
		} else if (this.backend === "file") {
			this.scheduleFlush();
		}
	}

	/** Await all durable writes scheduled so far (redis tail + any pending file
	 *  flush). Call before returning an HTTP response from a mutation so the data
	 *  is guaranteed written even if the process is recycled right after. */
	async flush(): Promise<void> {
		if (this.backend === "file") {
			this.dirty = true;
			if (this.flushTimer) {
				clearTimeout(this.flushTimer);
				this.flushTimer = null;
			}
			await this.doFileFlush();
			return;
		}
		await this.pending;
	}

	private scheduleFlush(): void {
		if (this.backend !== "file") return;
		this.dirty = true;
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => {
			this.flushTimer = null;
			void this.doFileFlush();
		}, 400);
	}

	private async doFileFlush(): Promise<void> {
		if (!this.file || !this.dirty || !ensureDir()) return;
		this.writing = this.writing.then(() => this.writeSnapshot());
		await this.writing;
	}

	private async writeSnapshot(): Promise<void> {
		if (!this.file || !this.dirty || !ensureDir()) return;
		this.dirty = false;
		const obj: Record<string, V> = {};
		for (const [k, v] of this.mem) obj[k] = v;
		try {
			const tmp = `${this.file}.tmp`;
			await fs.writeFile(tmp, JSON.stringify(obj), "utf8");
			await fs.rename(tmp, this.file);
		} catch (err) {
			this.dirty = true;
			console.error(`[persist] flush ${this.name} failed:`, err);
		}
	}

	// ── public sync API ──────────────────────────────────────────────────
	get(key: string): V | undefined {
		return this.mem.get(key);
	}
	has(key: string): boolean {
		return this.mem.has(key);
	}
	set(key: string, value: V): void {
		this.mem.set(key, value);
		this.persistKey(key, value);
	}
	delete(key: string): void {
		if (this.mem.delete(key)) this.persistDelete(key);
	}
	/** Re-persist a value mutated in place (after get()). */
	touch(key: string): void {
		const v = this.mem.get(key);
		if (v !== undefined) this.persistKey(key, v);
	}
	keys(): IterableIterator<string> {
		return this.mem.keys();
	}
	entries(): IterableIterator<[string, V]> {
		return this.mem.entries();
	}
	get size(): number {
		return this.mem.size;
	}
}

/** Hydrate every store's in-memory mirror from its backend. Cheap when already
 *  hydrated or when not using Redis. Call before reads that must be cold-start
 *  fresh (entitlement, console state, SSO enforcement). */
export async function ensureStoresReady(): Promise<void> {
	await Promise.all(allMaps.map((m) => m.ready()));
}

/** Await durable persistence of all pending writes across every store. */
export async function flushStores(): Promise<void> {
	await Promise.all(allMaps.map((m) => m.flush()));
}

export function persistenceBackend(): Backend {
	return chooseBackend();
}
