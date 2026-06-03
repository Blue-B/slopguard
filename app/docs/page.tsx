import type { Metadata } from "next";
import DocsBody from "@/app/components/DocsBody";

export const metadata: Metadata = {
	title: "SlopGuard Docs",
	description:
		"Install, slash commands, scoring, and configuring SlopGuard with .github/SLOP_POLICY.yml.",
	alternates: { canonical: "/docs" },
};

export default function Page() {
	return <DocsBody lang="en" />;
}
