import type { Metadata } from "next";
import { View } from "@/app/library/_components/view";
import { getThemesAllTime } from "@/lib/data/themes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Library",
	description: "Browse and discover curated sound themes for your UI.",
	alternates: { canonical: "https://audx.site/library" },
	openGraph: {
		title: "Library",
		description: "Browse and discover curated sound themes for your UI.",
		url: "https://audx.site/library",
	},
};

export default async function ThemesPage() {
	const themes = await getThemesAllTime();

	return <View themes={themes} />;
}
