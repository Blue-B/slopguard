import type { Metadata } from "next";
import DashboardHome from "@/app/components/DashboardHome";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "대시보드" };

export default function DashboardPageKo() {
	return <DashboardHome lang="ko" />;
}
