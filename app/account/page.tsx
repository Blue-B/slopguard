import type { Metadata } from "next";
import Account from "../components/Account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "SlopGuard Account" };

export default async function AccountPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	return <Account lang="en" error={error} />;
}
