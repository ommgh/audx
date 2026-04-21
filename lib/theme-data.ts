import { cache } from "react";
import minimalTheme from "@/registry/audx/themes/minimal.json";
import playfulTheme from "@/registry/audx/themes/playful.json";
import registry from "@/registry.json";

export interface ThemeCatalogItem {
	name: string;
	displayName: string;
	description: string;
	author: string;
	soundCount: number;
	mappedCount: number;
}

export interface ThemeSound {
	semanticName: string;
	category: string;
	soundAssetName: string | null;
	duration: number | null;
	sizeKb: number | null;
}

export interface ThemeDetail extends ThemeCatalogItem {
	sounds: ThemeSound[];
}

interface ThemeDefinition {
	name: string;
	displayName: string;
	description: string;
	author: string;
	mappings: Record<string, string | null>;
}

const THEME_DEFINITIONS: ThemeDefinition[] = [
	minimalTheme as ThemeDefinition,
	playfulTheme as ThemeDefinition,
];

const CATEGORIES: Record<string, string> = {
	success: "feedback",
	error: "feedback",
	warning: "feedback",
	info: "notification",
	click: "interaction",
	back: "navigation",
	enter: "interaction",
	delete: "destructive",
	copy: "clipboard",
	paste: "clipboard",
	scroll: "navigation",
	hover: "interaction",
	toggle: "interaction",
	notify: "notification",
	complete: "feedback",
	loading: "progress",
	tap: "interaction",
	press: "interaction",
	release: "interaction",
	drag: "interaction",
	drop: "interaction",
	select: "interaction",
	deselect: "interaction",
	focus: "interaction",
	blur: "interaction",
	forward: "navigation",
	open: "navigation",
	close: "navigation",
	expand: "navigation",
	collapse: "navigation",
	tab: "navigation",
	swipe: "navigation",
	confirm: "feedback",
	cancel: "feedback",
	deny: "feedback",
	undo: "feedback",
	redo: "feedback",
	alert: "notification",
	message: "notification",
	reminder: "notification",
	mention: "notification",
	show: "transition",
	hide: "transition",
	slide: "transition",
	fade: "transition",
	pop: "transition",
	clear: "destructive",
	remove: "destructive",
	trash: "destructive",
	shred: "destructive",
	upload: "progress",
	download: "progress",
	refresh: "progress",
	sync: "progress",
	process: "progress",
	cut: "clipboard",
	snapshot: "clipboard",
	lock: "state",
	unlock: "state",
	enable: "state",
	disable: "state",
	connect: "state",
	disconnect: "state",
	mute: "media",
	unmute: "media",
	record: "media",
	capture: "media",
};

function buildRegistryMeta(): Map<
	string,
	{ duration: number; sizeKb: number }
> {
	const map = new Map<string, { duration: number; sizeKb: number }>();
	for (const item of registry.items) {
		if (item.type === "registry:block" && item.meta) {
			map.set(item.name, {
				duration: item.meta.duration ?? 0,
				sizeKb: item.meta.sizeKb ?? 0,
			});
		}
	}
	return map;
}

export const getAllThemes = cache((): ThemeCatalogItem[] => {
	return THEME_DEFINITIONS.map((def) => {
		const entries = Object.values(def.mappings);
		return {
			name: def.name,
			displayName: def.displayName,
			description: def.description,
			author: def.author,
			soundCount: entries.length,
			mappedCount: entries.filter((v) => v !== null).length,
		};
	});
});

export const getThemeByName = cache((name: string): ThemeDetail | undefined => {
	const def = THEME_DEFINITIONS.find((d) => d.name === name);
	if (!def) return undefined;

	const meta = buildRegistryMeta();
	const sounds: ThemeSound[] = Object.entries(def.mappings).map(
		([semanticName, assetPath]) => {
			const assetName = assetPath
				? (assetPath.split("/").pop()?.replace(/\.ts$/, "") ?? null)
				: null;
			const assetMeta = assetName ? meta.get(assetName) : undefined;
			return {
				semanticName,
				category: CATEGORIES[semanticName] ?? "interaction",
				soundAssetName: assetName,
				duration: assetMeta?.duration ?? null,
				sizeKb: assetMeta?.sizeKb ?? null,
			};
		},
	);

	const entries = Object.values(def.mappings);
	return {
		name: def.name,
		displayName: def.displayName,
		description: def.description,
		author: def.author,
		soundCount: entries.length,
		mappedCount: entries.filter((v) => v !== null).length,
		sounds,
	};
});
