import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { decideNetworkSignal } from "../lib/intel/network.js";
import { isSafeWebhookUrl } from "../lib/net/ssrf.js";

describe("network intelligence decision", () => {
	it("no signal below the distinct-owner threshold", () => {
		const s = decideNetworkSignal(1, 0, 0);
		assert.equal(s.delta, 0);
		assert.equal(s.reason, null);
	});

	it("boosts when 2+ owners flagged the fingerprint", () => {
		const s = decideNetworkSignal(2, 0, 0);
		assert.ok(s.delta > 0);
		assert.match(s.reason ?? "", /2 owners/);
	});

	it("boosts at higher owner counts too", () => {
		assert.ok(decideNetworkSignal(5, 3, 0).delta > 0);
	});

	it("suppresses a pattern repeatedly cleared as false positive", () => {
		const s = decideNetworkSignal(9, 1, 4);
		assert.ok(s.delta < 0);
		assert.match(s.reason ?? "", /false positive/);
	});

	it("suppress requires cleared >= 3", () => {
		// only 2 clears: not enough evidence to suppress; owner count wins
		assert.ok(decideNetworkSignal(4, 0, 2).delta > 0);
	});

	it("suppress requires cleared to dominate confirmed (cleared > 2x)", () => {
		// 3 cleared but 2 confirmed: contested, fall through to boost
		assert.ok(decideNetworkSignal(2, 2, 3).delta > 0);
	});

	it("boost can flip a borderline score over the default threshold", () => {
		const s = decideNetworkSignal(3, 0, 0);
		const adjusted = Math.min(100, 38 + s.delta);
		assert.ok(adjusted >= 50);
	});

	it("suppress can pull a borderline score under the default threshold", () => {
		const s = decideNetworkSignal(2, 0, 5);
		const adjusted = Math.max(0, 55 + s.delta);
		assert.ok(adjusted < 50);
	});
});

describe("SSRF webhook target guard", () => {
	it("accepts a normal public https webhook", () => {
		assert.ok(isSafeWebhookUrl("https://hooks.slack.com/services/T0/B0/x"));
		assert.ok(isSafeWebhookUrl("https://example.com/inbound"));
	});

	it("rejects plain http", () => {
		assert.equal(isSafeWebhookUrl("http://example.com/hook"), false);
	});

	it("rejects IP literals (public or private)", () => {
		assert.equal(isSafeWebhookUrl("https://10.0.0.5/hook"), false);
		assert.equal(isSafeWebhookUrl("https://169.254.169.254/latest/meta-data/"), false);
		assert.equal(isSafeWebhookUrl("https://8.8.8.8/hook"), false);
	});

	it("rejects localhost and internal-style names", () => {
		assert.equal(isSafeWebhookUrl("https://localhost/hook"), false);
		assert.equal(isSafeWebhookUrl("https://redis/hook"), false);
		assert.equal(isSafeWebhookUrl("https://db.internal/hook"), false);
		assert.equal(isSafeWebhookUrl("https://printer.local/hook"), false);
		assert.equal(isSafeWebhookUrl("https://metadata.google.internal/computeMetadata/v1/"), false);
	});

	it("rejects garbage and ipv6 literals", () => {
		assert.equal(isSafeWebhookUrl("not a url"), false);
		assert.equal(isSafeWebhookUrl("https://[::1]/hook"), false);
	});

	it("rejects encoded-IP and obfuscation bypasses", () => {
		assert.equal(isSafeWebhookUrl("https://2130706433/"), false); // decimal IP
		assert.equal(isSafeWebhookUrl("https://0x7f000001/"), false); // hex IP
		assert.equal(isSafeWebhookUrl("https://user:pass@evil.com/"), false); // credentials
		assert.equal(isSafeWebhookUrl("https://localhost./"), false); // trailing dot
	});
});
