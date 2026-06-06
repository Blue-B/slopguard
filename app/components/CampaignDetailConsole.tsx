"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SidebarItem } from "./ConsoleSidebar";
import { toneColor } from "./console-styles";

type Detail = {
	id: string;
	fingerprint: string;
	repoCount: number;
	totalCount: number;
	authorCount: number;
	firstSeen: string;
	repos: string[];
	authors: string[];
	commits: Array<{
		repo: string;
		sha: string;
		title: string;
		author: string;
		when: string;
	}>;
	repoImpact: Array<{ repo: string; quarantined: number; cleared: number }>;
};

export type CampaignDetailCopy = {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	backHref: string;
	backLabel: string;
	loading: string;
	error: string;
	heading: string;
	subhead: string;
	metrics: { repos: string; hits: string; authors: string; firstSeen: string };
	commitsTitle: string;
	impactTitle: string;
	plateLabel: string;
	commitMeta: string;
	emptyCommits: string;
	impactSubhead: string;
	authorsLabel: string;
};

export default function CampaignDetailConsole({
	id,
	copy,
}: {
	id: string;
	copy: CampaignDetailCopy;
}) {
	const [data, setData] = useState<Detail | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`, {
					cache: "no-store",
				});
				if (!res.ok) {
					setError(`HTTP ${res.status}`);
					return;
				}
				setData((await res.json()) as Detail);
				setError(null);
			} catch (e) {
				setError(e instanceof Error ? e.message : copy.error);
			}
		})();
	}, [copy.error, id]);

	const metrics = [
		{ label: copy.metrics.repos, value: data?.repoCount ?? "-", tone: "ok" },
		{
			label: copy.metrics.hits,
			value: data?.totalCount ?? "-",
			tone: "danger",
		},
		{
			label: copy.metrics.authors,
			value: data?.authorCount ?? "-",
			tone: "neutral",
		},
		{
			label: copy.metrics.firstSeen,
			value: data?.firstSeen ?? "-",
			tone: "neutral",
		},
	] as const;

	return (
		<main className="campaign-detail-experience">
			<div className="grid-bg" aria-hidden="true" />
			<div className="wide campaign-detail-wide">
				<nav className="campaign-topnav" aria-label="Campaign detail sections">
					<Link href={copy.backHref}>← {copy.backLabel}</Link>
					<div className="campaign-nav-center">
						{copy.nav.map((item) => (
							<Link
								key={item.label}
								href={item.href}
								className={item.href.includes("/campaigns") ? "active" : ""}
							>
								{item.label}
							</Link>
						))}
					</div>
					<span className="campaign-detail-user mono">{copy.user}</span>
				</nav>

				<header className="campaign-detail-hero">
					<div className="campaign-detail-copy">
						<div className="eyebrow mono">{copy.heading}</div>
						<h1>{data?.fingerprint ?? id.replaceAll("_", " ")}</h1>
						<p>{copy.subhead}</p>
						<ul className="hero-spec campaign-spec">
							{metrics.map((m) => (
								<li key={m.label}>
									<span>{m.label}</span>
									<b style={{ color: toneColor[m.tone] }}>{m.value}</b>
								</li>
							))}
						</ul>
					</div>
					<figure className="plate campaign-detail-plate">
						<figcaption className="plate-bar">
							<span>{copy.plateLabel}</span>
							<span className="plate-coord">{copy.connected}</span>
						</figcaption>
						<div className="plate-art">
							<Image
								src="/org-wave-command.png"
								alt="Campaign detail evidence wave"
								width={1568}
								height={882}
								priority
							/>
							<span className="plate-scan" aria-hidden="true" />
						</div>
					</figure>
				</header>

				{!data && !error && (
					<div className="campaign-status mono">{copy.loading}</div>
				)}
				{error && (
					<div className="campaign-status danger mono">
						{copy.error}: {error}
					</div>
				)}

				{data && (
					<section className="campaign-detail-grid section">
						<div className="campaign-evidence-stream">
							<header className="campaign-section-title">
								<h2>{copy.commitsTitle}</h2>
								<p>{copy.commitMeta.replace("{count}", String(data.commits.length))}</p>
							</header>
							<div className="campaign-stream detail-stream">
								{data.commits.length === 0 ? (
									<div className="campaign-empty-line mono">
										{copy.emptyCommits}
									</div>
								) : (
									data.commits.map((commit) => (
										<div
											className="campaign-row detail-row"
											key={`${commit.repo}-${commit.sha}`}
										>
											<div>
												<b>{commit.title}</b>
												<small>{commit.repo}</small>
											</div>
											<span>{commit.author}</span>
											<em>{commit.sha.slice(0, 7)}</em>
											<span>{commit.when}</span>
										</div>
									))
								)}
							</div>
						</div>

						<aside className="campaign-impact-panel plate">
							<header className="campaign-section-title">
								<h2>{copy.impactTitle}</h2>
								<p>{copy.impactSubhead}</p>
							</header>
							<div className="campaign-impact-list">
								{data.repoImpact.map((repo) => (
									<div className="campaign-impact-row" key={repo.repo}>
										<span>{repo.repo}</span>
										<b>{repo.quarantined}</b>
										<em>{repo.cleared}</em>
									</div>
								))}
							</div>
							<div className="campaign-author-block mono">
								<span>{copy.authorsLabel}</span>
								<strong>
									{data.authors.length ? data.authors.join(", ") : "-"}
								</strong>
							</div>
						</aside>
					</section>
				)}
			</div>
		</main>
	);
}
