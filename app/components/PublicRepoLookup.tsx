"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const T = {
	en: {
		placeholder: "owner/repo (e.g. facebook/react)",
		button: "Look up",
		hint: "Opens the repository's full slop history.",
	},
	ko: {
		placeholder: "owner/repo (예: facebook/react)",
		button: "조회",
		hint: "레포의 전체 슬롭 기록 페이지를 엽니다.",
	},
} as const;

export default function PublicRepoLookup({ lang }: { lang: Lang }) {
	const t = T[lang];
	const dashBase = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const router = useRouter();
	const [value, setValue] = useState("");

	function go(e: React.FormEvent) {
		e.preventDefault();
		const m = value
			.trim()
			.replace(/^https?:\/\/github\.com\//, "")
			.replace(/\/+$/, "");
		const [owner, repo] = m.split("/");
		if (!owner || !repo) return;
		router.push(
			`${dashBase}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
		);
	}

	return (
		<form onSubmit={go} className="scanbar">
			<svg
				className="scan-glyph"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="7" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={t.placeholder}
				aria-label={t.placeholder}
				className="scan-input"
			/>
			<button type="submit" className="btn btn-primary scan-btn">
				{t.button}
			</button>
		</form>
	);
}
