"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SidebarItem } from "./ConsoleSidebar";

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
	if (labels.some((l) => l.toLowerCase().includes("quarantine")))
		return "quarantined";
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

export type QueueFullViewCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	loading: string;
	empty: string;
	queueEmpty: string;
	installCta: string;
	installHref: string;
	backHref: string;
	backLabel: string;
	heroEyebrow: string;
	heroTitle: string;
	heroBody: string;
	openLabel: string;
	statusLabels: Record<QueueStatus, string>;
	columns: {
		item: string;
		repo: string;
		score: string;
		status: string;
		owner: string;
		age: string;
	};
};

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
	const notInstalled =
		data !== null && "installed" in data && data.installed === false;
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
			href: it.url
				.replace("api.github.com", "github.com")
				.replace(/\/repos\//, "/"),
		})) ?? [];

	return (
		<main className="queue-experience">
			<div className="grid-bg" aria-hidden="true" />
			<div className="wide campaign-wide">
				<nav className="campaign-topnav" aria-label="Queue sections">
					<Link href={copy.backHref}>← {copy.backLabel}</Link>
					<div className="campaign-nav-center">
						{copy.nav.map((item) => (
							<Link
								key={item.label}
								href={item.href}
								className={item.href.includes("/queue") ? "active" : ""}
							>
								{item.label}
								{item.external ? <span>↗</span> : null}
							</Link>
						))}
					</div>
					<span className="campaign-detail-user mono">{copy.user}</span>
				</nav>
				<header className="queue-hero">
					<div>
						<div className="eyebrow mono">{copy.heroEyebrow}</div>
						<h1>{copy.heroTitle}</h1>
						<p>{copy.heroBody}</p>
					</div>
					<div className="queue-readout mono">
						<span>{copy.openLabel}</span>
						<b>{rows.length}</b>
						<em>{copy.connected}</em>
					</div>
				</header>

				{isLoading && (
					<div className="campaign-status mono">{copy.loading}</div>
				)}
				{error && <div className="campaign-status danger mono">{error}</div>}
				{notInstalled && (
					<div className="campaign-empty-line mono">
						{copy.empty} <Link href={copy.installHref}>{copy.installCta}</Link>
					</div>
				)}
				{live && (
					<section className="queue-stream section">
						<div className="queue-stream-head mono">
							<span>{copy.columns.item}</span>
							<span>{copy.columns.repo}</span>
							<span>{copy.columns.score}</span>
							<span>{copy.columns.status}</span>
							<span>{copy.columns.owner}</span>
							<span>{copy.columns.age}</span>
						</div>
						{rows.length === 0 ? (
							<div className="campaign-empty-line mono">{copy.queueEmpty}</div>
						) : (
							rows.map((row) => (
								<div className="queue-row" key={row.key}>
									<Link href={row.href} target="_blank" rel="noreferrer">
										{row.item}
									</Link>
									<span>{row.repo}</span>
									<b>{row.score}</b>
									<em>{copy.statusLabels[row.status]}</em>
									<span>{row.owner}</span>
									<span>{row.age}</span>
								</div>
							))
						)}
					</section>
				)}
			</div>
		</main>
	);
}
