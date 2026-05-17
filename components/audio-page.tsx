"use client";

import { usePatch } from "@litlab/audx/react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { SoundGrid } from "@/components/audio-grid";
import { CategoryBar } from "@/components/category-bar";
import { GlobalFilters } from "@/components/global-fiters";
import { Hero } from "@/components/hero";
import {
	type AudioCatalogItem,
	type CategoryCount,
	getCategoriesForItems,
	type ThemeCatalogItem,
} from "@/lib/audio-catalog";
import { cn } from "@/lib/utils";

interface AudioPageProps {
	items: AudioCatalogItem[];
	themes: ThemeCatalogItem[];
}

export function AudioPage({ items, themes }: AudioPageProps) {
	const [query, setQuery] = useState("");
	const [theme, setTheme] = useState(themes[0]?.name ?? "minimal");
	const [category, setCategory] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const patch = usePatch(`/api/audio/theme/${theme}`);

	const themeItems = useMemo(
		() => items.filter((item) => item.theme === theme),
		[items, theme],
	);

	const categories: CategoryCount[] = useMemo(
		() => getCategoriesForItems(themeItems),
		[themeItems],
	);

	const filteredItems = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return themeItems.filter((item) => {
			const matchesCategory = !category || item.category === category;
			const matchesQuery =
				!normalizedQuery ||
				item.meta.semanticName.toLowerCase().includes(normalizedQuery) ||
				item.category.toLowerCase().includes(normalizedQuery) ||
				item.title.toLowerCase().includes(normalizedQuery);

			return matchesCategory && matchesQuery;
		});
	}, [category, query, themeItems]);

	const handleThemeChange = useCallback((nextTheme: string) => {
		startTransition(() => {
			setTheme(nextTheme as ThemeCatalogItem["name"]);
			setCategory(null);
		});
	}, []);

	const handleCategoryChange = useCallback((nextCategory: string | null) => {
		startTransition(() => {
			setCategory(nextCategory);
		});
	}, []);

	const handleClearFilters = useCallback(() => {
		startTransition(() => {
			setQuery("");
			setCategory(null);
		});
	}, []);

	const onPreviewStart = useCallback(
		(audioName: string) => {
			patch.play(audioName);
		},
		[patch],
	);

	return (
		<>
			<Hero items={items} />
			<GlobalFilters
				query={query}
				onQueryChange={setQuery}
				themes={themes}
				selectedTheme={theme}
				onThemeChange={handleThemeChange}
			/>

			{/* ── Content ── */}
			<main
				id="main-content"
				className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 border-x"
			>
				<CategoryBar
					categories={categories}
					selectedCategory={category || null}
					onCategoryChange={handleCategoryChange}
				/>

				<div
					className={cn(
						"transition-opacity duration-150",
						isPending ? "opacity-50" : "opacity-100",
					)}
				>
					<SoundGrid
						items={filteredItems}
						onPreviewStart={onPreviewStart}
						onClearFilters={handleClearFilters}
					/>
				</div>
			</main>
		</>
	);
}
