"use client";

import { useEffect } from "react";

/** Subtle cursor-following green glow inside the hero. Sets --mx/--my on the
 * nearest .hero element on pointer move. Skipped under reduced motion. */
export default function HeroSpotlight() {
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const hero = document.querySelector<HTMLElement>(".hero");
		if (!hero) return;
		let raf = 0;
		const onMove = (e: PointerEvent) => {
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				const r = hero.getBoundingClientRect();
				hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
				hero.style.setProperty("--my", `${e.clientY - r.top}px`);
			});
		};
		hero.addEventListener("pointermove", onMove);
		return () => {
			hero.removeEventListener("pointermove", onMove);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);
	return null;
}
