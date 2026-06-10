import { NextResponse } from "next/server";
import { isSafeWebhookUrl } from "@/lib/net/ssrf";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import {
	getState,
	mutateState,
	ensureConsoleReady,
	flushConsole,
	type SentAlert,
} from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 5000;

function unauthorized() {
	return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function forbidden(reason: string) {
	return NextResponse.json({ error: "forbidden", reason }, { status: 403 });
}

async function postWithTimeout(
	url: string,
	body: unknown,
): Promise<{
	ok: boolean;
	status?: number;
	latencyMs: number;
	error?: string;
}> {
	if (!isSafeWebhookUrl(url)) return { ok: false, latencyMs: 0, error: "unsafe target" };
	const start = Date.now();
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: controller.signal,
		});
		return { ok: res.ok, status: res.status, latencyMs: Date.now() - start };
	} catch (e) {
		return {
			ok: false,
			latencyMs: Date.now() - start,
			error: e instanceof Error ? e.message : "fetch failed",
		};
	} finally {
		clearTimeout(t);
	}
}

export async function POST(req: Request) {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) return unauthorized();

	const ok = await hasAlerts(session.login);
	if (!ok) return forbidden("alerts require the Team plan");

	let body: { channelId?: string } = {};
	try {
		body = (await req.json()) as { channelId?: string };
	} catch {
		body = {};
	}

	const state = getState(session.login);
	const channel = body.channelId
		? state.channels.find((c) => c.id === body.channelId)
		: state.channels.find((c) => c.status === "active");
	if (!channel) {
		return NextResponse.json({ error: "no channel" }, { status: 400 });
	}

	const text = `🛡️ SlopGuard test alert — ${session.login} · ${new Date().toISOString()}`;
	const payload =
		channel.kind === "slack"
			? { text }
			: channel.kind === "discord"
				? { content: text }
				: { event: "slopguard.test", owner: session.login, text };

	const result = await postWithTimeout(channel.target, payload);
	const sent: SentAlert = {
		id: `se_${Math.random().toString(36).slice(2, 10)}`,
		owner: state.owner,
		when: new Date().toISOString().slice(0, 16).replace("T", " "),
		item: "TEST",
		score: 0,
		dest: channel.label,
		channelId: channel.id,
		channelKind: channel.kind,
		status: result.ok ? "delivered" : "failed",
		latency: `${(result.latencyMs / 1000).toFixed(1)}s`,
		latencyMs: result.latencyMs,
	};

	mutateState(session.login, (s) => {
		s.sentAlerts.unshift(sent);
		s.channels = s.channels.map((c) =>
			c.id === channel.id
				? {
						...c,
						status: result.ok ? "active" : "failed",
						lastSent: "just now",
						lastLatencyMs: result.latencyMs,
					}
				: c,
		);
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when: sent.when,
			actor: session.login,
			action: result.ok ? "test alert delivered" : "test alert failed",
			target: channel.label,
			source: "Admin",
		});
	});

	await flushConsole();
	return NextResponse.json({
		ok: result.ok,
		channel: channel.label,
		latencyMs: result.latencyMs,
		status: result.status,
		error: result.error,
		alert: sent,
	});
}
