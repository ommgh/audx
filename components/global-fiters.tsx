import { SoundSearch } from "@/components/audio-search";
import { NewThemeButton } from "@/components/new-theme-button";
import { ThemeSelector } from "@/components/theme-selector";
import type { ThemeCatalogItem } from "@/lib/audio-catalog";

type GlobalFiltersProps = {
	themes: ThemeCatalogItem[];
	query: string;
	selectedTheme: string;
	onQueryChange: (query: string) => void;
	onThemeChange: (theme: string) => void;
};

export function GlobalFilters({
	query,
	themes,
	selectedTheme,
	onQueryChange,
	onThemeChange,
}: GlobalFiltersProps) {
	return (
		<div className="bg-background/95 sticky top-0 z-40 border-y">
			<div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-3 border-x">
				<SoundSearch value={query} onChange={onQueryChange} />
				<ThemeSelector
					themes={themes}
					selectedTheme={selectedTheme}
					onThemeChange={onThemeChange}
				/>
				<NewThemeButton />
			</div>
		</div>
	);
}
