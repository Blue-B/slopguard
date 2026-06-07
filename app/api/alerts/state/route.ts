import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession, effectiveOwner } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import { getState, ensureConsoleReady } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/alerts/state
 *
 * Read-only view of the signed-in owner's alert console: channels, routing
 * rules, and the most recent sent alerts. The mutation endpoints
 * (POST /api/alerts/channels, POST /api/alerts/test) write into the same
 * store, so a refresh of this endpoint reflects new activity within seconds.
 */
export async function GET() {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const owner = effectiveOwner(session);
	const ok = await hasAlerts(owner);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "alerts require the Team plan" },
			{ status: 403 },
		);
	}

	const state = getState(owner);

	// Resolve channelId → label for human-readable routing rules / sent logs.
	const channelLabel = new Map(state.channels.map((c) => [c.id, c.label]));

	const rules = state.rules.map((r) => ({
		id: r.id,
		repo: r.repo,
		pattern: r.pattern,
		channel: channelLabel.get(r.channelId) ?? r.channelId,
		threshold: r.threshold,
	}));

	const sent = state.sentAlerts.slice(0, 20).map((a) => ({
		id: a.id,
		when: a.when,
		item: a.item,
		score: a.score,
		dest: a.dest,
		channelKind: a.channelKind,
		status: a.status,
		latency: a.latency,
	}));

	const channels = state.channels.map((c) => ({
		id: c.id,
		kind: c.kind,
		label: c.label,
		target: c.target,
		status: c.status,
		lastSent: c.lastSent ?? null,
		lastLatencyMs: c.lastLatencyMs ?? null,
	}));

	return NextResponse.json({
		owner: state.owner,
		channels,
		rules,
		sent,
	});
}
