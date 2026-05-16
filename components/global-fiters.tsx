import { RiAddLine } from "@remixicon/react";
import Link from "next/link";
import { SoundSearch } from "@/components/audio-search";
import { ThemeSelector } from "@/components/theme-selector";
import { buttonVariants } from "@/components/ui/button";
import type { ThemeCatalogItem } from "@/lib/audio-catalog";
import { cn } from "@/lib/utils";

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
				<Link
					href="/editor"
					className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
				>
					<RiAddLine data-icon="inline-start" />
					New Theme
				</Link>
			</div>
		</div>
	);
}
