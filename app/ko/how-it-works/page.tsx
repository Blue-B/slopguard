import type { Metadata } from "next";
import HowItWorksBody from "@/app/components/HowItWorksBody";

export const metadata: Metadata = {
	title: "SlopGuard 동작 방식",
	description:
		"GitHub 웹훅부터 점수와 라벨, 리뷰 코멘트까지 몇 초. 규칙 휴리스틱, 출처 추적, 선택적 LLM 판정. 붙일 CI도, 돌릴 서버도 없습니다.",
	alternates: { canonical: "/ko/how-it-works" },
};

export default function Page() {
	return <HowItWorksBody lang="ko" />;
}
