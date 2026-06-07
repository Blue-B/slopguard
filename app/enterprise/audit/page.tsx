import type { Metadata } from "next";
import MarketingNav from "@/app/components/MarketingNav";
import PlanGate from "@/app/components/PlanGate";
import SiteFooter from "@/app/components/SiteFooter";
import AuditFullView, {
	type AuditFullViewCopy,
} from "@/app/components/AuditFullView";

export const metadata: Metadata = {
	title: "SlopGuard: Audit Log - Enterprise",
	description: "Every action that affects your org is recorded. Exportable as JSON or CSV.",
};

const copy: AuditFullViewCopy = {
	kicker: "SlopGuard Enterprise",
	workspace: "Governance console",
	connected: "Connected to GitHub",
	nav: [
		{ label: "Overview", href: "/enterprise" },
		{ label: "SSO", href: "/enterprise/sso" },
		{ label: "Audit", href: "/enterprise/audit" },
		{ label: "Integrations", href: "/enterprise/integrations" },
	],
	loading: "Loading audit log…",
	empty:
		"No audit entries yet. Every config change, channel send, and export shows up here.",
	heroEyebrow: "AUDIT / ENTERPRISE",
	heroTitle: "Every action that affects the org, in one place.",
	heroBody:
		"Channel add/remove, integration connect/disconnect, and audit export all land here. Exportable as JSON or CSV - each export itself records an entry.",
	tableTitle: "Audit trail",
	tableSub: "Most recent first. Every config change and export is recorded.",
	columns: { when: "When", actor: "Actor", action: "Action", target: "Target", source: "Source" },
	exportJson: "Export JSON",
	exportCsv: "Export CSV",
	exportedNote: "downloaded",
};

export default function AuditPage() {
	return (
		<>
			<MarketingNav lang="en" enHref="/enterprise/audit" koHref="/ko/enterprise/audit" />
			<PlanGate lang="en" required="enterprise">
				<AuditFullView copy={copy} />
			</PlanGate>
			<SiteFooter lang="en" />
		</>
	);
}
