import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import IntegrationsFullView, {
	type IntegrationsFullViewCopy,
} from "@/app/components/IntegrationsFullView";

export const metadata: Metadata = {
	title: "SlopGuard: Integrations - Enterprise",
	description: "Connect Jira, PagerDuty, Datadog, Slack, Linear, Opsgenie.",
};

const copy: IntegrationsFullViewCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "Governance console",
	connectedLabel: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/enterprise" },
		{ label: "SSO", href: "/enterprise/sso" },
		{ label: "Audit", href: "/enterprise/audit" },
		{ label: "Integrations", href: "/enterprise/integrations" },
	],
	loading: "Loading integrations…",
	empty: "No integrations available. Contact your SlopGuard admin.",
	heroEyebrow: "INTEGRATIONS / ENTERPRISE",
	heroTitle: "Forward events to your ticketing, paging, and observability tools.",
	heroBody:
		"Connect a provider to wire SlopGuard alerts into the systems your team already uses. Each connect/disconnect action is recorded in the audit log.",
	sectionTitle: "Available integrations",
	sectionSub: "Connect or disconnect instantly; each action is recorded in the audit log.",
	connect: "Connect",
	disconnect: "Disconnect",
	pending: "pending",
	available: "available",
	connected: "connected",
};

export default function IntegrationsPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/enterprise/integrations" koHref="/ko/enterprise/integrations" />
			<PlanGate lang="en" required="enterprise">
				<IntegrationsFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
