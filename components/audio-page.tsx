"use client";

import { useMemo } from "react";
import { SoundGrid } from "@/components/audio-grid";
import { CategoryBar } from "@/components/category-bar";
import { GlobalFilters } from "@/components/global-fiters";
import { Hero } from "@/components/hero";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import { useHoverPreview } from "@/hooks/use-hover-preview";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import type { ThemeCatalogItem } from "@/lib/theme-data";
import { type CategoryCount, getCategoriesForTheme } from "@/lib/theme-data";
import { cn } from "@/lib/utils";

interface AudioPageProps {
	items: AudioCatalogItem[];
	themes: ThemeCatalogItem[];
}

export function AudioPage({ items, themes }: AudioPageProps) {
	const { deferredItems, isPending, theme, category, setCategory } =
		useGlobalFilters({
			items,
			themes,
		});

	const categories: CategoryCount[] = useMemo(
		() => getCategoriesForTheme(theme),
		[theme],
	);

	const { onPreviewStart, onPreviewStop } = useHoverPreview();

	return (
		<>
			<Hero items={items} />
			<GlobalFilters items={items} themes={themes} />

			{/* ── Content ── */}
			<main
				id="main-content"
				className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 border-x"
			>
				<CategoryBar
					categories={categories}
					selectedCategory={category || null}
					onCategoryChange={(cat) => setCategory(cat ?? "")}
				/>

				<div
					className={cn(
						"transition-opacity duration-150",
						isPending ? "opacity-50" : "opacity-100",
					)}
				>
					<SoundGrid
						items={deferredItems}
						onPreviewStart={onPreviewStart}
						onPreviewStop={onPreviewStop}
					/>
				</div>
			</main>
		</>
	);
}
