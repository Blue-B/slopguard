import { NextResponse, after } from "next/server";
import type { EmitterWebhookEventName } from "@octokit/webhooks";
import { getApp } from "@/lib/github/app";
import { claimDelivery } from "@/lib/cache";
import { applyMarketplaceEvent } from "@/lib/billing/marketplace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
	const id = req.headers.get("x-github-delivery");
	const name = req.headers.get(
		"x-github-event",
	) as EmitterWebhookEventName | null;
	const signature = req.headers.get("x-hub-signature-256");

	if (!id || !name || !signature) {
		return NextResponse.json(
			{ error: "missing GitHub webhook headers" },
			{ status: 400 },
		);
	}

	const body = await req.text();

	let app: ReturnType<typeof getApp>;
	try {
		app = getApp();
	} catch (err) {
		console.error("[slopguard] app init failed:", err);
		return NextResponse.json(
			{ error: "server not configured" },
			{ status: 500 },
		);
	}

	// 1) Verify the signature synchronously (fast, constant-time).
	let valid = false;
	try {
		valid = await app.webhooks.verify(body, signature);
	} catch (err) {
		console.error("[slopguard] signature verify error:", err);
	}
	if (!valid) {
		return NextResponse.json({ error: "invalid signature" }, { status: 401 });
	}

	// 2) De-dupe GitHub re-deliveries (timeout/retry storms).
	if (!claimDelivery(id)) {
		return NextResponse.json({ ok: true, deduped: true });
	}

	// 3) Parse and process in the BACKGROUND so we ACK GitHub within its ~10s
	//    delivery window. `after()` keeps the function alive on Vercel until the
	//    work settles, and runs it post-response in local dev too.
	let payload: unknown;
	try {
		payload = JSON.parse(body);
	} catch {
		return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
	}

	// GitHub Marketplace purchases arrive on the App webhook. Handle them here
	// (octokit's app emitter has no marketplace handler) and ACK.
	if (name === ("marketplace_purchase" as EmitterWebhookEventName)) {
		try {
			await applyMarketplaceEvent(payload);
		} catch (err) {
			console.error("[slopguard] marketplace event failed:", err);
		}
		return NextResponse.json({ ok: true, marketplace: true });
	}

	after(
		app.webhooks
			.receive({ id, name, payload } as Parameters<
				typeof app.webhooks.receive
			>[0])
			.catch((err) =>
				console.error("[slopguard] background processing failed:", err),
			),
	);

	return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}

export function GET() {
	return NextResponse.json({
		endpoint: "slopguard webhook",
		method: "POST only",
		events: ["pull_request", "issues", "issue_comment"],
	});
}
