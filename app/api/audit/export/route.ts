import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { hasSso } from "@/lib/billing/entitlement";
import { getState, mutateState } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
	return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function forbidden(reason: string) {
	return NextResponse.json({ error: "forbidden", reason }, { status: 403 });
}

export async function GET(req: Request) {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) return unauthorized();

	const ok = await hasSso(session.login);
	if (!ok) return forbidden("audit export requires the Enterprise plan");

	const url = new URL(req.url);
	const format = url.searchParams.get("format") === "csv" ? "csv" : "json";

	const state = getState(session.login);
	const when = new Date().toISOString().slice(0, 16).replace("T", " ");
	mutateState(session.login, (s) => {
		s.audit.unshift({
			id: `au_${Math.random().toString(36).slice(2, 10)}`,
			owner: s.owner,
			when,
			actor: session.login,
			action: "exported audit log",
			target: format.toUpperCase(),
			source: "SSO",
		});
	});

	const payload = {
		exportedAt: new Date().toISOString(),
		owner: state.owner,
		count: state.audit.length,
		entries: state.audit,
	};

	if (format === "csv") {
		const header = "id,when,actor,action,target,source";
		const lines = state.audit.map((e) =>
			[e.id, e.when, e.actor, e.action, e.target, e.source]
				.map((s) => `"${String(s).replace(/"/g, '""')}"`)
				.join(","),
		);
		return new NextResponse([header, ...lines].join("\n"), {
			headers: {
				"content-type": "text/csv; charset=utf-8",
				"content-disposition": `attachment; filename="slopguard-audit-${state.owner}-${Date.now()}.csv"`,
			},
		});
	}

	return new NextResponse(JSON.stringify(payload, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"content-disposition": `attachment; filename="slopguard-audit-${state.owner}-${Date.now()}.json"`,
		},
	});
}
