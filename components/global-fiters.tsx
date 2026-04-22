import { SoundSearch } from "@/components/audio-search";
import { NewThemeButton } from "@/components/new-theme-button";
import { ThemeSelector } from "@/components/theme-selector";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import type { ThemeCatalogItem } from "@/lib/theme-data";

type GlobalFiltersProps = {
	items: AudioCatalogItem[];
	themes: ThemeCatalogItem[];
};

export function GlobalFilters({ items, themes }: GlobalFiltersProps) {
	const { query, setQuery, theme, setTheme } = useGlobalFilters({
		items,
		themes,
	});

	return (
		<div className="bg-background/95 sticky top-0 z-40 border-y">
			<div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-3 border-x">
				<SoundSearch value={query} onChange={setQuery} />
				<ThemeSelector
					themes={themes}
					selectedTheme={theme}
					onThemeChange={setTheme}
				/>
				<NewThemeButton />
			</div>
		</div>
	);
}
