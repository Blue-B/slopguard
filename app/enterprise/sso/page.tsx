import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import SsoFullView, {
	type SsoFullViewCopy,
} from "@/app/components/SsoFullView";

export const metadata: Metadata = {
	title: "SlopGuard: SAML SSO - Enterprise",
	description:
		"Configure SAML SSO for SlopGuard Enterprise: IdP, metadata, attribute mapping, enforcement.",
};

const copy: SsoFullViewCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "Governance console",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/enterprise" },
		{ label: "SSO", href: "/enterprise/sso" },
		{ label: "Audit", href: "/enterprise/audit" },
		{ label: "Integrations", href: "/enterprise/integrations" },
	],
	loading: "Loading SSO configuration…",
	eyebrow: "ENTERPRISE / SAML SSO",
	title: "SAML single sign-on, governed by your IdP.",
	body: "Configure your identity provider, attribute mapping, and enforcement policy. Connection details below are what your IdP admin needs to complete the SAML handshake.",
	configTitle: "Identity configuration",
	configSub: "SAML metadata and enforcement controls stay connected to the live backend.",
	endpointsTitle: "Service endpoints",
	providerLabel: "Identity provider",
	idpMetadataLabel: "IdP metadata URL",
	idpMetadataPlaceholder:
		"https://your-idp.example.com/app/slopguard/sso/saml/metadata",
	emailAttributeLabel: "Email attribute",
	loginAttributeLabel: "Login attribute",
	enforcedLabel: "Enforcement",
	enforcedHint:
		"When enabled, GitHub login is disabled for members of this workspace.",
	activateCta: "Activate SSO",
	deactivateCta: "Deactivate",
	saveCta: "Save changes",
	savingCta: "Saving…",
	savedCta: "Saved",
	statusLabel: "Status",
	providerMetaLabel: "Provider",
	enforcedMetaLabel: "Enforced",
	entityIdLabel: "SP entity ID",
	acsUrlLabel: "ACS URL (assertion consumer)",
	lastSyncLabel: "Last sync",
	statusActive: "Active",
	statusPending: "Pending",
	statusUnconfigured: "Unconfigured",
	helpTitle: "Setup checklist",
	helpSteps: [
		{ name: "1. Provider", value: "Create a new SAML 2.0 application in your IdP." },
		{ name: "2. ACS URL", value: "Paste the ACS URL above into the IdP's Reply URL field." },
		{ name: "3. Entity ID", value: "Set the IdP's Audience URI to the SP entity ID above." },
		{ name: "4. Attributes", value: "Map the email and login claims to the attributes shown in the form." },
		{ name: "5. Metadata", value: "Paste the IdP metadata URL above and click Activate SSO." },
	],
	providerOptions: [
		{ value: "okta", label: "Okta" },
		{ value: "azure-ad", label: "Microsoft Entra ID" },
		{ value: "google", label: "Google Workspace" },
		{ value: "onelogin", label: "OneLogin" },
		{ value: "generic", label: "Generic SAML 2.0" },
	],
};

export default function SsoPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/enterprise/sso" koHref="/ko/enterprise/sso" />
			<PlanGate lang="en" required="enterprise">
				<SsoFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
