import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session";
import { getState, mutateState, pushAudit } from "@/lib/billing/console-store";
import { hasSso } from "@/lib/billing/entitlement";
import type { SsoConfig, SsoProvider } from "@/lib/billing/console-store";

const VALID_PROVIDERS: SsoProvider[] = [
	"okta",
	"azure-ad",
	"google",
	"onelogin",
	"generic",
];

async function ownerOrError() {
	const store = await cookies();
	const session = decodeSession(store.get(SESSION_COOKIE)?.value);
	if (!session) {
		return {
			error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
		};
	}
	if (!(await hasSso(session.login))) {
		return {
			error: NextResponse.json(
				{ error: "forbidden", message: "SSO is an Enterprise plan feature." },
				{ status: 403 },
			),
		};
	}
	return { owner: session.login };
}

export async function GET() {
	const auth = await ownerOrError();
	if ("error" in auth) return auth.error;
	const s = getState(auth.owner);
	return NextResponse.json({ owner: s.owner, sso: s.ssoConfig });
}

export async function POST(req: Request) {
	const auth = await ownerOrError();
	if ("error" in auth) return auth.error;

	let body: Partial<SsoConfig> & { activate?: boolean } = {};
	try {
		body = (await req.json()) as Partial<SsoConfig> & { activate?: boolean };
	} catch {
		return NextResponse.json({ error: "invalid-json" }, { status: 400 });
	}

	const updates: Partial<SsoConfig> = {};
	if (
		typeof body.provider === "string" &&
		VALID_PROVIDERS.includes(body.provider as SsoProvider)
	) {
		updates.provider = body.provider as SsoProvider;
	}
	if (typeof body.idpMetadataUrl === "string") {
		updates.idpMetadataUrl = body.idpMetadataUrl.slice(0, 1024);
	}
	if (typeof body.emailAttribute === "string") {
		updates.emailAttribute = body.emailAttribute.slice(0, 64);
	}
	if (typeof body.loginAttribute === "string") {
		updates.loginAttribute = body.loginAttribute.slice(0, 64);
	}
	if (typeof body.enforced === "boolean") {
		updates.enforced = body.enforced;
	}
	if (body.activate === true) {
		updates.status = "active";
		updates.lastSync = new Date().toISOString();
	} else if (body.activate === false) {
		updates.status = "unconfigured";
		updates.lastSync = undefined;
	}

	const before = getState(auth.owner).ssoConfig;
	const after = mutateState(auth.owner, (s) => {
		s.ssoConfig = { ...s.ssoConfig, ...updates };
	}).ssoConfig;

	const diff: string[] = [];
	const a = after as unknown as Record<string, unknown>;
	const b = before as unknown as Record<string, unknown>;
	for (const k of Object.keys(updates) as (keyof SsoConfig)[]) {
		const av = a[k];
		const bv = b[k];
		if (JSON.stringify(av) !== JSON.stringify(bv)) diff.push(k);
	}
	if (diff.length > 0) {
		pushAudit(auth.owner, {
			actor: auth.owner,
			action: body.activate === true ? "sso.activated" : "sso.updated",
			target: `sso.${diff.join(",")}`,
			source: "Admin",
		});
	}

	return NextResponse.json({ owner: auth.owner, sso: after });
}
