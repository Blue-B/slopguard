import RepoDashboard from "@/app/components/RepoDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page({
	params,
}: {
	params: Promise<{ owner: string; repo: string }>;
}) {
	const { owner, repo } = await params;
	return <RepoDashboard lang="ko" owner={owner} repo={repo} />;
}
