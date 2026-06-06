// Shared style tokens for paid-feature consoles. The paid surfaces use one
// dark product language: wide command frame, integrated rail, sparse lines,
// no heavy marketing cards.

export const shell: React.CSSProperties = {
	maxWidth: 1520,
	margin: "16px auto 96px",
	padding: "0 28px",
};

export const frame: React.CSSProperties = {
	border: "1px solid #1b2632",
	borderRadius: 22,
	overflow: "hidden",
	background:
		"linear-gradient(180deg, rgba(16,24,34,0.98) 0%, rgba(7,11,17,0.99) 100%)",
	boxShadow:
		"0 38px 90px -44px rgba(0,0,0,0.82), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export const content: React.CSSProperties = {
	padding: "28px clamp(22px, 3vw, 42px) 42px",
	minWidth: 0,
};

export const heroSurface: React.CSSProperties = {
	position: "relative",
	overflow: "hidden",
	border: "1px solid #203040",
	borderRadius: 18,
	background:
		"linear-gradient(135deg, rgba(18,29,39,0.94), rgba(7,11,17,0.98))",
};

export const lineSection: React.CSSProperties = {
	borderTop: "1px solid #1b2632",
	paddingTop: 22,
};

export const card: React.CSSProperties = {
	border: "1px solid #1b2632",
	borderRadius: 16,
	background: "rgba(10,16,24,0.72)",
};

export const muted: React.CSSProperties = { color: "#8b949e" };

export const riskColor: Record<"low" | "medium" | "high", string> = {
	low: "#3fb950",
	medium: "#d29922",
	high: "#f85149",
};

export const riskBg: Record<"low" | "medium" | "high", string> = {
	low: "rgba(63, 185, 80, 0.12)",
	medium: "rgba(210, 153, 34, 0.12)",
	high: "rgba(248, 81, 73, 0.12)",
};

export const toneColor: Record<"neutral" | "warn" | "danger" | "ok", string> = {
	neutral: "#f0f6fc",
	warn: "#d29922",
	danger: "#f85149",
	ok: "#3fb950",
};
