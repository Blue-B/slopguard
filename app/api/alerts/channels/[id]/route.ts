import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import { getState, mutateState, ensureConsoleReady, flushConsole } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/alerts/channels/[id]
 *
 * Remove a channel. Cascades: any routing rules bound to this channel and
 * any past sent-alert log entries pointing at it are also dropped (the
 * alert log keeps a record via the audit endpoint, not the channel log).
 */
export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
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

	const { id } = await params;
	const state = getState(session.login);
	const channel = state.channels.find((c) => c.id === id);
	if (!channel) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}

	mutateState(session.login, (s) => {
		s.channels = s.channels.filter((c) => c.id !== id);
		s.rules = s.rules.filter((r) => r.channelId !== id);
		s.sentAlerts = s.sentAlerts.filter((a) => a.channelId !== id);
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when: new Date().toISOString().slice(0, 16).replace("T", " "),
			actor: session.login,
			action: "removed channel",
			target: `${channel.kind}:${channel.label}`,
			source: "API",
		});
	});

	await flushConsole();
	return NextResponse.json({ ok: true, removed: id });
}
