import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThemeDetailClient } from "@/components/theme-detail";
import { getAllThemes, getThemeByName } from "@/lib/theme-data";

interface ThemeDetailPageProps {
	params: Promise<{ name: string }>;
}

export async function generateMetadata({
	params,
}: ThemeDetailPageProps): Promise<Metadata> {
	const { name } = await params;
	const theme = getThemeByName(name);
	if (!theme) return { title: "Theme Not Found — audx" };

	return {
		title: `${theme.displayName} Theme — audx`,
		description: theme.description,
	};
}

export default async function ThemeDetailPage({
	params,
}: ThemeDetailPageProps) {
	const { name } = await params;
	const theme = getThemeByName(name);
	if (!theme) notFound();

	const allThemeNames = getAllThemes().map((t) => t.name);

	return (
		<main className="mx-auto w-full max-w-6xl px-6 py-12 border-x min-h-[calc(100vh-3.5rem)]">
			<ThemeDetailClient theme={theme} allThemeNames={allThemeNames} />
		</main>
	);
}
