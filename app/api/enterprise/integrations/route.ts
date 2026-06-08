import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasSso } from "@/lib/billing/entitlement";
import { getState, mutateState, ensureConsoleReady, flushConsole } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED = [
	"Jira",
	"PagerDuty",
	"Datadog",
	"Slack",
	"Linear",
	"Opsgenie",
];

/**
 * GET /api/enterprise/integrations — list the owner's integrations (real
 * state, not seeds). Returns the supported catalogue merged with the
 * owner's configured status so a freshly-installed owner still sees the
 * full list with `available` status.
 */
export async function GET() {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}
	const ok = await hasSso(session.login);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "Enterprise plan required" },
			{ status: 403 },
		);
	}
	const state = getState(session.login);
	const byName = new Map(state.integrations.map((i) => [i.name, i]));
	const list = SUPPORTED.map((name) => {
		const existing = byName.get(name);
		return (
			existing ?? {
				name,
				status: "available" as const,
				scope: defaultScope(name),
			}
		);
	});
	return NextResponse.json({ owner: state.owner, integrations: list });
}

function defaultScope(name: string): string {
	switch (name) {
		case "Jira":
			return "Create tickets for quarantined PRs";
		case "PagerDuty":
			return "Page on-call on High-risk campaign";
		case "Datadog":
			return "Forward audit events as logs";
		case "Slack":
			return "Mirror audit log into a Slack channel";
		case "Linear":
			return "Sync quarantined items to Linear issues";
		case "Opsgenie":
			return "Escalate High-risk campaign to on-call rotation";
		default:
			return "";
	}
}

/**
 * POST /api/enterprise/integrations
 * Body: { name: string, action: "connect" | "disconnect" }
 *
 * These providers are not yet self-serve, so "connect" REQUESTS the integration
 * (status `pending`) and records an audit entry; the SlopGuard team then scopes
 * and wires it per the Enterprise plan. "disconnect" cancels the request.
 */
export async function POST(req: Request) {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}
	const ok = await hasSso(session.login);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "Enterprise plan required" },
			{ status: 403 },
		);
	}
	let body: { name?: string; action?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json body" }, { status: 400 });
	}
	const name = (body.name ?? "").trim();
	const action = (body.action ?? "").trim();
	if (!SUPPORTED.includes(name)) {
		return NextResponse.json(
			{ error: "unsupported integration" },
			{ status: 400 },
		);
	}
	if (action !== "connect" && action !== "disconnect") {
		return NextResponse.json(
			{ error: "action must be connect or disconnect" },
			{ status: 400 },
		);
	}

	// Not a fake instant connect: requesting marks it pending until our team wires
	// it. Cancelling returns it to available.
	const newStatus = action === "connect" ? "pending" : "available";
	mutateState(session.login, (s) => {
		const idx = s.integrations.findIndex((i) => i.name === name);
		if (idx >= 0) {
			s.integrations[idx] = {
				...s.integrations[idx],
				status: newStatus,
			};
		} else {
			s.integrations.push({
				name,
				status: newStatus,
				scope: defaultScope(name),
			});
		}
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when: new Date().toISOString().slice(0, 16).replace("T", " "),
			actor: session.login,
			action:
				action === "connect"
					? "requested integration"
					: "canceled integration request",
			target: name,
			source: "SSO",
		});
	});

	await flushConsole();
	return NextResponse.json({ ok: true, name, status: newStatus });
}
