"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	ConsoleHero,
	ConsoleSectionHead,
	ConsoleShell,
	ConsoleStatus,
} from "./ConsoleShell";
import type { SidebarItem } from "./ConsoleSidebar";
import { riskBg, riskColor } from "./console-styles";

type RecentItem = {
	number: number;
	title: string;
	url: string;
	kind: "issue" | "pull_request";
	state: "open" | "closed";
	author: string;
	labels: string[];
	createdAt: string;
	updatedAt: string;
};

type DashboardResponse =
	| { installed: true; owner: string; recent: RecentItem[] }
	| { installed: false; owner: string; reason: string };

type QueueStatus = "quarantined" | "cleared" | "watching";

function deriveStatus(labels: string[]): QueueStatus {
	if (labels.some((l) => l.toLowerCase().includes("quarantine"))) return "quarantined";
	if (labels.some((l) => l.toLowerCase().includes("cleared"))) return "cleared";
	return "watching";
}
function deriveScore(labels: string[]): number {
	const l = labels.map((x) => x.toLowerCase()).join(" ");
	if (l.includes("quarantine")) return 78;
	if (l.includes("cleared")) return 24;
	return 46;
}
function formatAge(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const m = Math.floor(ms / 60000);
	if (m < 1) return "now";
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	return `${Math.floor(h / 24)}d`;
}
function extractRepo(url: string): string {
	const m =
		url.match(/repos\/([^/]+)\/([^/]+)\/(?:issues|pulls)\/\d+/) ??
		url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/\d+/);
	return m ? `${m[1]}/${m[2]}` : "-";
}

const statusTone: Record<QueueStatus, "low" | "medium" | "high"> = {
	quarantined: "high",
	cleared: "low",
	watching: "medium",
};

export type QueueFullViewCopy = {
	kicker: string;
	workspace: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	queueEmpty: string;
	installCta: string;
	installHref: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	openLabel: string;
	statusLabels: Record<QueueStatus, string>;
	tableTitle: string;
	tableSub: string;
	columns: {
		item: string;
		repo: string;
		score: string;
		status: string;
		owner: string;
		age: string;
	};
};

const GRID = "minmax(0,1fr) 140px 56px 100px 92px 46px";

export default function QueueFullView({ copy }: { copy: QueueFullViewCopy }) {
	const [data, setData] = useState<DashboardResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/team/dashboard", { cache: "no-store" });
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as DashboardResponse);
			} catch (e) {
				setError(e instanceof Error ? e.message : "load failed");
			}
		})();
	}, []);

	const isLoading = data === null && error === null;
	const notInstalled = data !== null && "installed" in data && data.installed === false;
	const live = data && data.installed ? data : null;
	const rows =
		live?.recent.map((it) => ({
			key: `${it.url}#${it.number}`,
			item: it.title,
			repo: extractRepo(it.url),
			score: deriveScore(it.labels),
			status: deriveStatus(it.labels),
			owner: it.author,
			age: formatAge(it.updatedAt),
			href: it.url.replace("api.github.com", "github.com").replace(/\/repos\//, "/"),
		})) ?? [];

	return (
		<ConsoleShell kicker={copy.kicker} workspace={copy.workspace} nav={copy.nav}>
			<ConsoleHero
				workspace={copy.workspace}
				eyebrow={copy.heroEyebrow}
				title={copy.heroTitle}
				body={copy.heroBody}
				image="/console-command.png"
				imageAlt="Action queue radar"
				plateLabel="action queue"
				connected={copy.connected}
				metrics={[
					{ label: copy.openLabel, value: rows.length, tone: rows.length > 0 ? "warn" : "ok" },
				]}
			/>

			{isLoading && <ConsoleStatus>{copy.loading}</ConsoleStatus>}
			{error && <ConsoleStatus danger>{error}</ConsoleStatus>}
			{notInstalled && (
				<div className="plate console-empty">
					<p>{copy.empty}</p>
					<Link href={copy.installHref} className="btn btn-primary btn-sm">
						{copy.installCta}
					</Link>
				</div>
			)}

			{live && (
				<section className="console-section">
					<ConsoleSectionHead title={copy.tableTitle} sub={copy.tableSub} />
					<div className="plate console-table">
						<div className="console-th" style={{ gridTemplateColumns: GRID }}>
							<span>{copy.columns.item}</span>
							<span>{copy.columns.repo}</span>
							<span>{copy.columns.score}</span>
							<span>{copy.columns.status}</span>
							<span>{copy.columns.owner}</span>
							<span style={{ textAlign: "right" }}>{copy.columns.age}</span>
						</div>
						{rows.length === 0 ? (
							<div className="console-empty-line">{copy.queueEmpty}</div>
						) : (
							rows.map((row) => (
								<div className="console-tr" key={row.key} style={{ gridTemplateColumns: GRID }}>
									<Link href={row.href} target="_blank" rel="noreferrer">
										{row.item}
									</Link>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{row.repo}
									</span>
									<b
										style={{
											fontFamily: "var(--mono)",
											color:
												row.score >= 70
													? "var(--danger)"
													: row.score >= 50
														? "var(--warn)"
														: "var(--green)",
										}}
									>
										{row.score}
									</b>
									<span
										className="console-pill"
										style={{
											color: riskColor[statusTone[row.status]],
											background: riskBg[statusTone[row.status]],
										}}
									>
										{copy.statusLabels[row.status]}
									</span>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{row.owner}</span>
									<span style={{ fontFamily: "var(--mono)", color: "var(--muted)", textAlign: "right" }}>
										{row.age}
									</span>
								</div>
							))
						)}
					</div>
				</section>
			)}
		</ConsoleShell>
	);
}
