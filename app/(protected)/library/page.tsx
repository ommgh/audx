import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getThemesAllTime } from "@/lib/data/themes";
import {
	getUserThemes,
	type UserThemeWithStats,
	userThemeToThemeWithStats,
} from "@/lib/data/user-themes";
import { DEFAULT_OG_IMAGE } from "@/lib/site";
import { View } from "./_components/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Library",
	description: "Browse and discover curated sound themes for your UI.",
	alternates: { canonical: "/library" },
	openGraph: {
		title: "Library",
		description: "Browse and discover curated sound themes for your UI.",
		url: "/library",
		images: [DEFAULT_OG_IMAGE],
	},
};

export default async function ThemesPage() {
	const [themes, session] = await Promise.all([
		getThemesAllTime(),
		auth.api.getSession({
			headers: await headers(),
		}),
	]);

	let userThemes: UserThemeWithStats[] = [];
	if (session?.user?.id) {
		userThemes = await getUserThemes(session.user.id);
	}

	return (
		<View
			themes={themes}
			userThemes={userThemes.map(userThemeToThemeWithStats)}
			isLoggedIn={!!session}
		/>
	);
}
