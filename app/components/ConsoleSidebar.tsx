"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
	label: string;
	href: string;
	external?: boolean;
};

const aside: React.CSSProperties = {
	borderRight: "1px solid #1c2530",
	background: "#0a0e15",
	padding: "20px 16px 24px",
	display: "flex",
	flexDirection: "column",
	position: "sticky",
	top: 60,
	height: "calc(100dvh - 60px)",
	boxShadow: "1px 0 0 rgba(0,0,0,0.3)",
};

const userCard: React.CSSProperties = {
	border: "1px solid #1c2530",
	borderRadius: 10,
	background: "#0d141d",
	padding: "12px 14px",
};

const muted: React.CSSProperties = { color: "#8b949e" };

export default function ConsoleSidebar({
	workspace,
	workspaceSub,
	user,
	entitlement,
	connected,
	nav,
	activeNav,
}: {
	workspace: string;
	workspaceSub: string;
	user: string;
	entitlement: string;
	connected: string;
	nav: SidebarItem[];
	/**
	 * Optional explicit active label. When omitted, the active item is
	 * derived from `usePathname()` so each routed page (e.g. /org/queue)
	 * lights its own nav entry without the page having to pass a prop.
	 */
	activeNav?: string;
}) {
	const pathname = usePathname() ?? "";
	const computedActive = useMemo(() => {
		// Match the deepest path: /org/queue highlights "Queue".
		// Strip locale prefix (/ko/) and base path (/org, /enterprise).
		// Anchor-only links (e.g. /enterprise#sso) light up only when the
		// current path is the same page; we deliberately do NOT read
		// `location.hash` here so the active calc is pure and SSR-safe.
		const cleanPath = pathname.replace(/^\/(ko|en)\//, "/");
		let bestMatch: SidebarItem | undefined;
		let bestLen = 0;
		for (const item of nav) {
			const base = item.href.split("#")[0];
			if (!base || base === "/") continue;
			if (cleanPath === base || cleanPath.startsWith(base + "/")) {
				if (base.length > bestLen) {
					bestLen = base.length;
					bestMatch = item;
				}
			}
		}
		return bestMatch?.label;
	}, [pathname, nav]);

	const activeLabel = activeNav ?? computedActive ?? "";

	return (
		<aside style={aside}>
			<div
				style={{
					marginBottom: 20,
					paddingBottom: 16,
					borderBottom: "1px solid #1c2530",
				}}
			>
				<div
					style={{
						fontWeight: 700,
						letterSpacing: "-.015em",
						fontSize: 15,
						color: "#f0f6fc",
					}}
				>
					{workspace}
				</div>
				<div
					style={{
						...muted,
						fontSize: 10,
						marginTop: 2,
						letterSpacing: ".05em",
					}}
				>
					{workspaceSub}
				</div>
			</div>

			<nav
				style={{ display: "grid", gap: 2, fontSize: 13 }}
				aria-label="Console sections"
			>
				{nav.map((item) => {
					const active = item.label === activeLabel;
					const linkStyle: React.CSSProperties = {
						borderRadius: 8,
						padding: "8px 10px",
						color: active ? "#f0f6fc" : "#7d8590",
						background: active ? "rgba(63, 185, 80, 0.08)" : "transparent",
						border: active
							? "1px solid rgba(63, 185, 80, 0.25)"
							: "1px solid transparent",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						fontWeight: active ? 600 : 500,
						textDecoration: "none",
						transition: "background .15s, color .15s",
					};
					return (
						<Link
							key={item.label}
							href={item.href}
							style={linkStyle}
							aria-current={active ? "page" : undefined}
						>
							<span>{item.label}</span>
							{active ? (
								<span style={{ fontSize: 10, color: "#3fb950" }}>active</span>
							) : item.external ? (
								<span style={{ fontSize: 10, opacity: 0.5 }}>↗</span>
							) : null}
						</Link>
					);
				})}
			</nav>

			<div
				style={{
					...userCard,
					marginTop: "auto",
					fontSize: 12,
				}}
			>
				<div
					style={{
						color: "#f0f6fc",
						fontWeight: 600,
						fontFamily: "var(--mono)",
						fontSize: 13,
					}}
				>
					{user}
				</div>
				<div style={{ ...muted, marginTop: 3, fontSize: 10 }}>
					{entitlement}
				</div>
				<div
					style={{
						marginTop: 10,
						color: "#3fb950",
						fontSize: 10,
						display: "flex",
						gap: 6,
						alignItems: "center",
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 5,
							height: 5,
							borderRadius: 99,
							background: "#3fb950",
						}}
					/>
					{connected}
				</div>
			</div>
		</aside>
	);
}

// re-export useMemo to keep this file's imports tight in client trees
import { useMemo } from "react";
