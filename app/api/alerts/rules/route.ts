import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import { getState, mutateState, ensureConsoleReady, flushConsole } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/alerts/rules
 *
 * Create a routing rule. Body: { repo, pattern, channelId, threshold }.
 * threshold is clamped to [1, 100]; the channel must already exist.
 */
export async function POST(req: Request) {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const ok = await hasAlerts(session.login);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "alerts require the Team plan" },
			{ status: 403 },
		);
	}

	let body: {
		repo?: string;
		pattern?: string;
		channelId?: string;
		threshold?: number;
	};
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json body" }, { status: 400 });
	}
	const repo = (body.repo ?? "").trim();
	const pattern = (body.pattern ?? "").trim();
	const channelId = (body.channelId ?? "").trim();
	const threshold = Math.max(
		1,
		Math.min(100, Math.floor(Number(body.threshold ?? 60))),
	);
	if (!repo || !pattern || !channelId) {
		return NextResponse.json(
			{ error: "repo, pattern, and channelId are required" },
			{ status: 400 },
		);
	}

	const state = getState(session.login);
	if (!state.channels.find((c) => c.id === channelId)) {
		return NextResponse.json(
			{ error: "channelId does not match an existing channel" },
			{ status: 400 },
		);
	}

	const id = `rl_${Math.random().toString(36).slice(2, 10)}`;
	mutateState(session.login, (s) => {
		s.rules.push({ id, repo, pattern, channelId, threshold });
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when: new Date().toISOString().slice(0, 16).replace("T", " "),
			actor: session.login,
			action: "added routing rule",
			target: `${repo}:${pattern}`,
			source: "API",
		});
	});

	await flushConsole();
	return NextResponse.json({ ok: true, id });
}
