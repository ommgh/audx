import type { SoundDefinition, SoundPatch } from "@litlab/audx";
import minimalPatch from "@/.themes/minimal.json";
import playfulPatch from "@/.themes/playful.json";
import { CATEGORIES } from "@/demo/cat";

export type AudioThemeName = "minimal" | "playful";

export type AudioCatalogItem = {
	name: string;
	title: string;
	description?: string;
	category: string;
	theme: AudioThemeName;
	meta: {
		theme: AudioThemeName;
		semanticName: string;
		duration: number;
	};
};

export type ThemeCatalogItem = {
	name: AudioThemeName;
	displayName: string;
	description?: string;
	soundCount: number;
	mappedCount: number;
};

export type CategoryCount = {
	name: string;
	count: number;
};

const PATCHES: Record<AudioThemeName, SoundPatch> = {
	minimal: minimalPatch as SoundPatch,
	playful: playfulPatch as SoundPatch,
};

export function getAllThemes(): ThemeCatalogItem[] {
	return Object.entries(PATCHES).map(([name, patch]) => ({
		name: name as AudioThemeName,
		displayName: patch.name,
		description: patch.description,
		soundCount: Object.keys(patch.sounds).length,
		mappedCount: Object.keys(patch.sounds).length,
	}));
}

export function getAllAudio(): AudioCatalogItem[] {
	return Object.entries(PATCHES).flatMap(([theme, patch]) =>
		Object.entries(patch.sounds).map(([soundName, definition]) =>
			createAudioItem(theme as AudioThemeName, soundName, definition),
		),
	);
}

export function getCategoriesForItems(
	items: AudioCatalogItem[],
): CategoryCount[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
	}
	return Array.from(counts.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatDuration(seconds: number): string {
	if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
	return `${seconds.toFixed(1)}s`;
}

export function formatSizeKb(size: number): string {
	return `${Math.round(size)} KB`;
}

export function getAudioByName(name: string): AudioCatalogItem | undefined {
	return getAllAudio().find((item) => item.name === name);
}

function createAudioItem(
	theme: AudioThemeName,
	soundName: string,
	definition: SoundDefinition,
): AudioCatalogItem {
	return {
		name: `audio/${theme}/${soundName}`,
		title: toTitle(soundName),
		category: CATEGORIES[soundName] ?? "other",
		theme,
		meta: {
			theme,
			semanticName: soundName,
			duration: getDuration(definition),
		},
	};
}

function getDuration(definition: SoundDefinition): number {
	if ("layers" in definition) {
		return Math.max(
			...definition.layers.map(
				(layer) => (layer.delay ?? 0) + getDuration(layer),
			),
		);
	}

	const envelope = definition.envelope ?? { decay: 0.5 };
	const effectsTail = definition.effects?.reduce((tail, effect) => {
		if (effect.type === "delay") return Math.max(tail, effect.time ?? 0.25);
		if (effect.type === "reverb") return Math.max(tail, effect.decay ?? 0.5);
		return tail;
	}, 0);

	return (
		(envelope.attack ?? 0) +
		envelope.decay +
		(envelope.release ?? 0) +
		(effectsTail ?? 0)
	);
}

function toTitle(value: string): string {
	return value
		.split(/[-_\s]+/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
