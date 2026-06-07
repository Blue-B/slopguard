import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasAlerts } from "@/lib/billing/entitlement";
import {
	mutateState,
	ensureConsoleReady,
	flushConsole,
	type Channel,
	type ChannelKind,
} from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
	return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function forbidden(reason: string) {
	return NextResponse.json({ error: "forbidden", reason }, { status: 403 });
}

function isValidKind(k: unknown): k is ChannelKind {
	return k === "slack" || k === "discord" || k === "webhook";
}

export async function POST(req: Request) {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) return unauthorized();

	const ok = await hasAlerts(session.login);
	if (!ok) return forbidden("alerts require the Team plan");

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}
	const b = body as Partial<Channel>;
	if (!b.label || !b.target || !isValidKind(b.kind)) {
		return NextResponse.json(
			{ error: "label, target, kind required" },
			{ status: 400 },
		);
	}
	if (b.kind === "slack" && !/^https:\/\/hooks\.slack\.com\//.test(b.target)) {
		return NextResponse.json(
			{ error: "slack target must be hooks.slack.com URL" },
			{ status: 400 },
		);
	}
	if (
		b.kind === "discord" &&
		!/^https:\/\/(?:[a-z0-9-]+\.)?discord(?:app)?\.com\/api\/webhooks\//.test(
			b.target,
		)
	) {
		return NextResponse.json(
			{ error: "discord target must be discord.com/api/webhooks/ URL" },
			{ status: 400 },
		);
	}

	const created: Channel = {
		id: `ch_${Math.random().toString(36).slice(2, 10)}`,
		kind: b.kind,
		label: String(b.label).slice(0, 60),
		target: String(b.target).slice(0, 200),
		status: "active",
	};
	const state = mutateState(session.login, (s) => {
		s.channels.push(created);
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when: new Date().toISOString().slice(0, 16).replace("T", " "),
			actor: session.login,
			action: "added alert channel",
			target: created.label,
			source: "Admin",
		});
	});
	await flushConsole();
	return NextResponse.json({
		ok: true,
		channel: created,
		total: state.channels.length,
	});
}
