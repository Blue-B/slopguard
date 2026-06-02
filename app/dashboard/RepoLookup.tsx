"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export default function RepoLookup({ lang = "en" }: { lang?: Lang }) {
	const router = useRouter();
	const [value, setValue] = useState("");
	const base = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const placeholder = "owner/repo";

	function go(e: React.FormEvent) {
		e.preventDefault();
		const m = value.trim().replace(/^https?:\/\/github\.com\//, "");
		const [owner, repo] = m.split("/");
		if (owner && repo) router.push(`${base}/${owner}/${repo}`);
	}

	return (
		<form onSubmit={go} className="card" style={{ display: "flex", gap: 8 }}>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder}
				style={{
					flex: 1,
					padding: "10px 12px",
					background: "#0d1117",
					color: "var(--fg)",
					border: "1px solid var(--border)",
					borderRadius: 8,
				}}
			/>
			<button type="submit" className="btn btn-primary">
				{lang === "ko" ? "보기" : "View"}
			</button>
		</form>
	);
}
