"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

interface Item {
	number: number;
	title: string;
	url: string;
	kind: "pull_request" | "issue";
	state: string;
	labels: string[];
}
interface Stats {
	repo: string;
	quarantined: number;
	cleared: number;
	open: number;
	closed: number;
	items: Item[];
	error?: string;
}

const T = {
	en: {
		placeholder: "owner/repo (e.g. facebook/react)",
		button: "Look up",
		looking: "Looking up…",
		notFound:
			"Couldn't load that repo. Check the owner/repo and that SlopGuard is installed on it.",
		q: "quarantined",
		c: "cleared",
		o: "open",
		x: "closed",
		recent: "Recent",
		none: "No quarantined or cleared items.",
		full: "Full history",
		cleared: "cleared",
		quarantined: "quarantined",
		stateOpen: "open",
		stateClosed: "closed",
		keyQ: "SlopGuard flagged it as possible slop",
		keyC: "a maintainer marked it a real contribution",
		keyState: "the PR/issue's open or closed state on GitHub",
	},
	ko: {
		placeholder: "owner/repo (예: facebook/react)",
		button: "조회",
		looking: "조회 중…",
		notFound:
			"해당 레포를 불러오지 못했습니다. owner/repo 형식인지, SlopGuard가 설치되어 있는지 확인하세요.",
		q: "격리",
		c: "정상 확인",
		o: "열림",
		x: "닫힘",
		recent: "최근",
		none: "격리되거나 정상 확인된 항목이 없습니다.",
		full: "전체 기록",
		cleared: "정상 확인",
		quarantined: "격리됨",
		stateOpen: "열림",
		stateClosed: "닫힘",
		keyQ: "봇이 슬롭으로 의심해 표시한 항목",
		keyC: "관리자가 정상 기여로 확인한 항목",
		keyState: "그 PR이나 이슈의 GitHub 열림/닫힘 상태",
	},
} as const;

function MiniStat({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone?: "warn" | "ok";
}) {
	return (
		<div className="ministat">
			<div className={`ministat-n${tone ? ` ${tone}` : ""}`}>{value}</div>
			<div className="ministat-l">{label}</div>
		</div>
	);
}

export default function PublicRepoLookup({ lang }: { lang: Lang }) {
	const t = T[lang];
	const dashBase = lang === "ko" ? "/ko/dashboard" : "/dashboard";
	const [value, setValue] = useState("");
	const [state, setState] = useState<"idle" | "loading" | "error" | "ok">(
		"idle",
	);
	const [stats, setStats] = useState<Stats | null>(null);

	async function go(e: React.FormEvent) {
		e.preventDefault();
		const m = value.trim().replace(/^https?:\/\/github\.com\//, "");
		const [owner, repo] = m.split("/");
		if (!owner || !repo) return;
		setState("loading");
		setStats(null);
		try {
			const r = await fetch(
				`/api/repo-stats?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
			);
			const d = (await r.json()) as Stats;
			if (!r.ok || d.error) {
				setState("error");
				return;
			}
			setStats(d);
			setState("ok");
		} catch {
			setState("error");
		}
	}

	return (
		<div>
			<form onSubmit={go} className="lookup-form">
				<input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={t.placeholder}
					aria-label={t.placeholder}
					className="lookup-input"
				/>
				<button type="submit" className="btn btn-primary">
					{state === "loading" ? t.looking : t.button}
				</button>
			</form>

			{state === "error" && (
				<p className="muted" style={{ fontSize: 13.5, margin: "12px 0 0" }}>
					{t.notFound}
				</p>
			)}

			{state === "ok" && stats && (
				<div className="lookup-result">
					<div className="lookup-head">
						<a href={`https://github.com/${stats.repo}`}>{stats.repo}</a>
						<a className="lookup-full" href={`${dashBase}/${stats.repo}`}>
							{t.full} &rarr;
						</a>
					</div>
					<div className="ministats">
						<MiniStat label={t.q} value={stats.quarantined} tone="warn" />
						<MiniStat label={t.c} value={stats.cleared} tone="ok" />
						<MiniStat label={t.o} value={stats.open} />
						<MiniStat label={t.x} value={stats.closed} />
					</div>
					<dl className="lookup-key">
						<div>
							<dt>
								<span className="lookup-tag tag-q">{t.quarantined}</span>
							</dt>
							<dd>{t.keyQ}</dd>
						</div>
						<div>
							<dt>
								<span className="lookup-tag tag-c">{t.cleared}</span>
							</dt>
							<dd>{t.keyC}</dd>
						</div>
						<div>
							<dt>
								<span className="lookup-state">
									{t.stateOpen} / {t.stateClosed}
								</span>
							</dt>
							<dd>{t.keyState}</dd>
						</div>
					</dl>
					{stats.items.length === 0 ? (
						<p className="muted" style={{ fontSize: 13, margin: "12px 0 0" }}>
							{t.none}
						</p>
					) : (
						<ul className="lookup-items">
							{stats.items.map((it) => (
								<li key={it.number}>
									<a href={it.url}>
										{it.kind === "pull_request" ? "PR" : "#"}
										{it.number}
									</a>{" "}
									<span className="muted lookup-title">{it.title}</span>
									<span className="lookup-state">
										{it.state === "open" ? t.stateOpen : t.stateClosed}
									</span>
									<span
										className={`lookup-tag ${it.labels.includes("slop-cleared") ? "tag-c" : "tag-q"}`}
									>
										{it.labels.includes("slop-cleared")
											? t.cleared
											: t.quarantined}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
