import { parseAsString, useQueryState } from "nuqs";
import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { trackEvent } from "@/lib/analytics";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { filterAudio } from "@/lib/audio-filters";
import type { ThemeCatalogItem } from "@/lib/theme-data";

export const useGlobalFilters = ({
	items,
	themes = [],
}: {
	items: AudioCatalogItem[];
	themes?: ThemeCatalogItem[];
}) => {
	const defaultTheme = themes.length > 0 ? themes[0].name : "";

	const [query, setQuery] = useQueryState(
		"q",
		parseAsString
			.withDefault("")
			.withOptions({ shallow: true, throttleMs: 300 }),
	);

	const [theme, setTheme] = useQueryState(
		"theme",
		parseAsString.withDefault(""),
	);

	const [category, setCategory] = useQueryState(
		"category",
		parseAsString.withDefault(""),
	);

	// On mount, if theme is empty, default to the first theme's name
	useEffect(() => {
		if (!theme && defaultTheme) {
			setTheme(defaultTheme);
		}
	}, [theme, defaultTheme, setTheme]);

	// When theme changes, reset category to ""
	const prevThemeRef = useRef(theme);
	useEffect(() => {
		if (prevThemeRef.current !== theme) {
			prevThemeRef.current = theme;
			setCategory("");
		}
	}, [theme, setCategory]);

	const handleClearFilters = useCallback(() => {
		setQuery("");
		setTheme(defaultTheme);
		setCategory("");
	}, [setQuery, setTheme, setCategory, defaultTheme]);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed) {
			trackEvent("search_used", { query: trimmed });
		}
	}, [query]);

	const filteredItems = useMemo(
		() => filterAudio(items, query, theme || undefined, category || undefined),
		[items, query, theme, category],
	);

	// Keep old cards visible while React prepares new ones
	const deferredItems = useDeferredValue(filteredItems);
	const isPending = deferredItems !== filteredItems;

	return {
		query,
		setQuery,
		theme,
		setTheme,
		category,
		setCategory,
		filteredItems,
		deferredItems,
		isPending,
		handleClearFilters,
	};
};
