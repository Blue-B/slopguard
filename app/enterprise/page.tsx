import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import SignInGate from "@/app/components/SignInGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Enterprise - SSO, Audit, Compliance",
	description: "Enterprise console: SAML SSO, audit log, integrations.",
};

const nav = [
	{ label: "Overview", href: "/enterprise" },
	{ label: "SSO", href: "/enterprise/sso" },
	{ label: "Audit", href: "/enterprise/audit" },
	{ label: "Integrations", href: "/enterprise/integrations" },
];

const copy: EnterpriseConsoleCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "Enterprise",
	connected: "Connected to GitHub",
	nav,
	loading: "Loading…",
	heroEyebrow: "ENTERPRISE / COMPLIANCE",
	heroTitle: "Run SlopGuard with the controls your security team expects.",
	heroBody:
		"SAML SSO, a full audit trail, and integration requests. The audit log records every config change, channel send, and export in real time.",
	heroCta: "Open audit log",
	heroCtaHref: "/enterprise/audit",
	metricLabels: { audit: "Audit entries", integrations: "Integrations", ssoProvider: "SSO provider", ssoStatus: "SSO status" },
	ssoTitle: "SAML SSO",
	ssoSubtitle: "Identity is governed by your IdP, not by SlopGuard.",
	ssoLabels: { provider: "Provider", status: "Status", lastSync: "Last sync" },
	auditEmpty: "No audit entries yet.",
	integrationsEmpty: "No connected or requested integrations.",
	auditTitle: "Audit log",
	auditSubtitle: "Every config change, channel send, and export",
	auditViewAll: "Open full log",
	auditViewAllHref: "/enterprise/audit",
	integrationsTitle: "Integrations",
	integrationsSubtitle: "Forward events to ticketing, paging, and observability tools",
	integrationsViewAll: "Manage integrations",
	integrationsViewAllHref: "/enterprise/integrations",
};

export default function EnterprisePage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/enterprise" koHref="/ko/enterprise" />
			<SignInGate lang="en">
				<EnterpriseConsole copy={copy} />
			</SignInGate>
			<SiteFooter lang="en" />
		</>
	);
}
