import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession, effectiveOwner } from "@/lib/auth/session";
import { hasSso } from "@/lib/billing/entitlement";
import { getState, ensureConsoleReady } from "@/lib/billing/console-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/enterprise/state
 *
 * Read-only view of the signed-in owner's Enterprise console: audit log,
 * integrations, and SSO config status. The export endpoint
 * (GET /api/audit/export) records an "exported" entry into the same audit
 * log so a refresh of this view will reflect that action.
 */
export async function GET() {
	await ensureConsoleReady();
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const owner = effectiveOwner(session);
	const ok = await hasSso(owner);
	if (!ok) {
		return NextResponse.json(
			{ error: "forbidden", reason: "Enterprise plan required" },
			{ status: 403 },
		);
	}

	const state = getState(owner);

	return NextResponse.json({
		owner: state.owner,
		sso: {
			// Don't claim a provider until SSO is actually configured. "Okta" was just
			// the default dropdown value and read as a fake connection when unconfigured.
			provider:
				state.ssoConfig.status === "unconfigured"
					? "\u2014"
					: state.ssoConfig.provider === "okta"
						? "Okta SAML 2.0"
						: state.ssoConfig.provider === "azure-ad"
							? "Microsoft Entra ID SAML 2.0"
							: state.ssoConfig.provider === "google"
								? "Google Workspace SAML 2.0"
								: state.ssoConfig.provider === "onelogin"
									? "OneLogin SAML 2.0"
									: "Generic SAML 2.0",
			status: state.ssoConfig.status,
			lastSync:
				state.ssoConfig.lastSync ??
				(state.ssoConfig.status === "active"
					? new Date().toISOString()
					: new Date(0).toISOString()),
			enforced: state.ssoConfig.enforced,
		},
		audit: state.audit.slice(0, 20),
		integrations: state.integrations,
	});
}
