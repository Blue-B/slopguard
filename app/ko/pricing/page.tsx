import type { Metadata } from "next";
import PricingBody from "@/app/components/PricingBody";

export const metadata: Metadata = {
	title: "SlopGuard 요금제",
	description:
		"셀프호스팅은 무료. 유료 플랜은 매니지드 LLM, 비공개 레포, 레포 교차 패턴 탐지, 조직 현황, 알림을 포함합니다.",
	alternates: { canonical: "/ko/pricing" },
};

export default function Page() {
	return <PricingBody lang="ko" />;
}
