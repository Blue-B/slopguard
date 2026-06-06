import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import IntegrationsFullView, {
	type IntegrationsFullViewCopy,
} from "@/app/components/IntegrationsFullView";

export const metadata = {
	title: "SlopGuard: Integrations - Enterprise",
	description:
		"Connect SlopGuard to Jira, PagerDuty, Datadog, Slack, Linear, or Opsgenie.",
};

const copy: IntegrationsFullViewCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise workspace",
	user: "blue-b",
	entitlement: "Enterprise plan",
	connectedLabel: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/enterprise" },
		{ label: "Queue", href: "/org/queue", external: true },
		{ label: "Repos", href: "/org/repos", external: true },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "SSO", href: "/enterprise#sso" },
		{ label: "Audit", href: "/enterprise/audit", external: true },
		{ label: "Integrations", href: "/enterprise/integrations" },
	],
	loading: "Loading integrations…",
	empty: "No integrations available. Contact your SlopGuard admin.",
	backHref: "/enterprise",
	backLabel: "Overview",
	heroEyebrow: "INTEGRATIONS / ENTERPRISE",
	heroTitle:
		"Forward events to your ticketing, paging, and observability tools.",
	heroBody:
		"Connect a provider to wire SlopGuard alerts into the systems your team already uses. Each connect/disconnect action is recorded in the audit log.",
	connect: "Connect",
	disconnect: "Disconnect",
	pending: "pending",
	available: "available",
	connected: "connected",
};

export default function IntegrationsPage() {
	return (
		<>
			<MarketingNav
				lang="en"
				enHref="/enterprise/integrations"
				koHref="/ko/enterprise/integrations"
			/>
			<PlanGate lang="en" required="enterprise">
				<IntegrationsFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
