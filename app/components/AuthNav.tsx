"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

interface Me {
	authenticated: boolean;
	login?: string;
	avatar?: string;
	planName?: string;
	plan?: string;
}

const L = {
	en: { signin: "Sign in" },
	ko: { signin: "로그인" },
};

export default function AuthNav({ lang }: { lang: Lang }) {
	const [me, setMe] = useState<Me | null>(null);
	const accountHref = lang === "ko" ? "/ko/account" : "/account";

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => r.json())
			.then(setMe)
			.catch(() => setMe({ authenticated: false }));
	}, []);

	if (!me) return null;

	if (!me.authenticated) {
		return (
			<a
				className="nav-signin"
				href={lang === "ko" ? "/api/auth/login?lang=ko" : "/api/auth/login"}
			>
				{L[lang].signin}
			</a>
		);
	}

	return (
		<a className="nav-account" href={accountHref} title={me.login}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={me.avatar} alt={me.login ?? ""} width={24} height={24} />
			<span className="nav-plan">{me.planName}</span>
		</a>
	);
}
