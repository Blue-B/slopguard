import Landing from "../components/Landing";

export const metadata = {
	title: "SlopGuard: AI 슬롭 PR을 격리하는 GitHub App",
	description:
		"AI가 생성한 저품질 PR과 이슈를 점수화하고 출처를 태깅해 격리하되, 절대 자동으로 닫지 않습니다. 최종 결정은 사람이.",
};

export default function HomeKo() {
	return <Landing lang="ko" />;
}
