import Link from "next/link";

export type SidebarItem = {
	label: string;
	href: string;
	external?: boolean;
};

const aside: React.CSSProperties = {
	borderRight: "1px solid #1c2530",
	background: "linear-gradient(180deg, #0d141d 0%, #0a0e15 100%)",
	padding: 18,
	display: "flex",
	flexDirection: "column",
};

const card: React.CSSProperties = {
	border: "1px solid #1c2530",
	borderRadius: 14,
	background:
		"linear-gradient(180deg, rgba(255,255,255,0.012) 0%, rgba(255,255,255,0) 100%), #0d141d",
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
	activeNav: string;
}) {
	return (
		<aside style={aside}>
			<div style={{ marginBottom: 26 }}>
				<div
					style={{
						fontWeight: 800,
						letterSpacing: "-.02em",
						fontSize: 16,
						color: "#f0f6fc",
					}}
				>
					{workspace}
				</div>
				<div
					style={{
						...muted,
						fontSize: 11,
						marginTop: 3,
						letterSpacing: ".04em",
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
					const active = item.label === activeNav;
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
						<Link key={item.label} href={item.href} style={linkStyle}>
							<span>{item.label}</span>
							{active ? (
								<span style={{ fontSize: 10, color: "#3fb950" }}>●</span>
							) : item.external ? (
								<span style={{ fontSize: 10, opacity: 0.5 }}>↗</span>
							) : null}
						</Link>
					);
				})}
			</nav>

			<div
				style={{
					...card,
					marginTop: "auto",
					padding: 12,
					fontSize: 12,
				}}
			>
				<div
					style={{
						color: "#f0f6fc",
						fontWeight: 700,
						fontFamily: "var(--mono)",
					}}
				>
					{user}
				</div>
				<div style={{ ...muted, marginTop: 4, fontSize: 11 }}>
					{entitlement}
				</div>
				<div
					style={{
						marginTop: 10,
						color: "#3fb950",
						fontSize: 11,
						display: "flex",
						gap: 6,
						alignItems: "center",
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 6,
							height: 6,
							borderRadius: 99,
							background: "#3fb950",
							boxShadow: "0 0 6px rgba(63,185,80,.6)",
						}}
					/>
					{connected}
				</div>
			</div>
		</aside>
	);
}
