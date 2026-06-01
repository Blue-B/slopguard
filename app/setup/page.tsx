"use client";

import { useEffect, useState } from "react";

export default function Setup() {
	const [origin, setOrigin] = useState("");
	const [org, setOrg] = useState("");
	// GitHub App names are GLOBALLY unique. "SlopGuard"/"slopguard" is reserved,
	// so default to an editable, likely-unique name.
	const [appName, setAppName] = useState("SlopGuard Guard");

	useEffect(() => setOrigin(window.location.origin), []);

	const manifest = {
		name: appName,
		description:
			"AI slop PR/Issue 자동 탐지·provenance 태그·quarantine 라벨링 + maintainer 최종 승인",
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
		<main className="container">
			<h1>Create the SlopGuard GitHub App</h1>
			<p style={{ color: "var(--muted)" }}>
				One click creates the App with the exact permissions & webhook URL for{" "}
				<code>{origin || "this deployment"}</code>. GitHub then returns your
				credentials to paste into env.
			</p>

			<div className="card">
				<label style={{ fontSize: 13, color: "var(--muted)" }}>
					GitHub App name (must be globally unique — change if taken)
				</label>
				<input
					value={appName}
					onChange={(e) => setAppName(e.target.value)}
					placeholder="SlopGuard Guard"
					style={{
						display: "block",
						marginTop: 8,
						marginBottom: 16,
						padding: "10px 12px",
						width: "100%",
						background: "#0d1117",
						color: "var(--fg)",
						border: "1px solid var(--border)",
						borderRadius: 8,
					}}
				/>
				<label style={{ fontSize: 13, color: "var(--muted)" }}>
					Install under an organization? (optional — leave blank for your
					personal account)
				</label>
				<input
					value={org}
					onChange={(e) => setOrg(e.target.value)}
					placeholder="my-org"
					style={{
						display: "block",
						marginTop: 8,
						padding: "10px 12px",
						width: "100%",
						background: "#0d1117",
						color: "var(--fg)",
						border: "1px solid var(--border)",
						borderRadius: 8,
					}}
				/>
			</div>

			<form action={action} method="post">
				<input type="hidden" name="manifest" value={JSON.stringify(manifest)} />
				<button
					type="submit"
					disabled={!origin}
					style={{
						padding: "12px 22px",
						background: "var(--green-btn)",
						color: "#fff",
						fontWeight: 700,
						border: "1px solid rgba(240,246,252,0.1)",
						borderRadius: 10,
						cursor: "pointer",
						fontSize: 16,
					}}
				>
					Create SlopGuard App on GitHub
				</button>
			</form>

			<details className="card" style={{ marginTop: 24 }}>
				<summary>Manifest preview</summary>
				<pre style={{ overflowX: "auto" }}>
					{JSON.stringify(manifest, null, 2)}
				</pre>
			</details>
		</main>
	);
}
