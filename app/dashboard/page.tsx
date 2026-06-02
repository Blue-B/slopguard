import { redirect } from "next/navigation";

// The dashboard was merged into My Account (single hub). Keep the URL working
// for old links by redirecting.
export default function DashboardIndex() {
	redirect("/account");
}
