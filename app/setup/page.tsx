"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { INSTALL_URL as HOSTED_INSTALL } from "@/lib/config";

const inputStyle: React.CSSProperties = {
	display: "block",
	marginTop: 8,
	padding: "10px 12px",
	width: "100%",
	background: "#0d1117",
	color: "var(--fg)",
	border: "1px solid var(--border)",
	borderRadius: 8,
	fontFamily: "var(--mono)",
	fontSize: 14,
};

export default function Setup() {
	const [origin, setOrigin] = useState("");
	const [org, setOrg] = useState("");
	const [appName, setAppName] = useState("SlopGuard Guard");

	useEffect(() => setOrigin(window.location.origin), []);

	const manifest = {
		name: appName,
		description:
			"Detects AI slop PRs/issues, tags provenance, quarantines with a label, maintainer has the final say.",
		url: "https://github.com/Blue-B/slopguard",
		hook_attributes: { url: `${origin}/api/webhook`, active: true },
		redirect_url: `${origin}/api/manifest/callback`,
		setup_url: `${origin}/setup`,
		public: true,
		default_permissions: {
			metadata: "read",
			contents: "read",
			issues: "write",
			pull_requests: "write",
		},
		default_events: ["pull_request", "issues", "issue_comment"],
	};

	const action = org
		? `https://github.com/organizations/${org}/settings/apps/new`
		: "https://github.com/settings/apps/new";

	return (
		<>
			<nav className="nav">
				<Link className="brand" href="/">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/shield.svg" alt="SlopGuard" />
					SlopGuard
				</Link>
				<span className="nav-links">
					<Link href="/">Home</Link>
					<a className="btn btn-primary" href={HOSTED_INSTALL}>
						Install
					</a>
				</span>
			</nav>

			<main className="wide" style={{ maxWidth: 680, paddingTop: 56 }}>
				<span className="eyebrow">
					<span className="dot" /> self-host / advanced
				</span>
				<h1
					style={{
						fontSize: 30,
						letterSpacing: "-0.02em",
						margin: "14px 0 8px",
					}}
				>
					Run your own SlopGuard
				</h1>
				<p className="muted" style={{ marginTop: 0 }}>
					This page creates a brand-new GitHub App from a manifest so you can
					self-host SlopGuard on your own server. Most people do not need this.
				</p>

				<div
					className="card"
					style={{
						borderColor: "rgba(63,185,80,0.4)",
						background: "rgba(63,185,80,0.06)",
						marginBottom: 24,
					}}
				>
					<b style={{ fontSize: 15 }}>Just want to use SlopGuard?</b>
					<p className="muted" style={{ fontSize: 14, margin: "6px 0 12px" }}>
						Install the hosted app on your repo. No server, no setup. This is
						what you want unless you specifically need to self-host.
					</p>
					<a className="btn btn-primary" href={HOSTED_INSTALL}>
						Install SlopGuard on your repo
					</a>
				</div>

				<h2 style={{ fontSize: 18, margin: "8px 0 4px" }}>Self-host setup</h2>
				<p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
					One click creates the App with the exact permissions and webhook URL
					for <code>{origin || "this deployment"}</code>. GitHub then returns
					credentials to paste into your env.
				</p>

				<div className="card">
					<label style={{ fontSize: 13, color: "var(--muted)" }}>
						GitHub App name (must be globally unique)
					</label>
					<input
						value={appName}
						onChange={(e) => setAppName(e.target.value)}
						placeholder="SlopGuard Guard"
						style={inputStyle}
					/>
					<label
						style={{
							fontSize: 13,
							color: "var(--muted)",
							display: "block",
							marginTop: 16,
						}}
					>
						Install under an organization? (optional)
					</label>
					<input
						value={org}
						onChange={(e) => setOrg(e.target.value)}
						placeholder="my-org"
						style={inputStyle}
					/>
				</div>

				<form action={action} method="post" style={{ marginTop: 18 }}>
					<input
						type="hidden"
						name="manifest"
						value={JSON.stringify(manifest)}
					/>
					<button
						type="submit"
						className="btn btn-ghost btn-lg"
						disabled={!origin}
					>
						Create your own App on GitHub
					</button>
				</form>

				<details className="card" style={{ marginTop: 24 }}>
					<summary style={{ cursor: "pointer", fontSize: 14 }}>
						Manifest preview
					</summary>
					<pre
						className="mono"
						style={{ overflowX: "auto", fontSize: 12, color: "var(--muted)" }}
					>
						{JSON.stringify(manifest, null, 2)}
					</pre>
				</details>
			</main>

			<footer className="site">
				<p>
					SlopGuard | MIT |{" "}
					<a href="https://github.com/Blue-B/slopguard">
						github.com/Blue-B/slopguard
					</a>
				</p>
			</footer>
		</>
	);
}
