import { promises as fs } from "node:fs";
import path from "node:path";
import { SEMANTIC_SOUND_CATEGORIES } from "@/package/src/types";

export interface PersistThemeInput {
	themeName: string;
	themePrompt: string;
	sounds: Array<{
		semanticName: string;
		audioBase64: string;
		duration: number;
	}>;
}

export interface PersistThemeResult {
	themeDefinitionPath: string;
	assetCount: number;
	registryUpdated: boolean;
}

/**
 * Convert a kebab-case asset name to a camelCase export variable name.
 * e.g. "click-warm-wooden-001" → "clickWarmWooden001Audio"
 */
export function toCamelCaseExport(assetName: string): string {
	const camel = assetName.replace(/-([a-z0-9])/g, (_, char) =>
		char.toUpperCase(),
	);
	return `${camel}Audio`;
}

/**
 * Generate a display name by capitalizing each word of the theme name.
 * e.g. "warm-wooden" → "Warm Wooden"
 */
export function toDisplayName(themeName: string): string {
	return themeName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Calculate approximate file size in KB from a base64 string.
 */
export function calculateSizeKb(base64: string): number {
	return Math.max(1, Math.round((base64.length * 0.75) / 1024));
}

/**
 * Build the TypeScript module content for a sound asset.
 */
export function buildAssetModuleContent(
	assetName: string,
	audioBase64: string,
	duration: number,
): string {
	const varName = toCamelCaseExport(assetName);
	return `import type { AudioAsset } from "@/lib/audio-types";

export const ${varName}: AudioAsset = {
	name: "${assetName}",
	dataUri:
		"data:audio/mpeg;base64,${audioBase64}",
	duration: ${duration},
	format: "mp3",
	license: "CC0",
	author: "audx-community",
};
`;
}

/**
 * Build a theme definition JSON object.
 */
export function buildThemeDefinition(
	themeName: string,
	themePrompt: string,
	sounds: Array<{ semanticName: string }>,
): Record<string, unknown> {
	const displayName = toDisplayName(themeName);
	const mappings: Record<string, string> = {};

	for (const sound of sounds) {
		const assetName = `${sound.semanticName}-${themeName}-001`;
		mappings[sound.semanticName] =
			`registry/audx/audio/${assetName}/${assetName}.ts`;
	}

	return {
		name: themeName,
		displayName,
		description: `Generated theme: ${themePrompt}`,
		author: "audx-community",
		mappings,
	};
}

/**
 * Build a registry entry for a single sound asset.
 */
export function buildRegistryEntry(
	semanticName: string,
	themeName: string,
	duration: number,
	sizeKb: number,
): Record<string, unknown> {
	const assetName = `${semanticName}-${themeName}-001`;
	const displayName = toDisplayName(themeName);
	const category =
		SEMANTIC_SOUND_CATEGORIES[
			semanticName as keyof typeof SEMANTIC_SOUND_CATEGORIES
		] ?? "interaction";

	return {
		name: assetName,
		type: "registry:block",
		title: `${semanticName.charAt(0).toUpperCase() + semanticName.slice(1)} (${displayName})`,
		description: `A ${themeName.replace(/-/g, " ")} ${semanticName} sound.`,
		files: [
			{
				path: `registry/audx/audio/${assetName}/${assetName}.ts`,
				type: "registry:lib",
			},
			{
				path: "registry/audx/lib/audio-types.ts",
				type: "registry:lib",
			},
			{
				path: "registry/audx/lib/audio-engine.ts",
				type: "registry:lib",
			},
		],
		author: "audx-community",
		meta: {
			duration,
			format: "mp3",
			sizeKb,
			license: "CC0",
			tags: [semanticName, themeName, category],
			keywords: [semanticName, themeName, category, "ui", "sound"],
			theme: themeName,
			semanticName,
		},
	};
}

/**
 * Persist a generated theme pack to the registry.
 *
 * 1. Write each sound as a TS module in registry/audx/audio/{semantic}-{theme}-001/
 * 2. Create theme definition JSON in registry/audx/themes/{theme}.json
 * 3. Update registry.json with new asset entries
 */
export async function persistThemePack(
	input: PersistThemeInput,
): Promise<PersistThemeResult> {
	const { themeName, themePrompt, sounds } = input;
	const projectRoot = process.cwd();

	// 1. Write each sound as a TS module
	for (const sound of sounds) {
		const assetName = `${sound.semanticName}-${themeName}-001`;
		const assetDir = path.join(projectRoot, "registry/audx/audio", assetName);
		await fs.mkdir(assetDir, { recursive: true });

		const moduleContent = buildAssetModuleContent(
			assetName,
			sound.audioBase64,
			sound.duration,
		);
		await fs.writeFile(
			path.join(assetDir, `${assetName}.ts`),
			moduleContent,
			"utf-8",
		);
	}

	// 2. Create theme definition JSON
	const themeDefinition = buildThemeDefinition(themeName, themePrompt, sounds);
	const themeDefPath = path.join(
		projectRoot,
		"registry/audx/themes",
		`${themeName}.json`,
	);
	await fs.writeFile(
		themeDefPath,
		`${JSON.stringify(themeDefinition, null, "\t")}\n`,
		"utf-8",
	);

	// 3. Update registry.json with new asset entries
	const registryPath = path.join(projectRoot, "registry.json");
	const registryContent = await fs.readFile(registryPath, "utf-8");
	const registry = JSON.parse(registryContent);

	const newEntries = sounds.map((sound) => {
		const sizeKb = calculateSizeKb(sound.audioBase64);
		return buildRegistryEntry(
			sound.semanticName,
			themeName,
			sound.duration,
			sizeKb,
		);
	});

	registry.items.push(...newEntries);

	await fs.writeFile(
		registryPath,
		`${JSON.stringify(registry, null, "\t")}\n`,
		"utf-8",
	);

	return {
		themeDefinitionPath: `registry/audx/themes/${themeName}.json`,
		assetCount: sounds.length,
		registryUpdated: true,
	};
}
