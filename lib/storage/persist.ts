// Tiny zero-dependency persistence layer.
//
// The product is DB-less by design (Polar is the live source of truth for
// billing). But a few things genuinely need to survive a redeploy: per-owner
// console state (alert channels/rules, integrations, audit log, SSO config) and
// the GitHub Marketplace entitlement map.
//
// Strategy: if DATA_DIR is set (mount a persistent disk on the host and point
// DATA_DIR at it), each named collection is mirrored to `${DATA_DIR}/<name>.json`
// — loaded once on boot, written (debounced) on every mutation. If DATA_DIR is
// NOT set, everything stays purely in-memory (previous behaviour), so local dev
// and unconfigured hosts keep working with zero setup.
import { promises as fs } from "node:fs";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR?.trim() || "";

function filePathFor(name: string): string | null {
	if (!DATA_DIR) return null;
	return path.join(DATA_DIR, `${name}.json`);
}

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

/**
 * A persistent string-keyed map. Reads come from memory; writes update memory
 * and (if DATA_DIR is set) schedule a debounced flush to disk. Initial contents
 * are loaded synchronously from disk on construction so callers never see an
 * empty store after a restart.
 */
export class PersistentMap<V> {
	private mem = new Map<string, V>();
	private file: string | null;
	private flushTimer: ReturnType<typeof setTimeout> | null = null;
	private dirty = false;
	/** Serializes disk writes so two flushes never touch the .tmp file at once. */
	private writing: Promise<void> = Promise.resolve();

	constructor(private name: string) {
		this.file = filePathFor(name);
		this.load();
	}

	private load(): void {
		if (!this.file || !ensureDir()) return;
		try {
			if (!existsSync(this.file)) return;
			const raw = readFileSync(this.file, "utf8");
			const obj = JSON.parse(raw) as Record<string, V>;
			for (const [k, v] of Object.entries(obj)) this.mem.set(k, v);
		} catch (err) {
			console.error(`[persist] load ${this.name} failed:`, err);
		}
	}

	private scheduleFlush(): void {
		if (!this.file) return;
		this.dirty = true;
		if (this.flushTimer) return;
		this.flushTimer = setTimeout(() => {
			this.flushTimer = null;
			void this.flush();
		}, 400);
	}

	private async flush(): Promise<void> {
		if (!this.file || !this.dirty || !ensureDir()) return;
		// Chain onto any in-flight write so the .tmp file is never written
		// concurrently; a set() during a flush just queues the next snapshot.
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

	get(key: string): V | undefined {
		return this.mem.get(key);
	}
	has(key: string): boolean {
		return this.mem.has(key);
	}
	set(key: string, value: V): void {
		this.mem.set(key, value);
		this.scheduleFlush();
	}
	delete(key: string): void {
		if (this.mem.delete(key)) this.scheduleFlush();
	}
	/** Persist a mutation made in place on a value already returned by get(). */
	touch(): void {
		this.scheduleFlush();
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

export function isPersistenceEnabled(): boolean {
	return Boolean(DATA_DIR);
}
