"use client";

import type { Lang } from "@/lib/i18n";
import ProfileMenu from "./ProfileMenu";

/**
 * Header auth control for the marketing/install pages. Thin wrapper around
 * ProfileMenu so the avatar dropdown (account / billing / sign out) is the
 * same everywhere a signed-in user looks.
 */
export default function AuthNav({ lang }: { lang: Lang }) {
	return <ProfileMenu lang={lang} />;
}
