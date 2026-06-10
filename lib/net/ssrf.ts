// SSRF guard for user-supplied webhook targets. Alert channels POST to a URL
// the customer typed in, which on a hosted service is a classic SSRF vector
// (cloud metadata endpoints, internal services). We only ever need to reach
// public HTTPS endpoints, so the policy is strict allow-list-by-shape:
//   - https only
//   - no IP-literal hosts at all (real webhook providers use hostnames)
//   - no localhost / link-local / RFC-1918-style names / cloud metadata names
// DNS-rebinding (a public hostname resolving to a private IP) is not covered
// here; the dispatch fetch has a short timeout and no response is surfaced to
// the user, which limits what a rebind can exfiltrate.

const BLOCKED_HOSTS = new Set([
	"localhost",
	"metadata.google.internal",
	"169.254.169.254",
	"metadata.azure.com",
]);

export function isSafeWebhookUrl(raw: string): boolean {
	let u: URL;
	try {
		u = new URL(raw);
	} catch {
		return false;
	}
	if (u.protocol !== "https:") return false;
	const host = u.hostname.toLowerCase();
	if (BLOCKED_HOSTS.has(host)) return false;
	if (host.endsWith(".local") || host.endsWith(".internal")) return false;
	// Any IPv4/IPv6 literal is rejected outright.
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
	if (host.includes(":") || host.startsWith("[")) return false;
	if (!host.includes(".")) return false; // bare intranet names like "redis"
	return true;
}
