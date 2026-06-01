import type { Metadata } from "next";

const title = "SlopGuard: AI 슬롭 PR을 격리하는 GitHub App";
const description =
	"AI가 생성한 저품질 PR과 이슈를 점수화하고 출처를 태깅해 격리합니다. 절대 자동으로 닫지 않고, 최종 결정은 사람이 합니다.";

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: "/ko", languages: { en: "/", ko: "/ko" } },
	openGraph: { title, description, images: ["/hero-emblem.png"] },
	twitter: { card: "summary_large_image", title, description },
};

export default function KoLayout({ children }: { children: React.ReactNode }) {
	// Korean segment renders inside the root <html lang="en">; set the lang on a
	// wrapper so assistive tech reads this subtree as Korean.
	return <div lang="ko">{children}</div>;
}
