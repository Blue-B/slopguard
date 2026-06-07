import Account from "../../components/Account";

export const dynamic = "force-dynamic";
export const metadata = { title: "SlopGuard 마이페이지" };

export default async function AccountPageKo({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; billing?: string }>;
}) {
	const { error, billing } = await searchParams;
	return <Account lang="ko" error={error} billing={billing} />;
}
