import type { Metadata } from "next";
import DocsBody from "@/app/components/DocsBody";

export const metadata: Metadata = {
	title: "SlopGuard 문서",
	description:
		"설치, 슬래시 명령, 점수, 그리고 .github/SLOP_POLICY.yml로 SlopGuard 동작을 설정하는 방법.",
	alternates: { canonical: "/ko/docs" },
};

export default function Page() {
	return <DocsBody lang="ko" />;
}
