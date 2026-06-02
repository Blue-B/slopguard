import type { Metadata } from "next";
import SetupClient from "./SetupClient";

export const metadata: Metadata = {
	title: "Self-host SlopGuard",
	description:
		"Create your own SlopGuard GitHub App from a manifest and run it on your own server. Most people should use the hosted app instead.",
	alternates: { canonical: "/setup" },
};

export default function SetupPage() {
	return <SetupClient />;
}
