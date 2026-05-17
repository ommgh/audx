import { CATEGORIES } from "@/lib/audio-taxonomy";

export type ThemeJson = {
	name: string;
	author?: string;
	description?: string;
	version?: string;
	license?: string;
	compatibility?: string;
	sounds: Record<string, unknown>;
};

export function validateTheme(data: unknown): data is ThemeJson {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;
	return (
		typeof obj.name === "string" &&
		typeof obj.sounds === "object" &&
		obj.sounds !== null &&
		!Array.isArray(obj.sounds)
	);
}

export function deriveThemeMeta(theme: ThemeJson) {
	const sourceTypes = new Set<string>();
	let hasEffects = false;
	let hasLayers = false;

	for (const sound of Object.values(theme.sounds)) {
		walkSound(sound, sourceTypes, {
			onEffects: () => {
				hasEffects = true;
			},
			onLayers: () => {
				hasLayers = true;
			},
		});
	}

	return {
		categories: new Map(
			Object.keys(theme.sounds).map((name) => [
				name,
				CATEGORIES[name] ?? "general",
			]),
		),
		sourceTypes: Array.from(sourceTypes).sort(),
		hasEffects,
		hasLayers,
		fileSize: Buffer.byteLength(JSON.stringify(theme), "utf8"),
	};
}

function walkSound(
	value: unknown,
	sourceTypes: Set<string>,
	hooks: { onEffects: () => void; onLayers: () => void },
) {
	if (typeof value !== "object" || value === null) return;

	if (Array.isArray(value)) {
		for (const item of value) walkSound(item, sourceTypes, hooks);
		return;
	}

	const obj = value as Record<string, unknown>;

	if (typeof obj.type === "string") {
		sourceTypes.add(obj.type);
	}

	if (Array.isArray(obj.effects) && obj.effects.length > 0) {
		hooks.onEffects();
	}

	if (Array.isArray(obj.layers)) {
		hooks.onLayers();
		for (const layer of obj.layers) walkSound(layer, sourceTypes, hooks);
	}
}
