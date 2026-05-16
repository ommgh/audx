import {
	type AudioCatalogItem,
	type CategoryCount,
	getAllAudio,
	getAllThemes,
	getCategoriesForItems,
	type ThemeCatalogItem,
} from "@/lib/audio-catalog";

export type { CategoryCount, ThemeCatalogItem };
export { getAllThemes };

export function getCategoriesForTheme(theme: string): CategoryCount[] {
	const items = getAllAudio().filter((item) => item.theme === theme);
	return getCategoriesForItems(items);
}

export function getThemeAudio(theme: string): AudioCatalogItem[] {
	return getAllAudio().filter((item) => item.theme === theme);
}
