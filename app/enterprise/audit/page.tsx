import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import AuditFullView, {
	type AuditFullViewCopy,
} from "@/app/components/AuditFullView";

export const metadata = {
	title: "SlopGuard: Audit Log - Enterprise",
	description:
		"Every action that affects the org is recorded here. Exportable as JSON or CSV.",
};

const copy: AuditFullViewCopy = {
	workspace: "SlopGuard",
	workspaceSub: "Enterprise workspace",
	user: "blue-b",
	entitlement: "Enterprise plan",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/enterprise" },
		{ label: "Queue", href: "/org/queue", external: true },
		{ label: "Repos", href: "/org/repos", external: true },
		{ label: "Campaigns", href: "/campaigns", external: true },
		{ label: "Alerts", href: "/alerts", external: true },
		{ label: "SSO", href: "/enterprise#sso" },
		{ label: "Audit", href: "/enterprise/audit" },
		{ label: "Integrations", href: "/enterprise/integrations" },
	],
	loading: "Loading audit log…",
	empty:
		"No audit entries yet. Every config change, channel send, and export shows up here.",
	backHref: "/enterprise",
	backLabel: "Overview",
	heroEyebrow: "AUDIT / ENTERPRISE",
	heroTitle: "Every action that affects the org, in one place.",
	heroBody:
		"Channel add/remove, integration connect/disconnect, and audit export all land here. Exportable as JSON or CSV - each export itself records an entry.",
	columns: {
		when: "When",
		actor: "Actor",
		action: "Action",
		target: "Target",
		source: "Source",
	},
	exportJson: "Export JSON",
	exportCsv: "Export CSV",
};

export default function AuditPage() {
	return (
		<>
			<MarketingNav
				lang="en"
				enHref="/enterprise/audit"
				koHref="/ko/enterprise/audit"
			/>
			<PlanGate lang="en" required="enterprise">
				<AuditFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
