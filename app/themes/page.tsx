import type { Metadata } from "next";
import { ThemeCard } from "@/components/theme-card";
import { getAllThemes } from "@/lib/theme-data";

export const metadata: Metadata = {
	title: "Themes — audx",
	description:
		"Browse and preview audx sound themes. Compare minimal and playful themes, listen to sounds, and get installation instructions.",
};

export default function ThemesPage() {
	const themes = getAllThemes();

	return (
		<main className="mx-auto w-full max-w-6xl px-6 py-12 border-x min-h-[calc(100vh-3.5rem)]">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Themes</h1>
				<p className="mt-2 text-muted-foreground">
					Pre-built sound themes you can install with a single command. Each
					theme maps semantic sound names to curated audio assets.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{themes.map((theme) => (
					<ThemeCard key={theme.name} theme={theme} />
				))}
			</div>
		</main>
	);
}
