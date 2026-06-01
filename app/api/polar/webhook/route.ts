import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPolarEnv } from "@/lib/env";
import { invalidateEntitlements } from "@/lib/billing/polar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Polar webhook receiver. Polar follows the Standard Webhooks spec
// (https://www.standardwebhooks.com/): the secret signs
// `${webhook-id}.${webhook-timestamp}.${body}` with HMAC-SHA256, base64-encoded,
// delivered in the `webhook-signature` header as space-separated `v1,<sig>`.
//
// We only need this to keep entitlements fresh: any subscription/order/customer
// change invalidates the cached owner→plan map so the next gate check refetches
// from Polar. The map itself is rebuilt from the Polar API, so a missed webhook
// only delays propagation by the cache TTL — it never corrupts state.

function secretKeys(secret: string): Buffer[] {
	const raw = secret.replace(/^whsec_/, "");
	const keys: Buffer[] = [];
	// Standard Webhooks: the key is base64 after the optional `whsec_` prefix.
	try {
		const b = Buffer.from(raw, "base64");
		if (b.length) keys.push(b);
	} catch {
		// ignore
	}
	// Fallback: some setups sign with the literal secret bytes.
	keys.push(Buffer.from(secret, "utf8"));
	return keys;
}

function verify(
	secret: string,
	id: string,
	timestamp: string,
	body: string,
	header: string,
): boolean {
	const signed = `${id}.${timestamp}.${body}`;
	const provided = header
		.split(" ")
		.map((p) => p.split(",", 2)[1] ?? p)
		.filter(Boolean);
	for (const key of secretKeys(secret)) {
		const expected = createHmac("sha256", key).update(signed).digest("base64");
		const exp = Buffer.from(expected);
		for (const sig of provided) {
			const got = Buffer.from(sig);
			if (got.length === exp.length && timingSafeEqual(got, exp)) return true;
		}
	}
	return false;
}

const REFRESH_PREFIXES = ["subscription.", "order.", "benefit_grant.", "customer.state"];

export async function POST(req: Request) {
	const { webhookSecret } = getPolarEnv();
	if (!webhookSecret) {
		return NextResponse.json({ error: "polar webhook not configured" }, { status: 501 });
	}

	const id = req.headers.get("webhook-id");
	const timestamp = req.headers.get("webhook-timestamp");
	const signature = req.headers.get("webhook-signature");
	if (!id || !timestamp || !signature) {
		return NextResponse.json({ error: "missing webhook headers" }, { status: 400 });
	}

	const body = await req.text();
	if (!verify(webhookSecret, id, timestamp, body, signature)) {
		return NextResponse.json({ error: "invalid signature" }, { status: 401 });
	}

	let type = "";
	try {
		type = String((JSON.parse(body) as { type?: string }).type ?? "");
	} catch {
		return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
	}

	if (REFRESH_PREFIXES.some((p) => type.startsWith(p))) {
		invalidateEntitlements();
		console.log(`[slopguard] polar ${type} → entitlements invalidated`);
	}

	return NextResponse.json({ ok: true, type });
}

export function GET() {
	return NextResponse.json({
		endpoint: "slopguard polar webhook",
		method: "POST only",
		spec: "standard-webhooks",
	});
}
