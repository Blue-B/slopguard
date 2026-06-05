// Shared style tokens for paid-feature consoles. Keeps dark-tech tone
// consistent across /org, /alerts, /campaigns, /enterprise (and KO mirrors).
// All values are tuned to read on the marketing-site background and
// respect prefers-reduced-motion for any transition.

export const shell: React.CSSProperties = {
	maxWidth: 1280,
	margin: "32px auto 64px",
	padding: "0 24px",
};

export const frame: React.CSSProperties = {
	border: "1px solid var(--border)",
	borderRadius: 20,
	overflow: "hidden",
	background:
		"linear-gradient(180deg, #0a0e15 0%, #0c1119 60%, #0a0e15 100%)",
	boxShadow:
		"0 30px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export const card: React.CSSProperties = {
	border: "1px solid #1c2530",
	borderRadius: 14,
	background:
		"linear-gradient(180deg, rgba(255,255,255,0.012) 0%, rgba(255,255,255,0) 100%), #0d141d",
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
