import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import { getState, mutateState, ensureConsoleReady, flushConsole } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
	const rule = state.rules.find((r) => r.id === id);
	if (!rule) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}
	mutateState(session.login, (s) => {
		s.rules = s.rules.filter((r) => r.id !== id);
	});
	await flushConsole();
	return NextResponse.json({ ok: true, removed: id });
}
