import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata: Metadata = {
	title: "SlopGuard: Enterprise - SSO, Audit, Compliance",
	description: "Enterprise plan console: SAML SSO, audit log, integrations, support contract.",
};

const nav = [
	{ label: "Overview", href: "/enterprise" },
	{ label: "SSO", href: "/enterprise/sso" },
	{ label: "Audit", href: "/enterprise/audit" },
	{ label: "Integrations", href: "/enterprise/integrations" },
];

const copy: EnterpriseConsoleCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "Governance console",
	connected: "Connected to GitHub",
	nav,
	loading: "Loading…",
	heroEyebrow: "ENTERPRISE / COMPLIANCE",
	heroTitle: "Run SlopGuard with the controls your security team expects.",
	heroBody:
		"SAML SSO, full audit trail, custom integrations, and a 24/7 support contract. The audit log records every config change, channel send, and export.",
	heroCta: "Open audit log",
	heroCtaHref: "/enterprise/audit",
	metricLabels: { audit: "Audit entries", integrations: "Integrations", ssoProvider: "SSO provider", ssoStatus: "SSO status" },
	ssoTitle: "SAML SSO",
	ssoSubtitle: "Identity is governed by your IdP, not by SlopGuard.",
	ssoLabels: { provider: "Provider", status: "Status", lastSync: "Last sync" },
	supportTitle: "Support",
	supportSubtitle: "Dedicated channel for P1 incidents and security reviews.",
	supportSla: "P1 SLA",
	supportHours: "Hours",
	supportAccountMgr: "Account mgr",
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
			<PlanGate lang="en" required="enterprise">
				<EnterpriseConsole copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
