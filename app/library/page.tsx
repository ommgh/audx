import type { Metadata } from "next";
import { View } from "@/app/library/_components/view";
import { getPatchesAllTime } from "@/lib/data/patches";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Library",
	description: "Browse and discover curated sound patches for your UI.",
	alternates: { canonical: "https://audx.site/library" },
	openGraph: {
		title: "Library",
		description: "Browse and discover curated sound patches for your UI.",
		url: "https://audx.site/library",
	},
};

export default async function PatchesPage() {
	const patches = await getPatchesAllTime();

	return <View patches={patches} />;
}
