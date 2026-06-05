import MarketingNav from "@/app/components/MarketingNav";
import EnterpriseConsole, {
	type EnterpriseConsoleCopy,
} from "@/app/components/EnterpriseConsole";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";

export const metadata = {
	title: "SlopGuard: Enterprise Portal — SSO, Audit, Self-host",
	description:
		"Enterprise console: SAML/SSO configuration, audit log, support contract, and custom integrations.",
};

const copy: EnterpriseConsoleCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise workspace",
	user: "Blue-B",
	entitlement: "Enterprise entitlement active",
	connected: "● Connected via SSO",
	nav: [
		"Overview",
		"Queue",
		"Repos",
		"Campaigns",
		"Alerts",
		"SSO",
		"Audit",
		"Support",
	],
	activeNav: "Overview",
	eyebrow: "ENTERPRISE FEATURE",
	title: "Run SlopGuard across your entire organization with controls.",
	subtitle:
		"The Enterprise plan includes this portal: SAML/SSO configuration, audit log with export, custom integrations, and a named support contact with a 1-hour P1 SLA.",
	backToOrg: "Org dashboard",
	contactSales: "Contact sales",
	accountHref: "/account",
	orgHref: "/org",
	alertsHref: "/alerts",
	campaignsHref: "/campaigns",
	metrics: [
		{ label: "SSO", value: "Active", detail: "Okta · SAML 2.0" },
		{
			label: "Audit retention",
			value: "365d",
			detail: "configurable per plan",
		},
		{ label: "Self-host", value: "On", detail: "managed by your team" },
		{ label: "Support SLA", value: "1h P1", detail: "24×7, named contact" },
	],
	ssoTitle: "SSO / SAML",
	ssoSubtitle: "Identity provider and session policy",
	ssoStatus: "Status",
	ssoProvider: "Provider",
	ssoLastSync: "Last SCIM sync",
	ssoConfigure: "Configure",
	auditTitle: "Audit log",
	auditSubtitle: "Every privileged action across SlopGuard, exportable",
	auditColumns: {
		when: "When",
		actor: "Actor",
		action: "Action",
		target: "Target",
		source: "Source",
	},
	audit: [
		{
			when: "2026-06-04 14:22",
			actor: "alice@acme.com",
			action: "cleared quarantine",
			target: "acme/web#128",
			source: "SSO",
		},
		{
			when: "2026-06-04 11:08",
			actor: "ops-bot",
			action: "rotated webhook secret",
			target: "org settings",
			source: "API",
		},
		{
			when: "2026-06-03 18:44",
			actor: "bob@acme.com",
			action: "added repository",
			target: "acme/api",
			source: "Admin",
		},
		{
			when: "2026-06-03 09:11",
			actor: "ci-bot",
			action: "configured alert channel",
			target: "Slack #security",
			source: "API",
		},
		{
			when: "2026-06-02 16:02",
			actor: "carol@acme.com",
			action: "exported audit log",
			target: "Q2 2026",
			source: "SSO",
		},
	],
	exportAudit: "Export JSON",
	integrationsTitle: "Custom integrations",
	integrationsSubtitle: "Connect SlopGuard to your internal systems",
	connect: "Connect",
	integrations: [
		{
			name: "Jira",
			status: "connected",
			scope: "Create tickets for quarantined PRs in ENG project",
		},
		{
			name: "PagerDuty",
			status: "pending",
			scope: "Page on-call on High-risk campaign detection",
		},
		{
			name: "Datadog",
			status: "available",
			scope: "Forward audit events as Datadog logs",
		},
		{
			name: "Internal ticketing",
			status: "available",
			scope: "Generic webhook with custom payload template",
		},
	],
	supportTitle: "Support contract",
	supportSubtitle: "Named contact, SLA, and escalation path",
	supportSla: "SLA",
	supportHours: "Hours",
	supportAccountMgr: "Account manager",
	note: "Audit retention and self-host support are scoped per contract. Contact your account manager to adjust.",
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
