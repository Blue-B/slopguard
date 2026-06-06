"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
	label: string;
	href: string;
	external?: boolean;
};

const aside: React.CSSProperties = {
	borderRight: "1px solid #1b2632",
	background:
		"linear-gradient(180deg, rgba(9,14,21,0.98) 0%, rgba(6,10,16,0.98) 100%)",
	padding: "22px 18px",
	display: "flex",
	flexDirection: "column",
	position: "sticky",
	top: 60,
	height: "calc(100dvh - 60px)",
	boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02)",
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
	activeNav?: string;
}) {
	const pathname = usePathname() ?? "";
	const computedActive = useMemo(() => {
		const cleanPath = pathname.replace(/^\/(ko|en)\//, "/");
		let bestMatch: SidebarItem | undefined;
		let bestLen = 0;
		for (const item of nav) {
			const base = item.href.split("#")[0].replace(/^\/(ko|en)\//, "/");
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
					paddingBottom: 20,
					borderBottom: "1px solid #1b2632",
				}}
			>
				<div
					style={{
						fontSize: 11,
						fontFamily: "var(--mono)",
						letterSpacing: ".16em",
						textTransform: "uppercase",
						color: "#3fb950",
						marginBottom: 12,
					}}
				>
					SlopGuard
				</div>
				<div
					style={{
						fontWeight: 800,
						letterSpacing: "-.035em",
						fontSize: 23,
						lineHeight: 1.02,
						color: "#f0f6fc",
					}}
				>
					{workspace}
				</div>
				<div
					style={{
						...muted,
						fontSize: 12,
						marginTop: 8,
						lineHeight: 1.4,
					}}
				>
					{workspaceSub}
				</div>
			</div>

			<nav
				style={{
					display: "grid",
					gap: 0,
					fontSize: 13,
					marginTop: 18,
					borderTop: "1px solid #141d28",
				}}
				aria-label="Console sections"
			>
				{nav.map((item) => {
					const active = item.label === activeLabel;
					return (
						<Link
							key={item.label}
							href={item.href}
							style={{
								padding: "13px 2px",
								color: active ? "#f0f6fc" : "#8b949e",
								borderBottom: "1px solid #141d28",
								display: "grid",
								gridTemplateColumns: "1fr auto",
								alignItems: "center",
								gap: 10,
								fontWeight: active ? 750 : 520,
								textDecoration: "none",
								letterSpacing: active ? "-.01em" : "0",
								transition: "color .16s ease, padding-left .16s ease",
								paddingLeft: active ? 10 : 2,
							}}
							aria-current={active ? "page" : undefined}
						>
							<span>{item.label}</span>
							<span
								style={{
									fontFamily: "var(--mono)",
									fontSize: 10,
									color: active ? "#3fb950" : "#5d6774",
								}}
							>
								{active ? "live" : item.external ? "↗" : ""}
							</span>
						</Link>
					);
				})}
			</nav>

			<div
				style={{
					marginTop: "auto",
					paddingTop: 18,
					borderTop: "1px solid #1b2632",
				}}
			>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr auto",
						gap: 10,
						alignItems: "end",
					}}
				>
					<div>
						<div
							style={{
								color: "#f0f6fc",
								fontWeight: 700,
								fontFamily: "var(--mono)",
								fontSize: 13,
							}}
						>
							{user}
						</div>
						<div style={{ ...muted, marginTop: 4, fontSize: 11 }}>
							{entitlement}
						</div>
					</div>
					<div
						style={{
							width: 34,
							height: 34,
							borderRadius: 12,
							border: "1px solid rgba(63,185,80,.28)",
							background: "rgba(63,185,80,.08)",
						}}
					/>
				</div>
				<div
					style={{
						marginTop: 12,
						color: "#3fb950",
						fontSize: 11,
						fontFamily: "var(--mono)",
					}}
				>
					{connected}
				</div>
			</div>
		</aside>
	);
}
