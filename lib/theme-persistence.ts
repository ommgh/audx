import { BlobNotFoundError, head, put } from "@vercel/blob";
import { SEMANTIC_SOUND_CATEGORIES } from "@/package/src/types";

export interface RegistryItemJSON {
	$schema: string;
	name: string;
	type: "registry:block";
	title: string;
	description: string;
	author: string;
	files: Array<{ path: string; content: string; type: "registry:lib" }>;
	meta: {
		duration: number;
		format: "mp3";
		sizeKb: number;
		license: "CC0";
		tags: string[];
		theme: string;
		semanticName: string;
	};
}

export interface ThemeRegistryIndex {
	name: string;
	displayName: string;
	description: string;
	author: string;
	assetCount: number;
	mappings: Record<string, string>;
	assets: Array<{
		semanticName: string;
		assetName: string;
		blobUrl: string;
		duration: number;
		sizeKb: number;
	}>;
}

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
	indexUrl: string;
	assetCount: number;
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
 * Build a RegistryItemJSON for a single sound asset, suitable for blob upload.
 */
export function buildRegistryItemJSON(
	semanticName: string,
	themeName: string,
	audioBase64: string,
	duration: number,
): RegistryItemJSON {
	const assetName = `${semanticName}-${themeName}-001`;
	return {
		$schema: "https://audx.site/schema/registry-item.json",
		name: assetName,
		type: "registry:block",
		title: toDisplayName(assetName),
		description: `Sound asset: ${semanticName} for theme ${themeName}`,
		author: "audx-community",
		files: [
			{
				path: `registry/audx/audio/${assetName}/${assetName}.ts`,
				content: buildAssetModuleContent(assetName, audioBase64, duration),
				type: "registry:lib",
			},
		],
		meta: {
			duration,
			format: "mp3",
			sizeKb: calculateSizeKb(audioBase64),
			license: "CC0",
			tags: [semanticName, themeName],
			theme: themeName,
			semanticName,
		},
	};
}

/**
 * Build a ThemeRegistryIndex for a user-generated theme stored in blob storage.
 */
export function buildThemeRegistryIndex(
	themeName: string,
	themePrompt: string,
	assets: Array<{
		semanticName: string;
		blobUrl: string;
		duration: number;
		sizeKb: number;
	}>,
): ThemeRegistryIndex {
	const mappings: Record<string, string> = {};
	for (const asset of assets) {
		mappings[asset.semanticName] = asset.blobUrl;
	}

	return {
		name: themeName,
		displayName: toDisplayName(themeName),
		description: `Generated theme: ${themePrompt}`,
		author: "audx-community",
		assetCount: assets.length,
		mappings,
		assets: assets.map((asset) => ({
			semanticName: asset.semanticName,
			assetName: `${asset.semanticName}-${themeName}-001`,
			blobUrl: asset.blobUrl,
			duration: asset.duration,
			sizeKb: asset.sizeKb,
		})),
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
 * Check if a theme already exists in blob storage by looking for its index file.
 */
export async function themeExistsInBlob(themeName: string): Promise<boolean> {
	try {
		await head(`themes/${themeName}/index.json`);
		return true;
	} catch (error) {
		if (error instanceof BlobNotFoundError) {
			return false;
		}
		throw error;
	}
}

/**
 * Persist a generated theme pack to Vercel Blob storage.
 *
 * 1. Upload each sound as a RegistryItemJSON blob
 * 2. Upload a ThemeRegistryIndex blob linking all assets
 */
export async function persistThemePack(
	input: PersistThemeInput,
): Promise<PersistThemeResult> {
	const { themeName, themePrompt, sounds } = input;

	// 1. Upload each sound as a RegistryItemJSON blob in parallel
	const uploadResults = await Promise.all(
		sounds.map(async (sound) => {
			const item = buildRegistryItemJSON(
				sound.semanticName,
				themeName,
				sound.audioBase64,
				sound.duration,
			);
			const blobPath = `themes/${themeName}/${sound.semanticName}-${themeName}-001.json`;
			const result = await put(blobPath, JSON.stringify(item), {
				access: "public",
				addRandomSuffix: false,
				contentType: "application/json",
			});
			return {
				semanticName: sound.semanticName,
				blobUrl: result.url,
				duration: sound.duration,
				sizeKb: calculateSizeKb(sound.audioBase64),
			};
		}),
	);

	// 2. Build and upload the theme registry index
	const index = buildThemeRegistryIndex(themeName, themePrompt, uploadResults);
	const indexResult = await put(
		`themes/${themeName}/index.json`,
		JSON.stringify(index),
		{
			access: "public",
			addRandomSuffix: false,
			contentType: "application/json",
		},
	);

	return {
		indexUrl: indexResult.url,
		assetCount: sounds.length,
	};
}
