import type { Metadata } from "next";
import LegalBody from "@/app/components/LegalBody";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms for the hosted SlopGuard service: the free triage tool, acceptable use, no warranty, and liability.",
	alternates: { canonical: "/terms" },
};

export default function Page() {
	return <LegalBody doc="terms" lang="en" />;
}
