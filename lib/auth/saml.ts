// Real SAML 2.0 Service Provider for Enterprise SSO.
//
// SlopGuard is the SP. The customer's IdP (Okta / Entra / Google / OneLogin /
// generic) is configured via its metadata URL (stored in the console SSO
// config). We fetch that metadata on demand, build a samlify IdentityProvider,
// and validate signed assertions on the ACS endpoint. Assertions MUST be signed
// (wantAssertionsSigned) so a forged SAMLResponse cannot mint a session.
import * as samlify from "samlify";
import * as validator from "@authenio/samlify-node-xmllint";

// samlify refuses to run without a schema validator. The xmllint (wasm) one
// works in the Node runtime that our SSO routes pin.
samlify.setSchemaValidator(validator);

export function ssoBaseUrl(): string {
	return (process.env.APP_BASE_URL || "https://slopguard.app").replace(/\/$/, "");
}

export function spEntityId(): string {
	return `${ssoBaseUrl()}/api/enterprise/sso/metadata`;
}

export function spAcsUrl(): string {
	return `${ssoBaseUrl()}/api/enterprise/sso/acs`;
}

export function getServiceProvider() {
	return samlify.ServiceProvider({
		entityID: spEntityId(),
		assertionConsumerService: [
			{
				Binding: samlify.Constants.namespace.binding.post,
				Location: spAcsUrl(),
			},
		],
		// We don't hold an SP signing key, so AuthnRequests go out unsigned
		// (every major IdP accepts this). Inbound assertions, however, must be
		// signed by the IdP, that is the trust anchor.
		authnRequestsSigned: false,
		wantAssertionsSigned: true,
		wantMessageSigned: false,
		allowCreate: true,
	});
}

const idpCache = new Map<string, { xml: string; at: number }>();
const IDP_TTL = 10 * 60 * 1000;

/** Fetch + cache the customer's IdP metadata XML from its published URL. */
export async function fetchIdpMetadata(url: string): Promise<string> {
	const cached = idpCache.get(url);
	if (cached && Date.now() - cached.at < IDP_TTL) return cached.xml;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error(`IdP metadata HTTP ${res.status}`);
	const xml = await res.text();
	if (!/EntityDescriptor/.test(xml)) {
		throw new Error("IdP metadata URL did not return SAML metadata XML");
	}
	idpCache.set(url, { xml, at: Date.now() });
	return xml;
}

export function getIdentityProvider(metadataXml: string) {
	return samlify.IdentityProvider({ metadata: metadataXml });
}

export type SamlIdentity = {
	nameId: string;
	email: string;
	login: string;
	attributes: Record<string, unknown>;
};

/**
 * Build the IdP redirect URL for a login, carrying the owner in RelayState so
 * the ACS endpoint knows which tenant's config to validate against.
 */
export async function buildLoginRedirect(
	idpMetadataUrl: string,
	owner: string,
): Promise<string> {
	const sp = getServiceProvider();
	const idp = getIdentityProvider(await fetchIdpMetadata(idpMetadataUrl));
	const { context } = sp.createLoginRequest(idp, "redirect");
	const sep = context.includes("?") ? "&" : "?";
	return `${context}${sep}RelayState=${encodeURIComponent(owner)}`;
}

/**
 * Validate a SAMLResponse against the owner's IdP and extract identity.
 * Throws if the signature/conditions are invalid.
 */
export async function parseAcs(
	idpMetadataUrl: string,
	samlResponse: string,
	emailAttribute: string,
	loginAttribute: string,
): Promise<SamlIdentity> {
	const sp = getServiceProvider();
	const idp = getIdentityProvider(await fetchIdpMetadata(idpMetadataUrl));
	const { extract } = await sp.parseLoginResponse(idp, "post", {
		body: { SAMLResponse: samlResponse },
	});
	const attrs: Record<string, unknown> = extract?.attributes ?? {};
	const nameId: string = extract?.nameID ?? "";
	const pick = (key: string): string => {
		const v = attrs[key] ?? attrs[key.toLowerCase()];
		return Array.isArray(v) ? String(v[0] ?? "") : v ? String(v) : "";
	};
	const email = pick(emailAttribute) || nameId;
	const login = pick(loginAttribute) || email || nameId;
	return { nameId, email, login, attributes: attrs };
}
