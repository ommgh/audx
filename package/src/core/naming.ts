/**
 * Pure helper functions for building and parsing registry names, URLs, and paths.
 */

/**
 * Build a registry item name from theme and semantic name.
 * @example buildItemName("minimal", "click") → "audio/minimal/click"
 */
export function buildItemName(theme: string, semanticName: string): string {
	return `audio/${theme}/${semanticName}`;
}

/**
 * Parse a registry item name into its theme and semantic name components.
 * @throws if the name does not match the expected `audio/{theme}/{semantic-name}` format.
 */
export function parseItemName(name: string): {
	theme: string;
	semanticName: string;
} {
	const match = name.match(/^audio\/([^/]+)\/([^/]+)$/);
	if (!match) {
		throw new Error(
			`Invalid item name "${name}": expected format "audio/{theme}/{semantic-name}"`,
		);
	}
	return { theme: match[1], semanticName: match[2] };
}

/**
 * Build the full registry URL for a themed sound item.
 * @example buildItemUrl("https://audx.site", "minimal", "click") → "https://audx.site/r/audio/minimal/click.json"
 */
export function buildItemUrl(
	registryUrl: string,
	theme: string,
	semanticName: string,
): string {
	return `${registryUrl}/r/audio/${theme}/${semanticName}.json`;
}

/**
 * Build the local file path for a sound module.
 * @example buildSoundFilePath("assets/audio", "click") → "assets/audio/click.ts"
 */
export function buildSoundFilePath(
	soundDir: string,
	semanticName: string,
): string {
	return `${soundDir}/${semanticName}.ts`;
}

/**
 * Build the output path for the build script from a registry item name.
 * @example buildOutputPath("audio/minimal/click") → "public/r/audio/minimal/click.json"
 */
export function buildOutputPath(itemName: string): string {
	return `public/r/${itemName}.json`;
}

/**
 * Build the CLI install command for a semantic sound name.
 * @example buildInstallCommand("click") → "npx audx add click"
 */
export function buildInstallCommand(semanticName: string): string {
	return `npx audx add ${semanticName}`;
}

/**
 * Convert a kebab-case string to camelCase.
 */
function kebabToCamelCase(str: string): string {
	return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Build the import pattern for a semantic sound name.
 * Converts kebab-case to camelCase and appends `Audio` suffix.
 * @example buildImportPattern("click") → 'import { clickAudio } from "@/assets/audio/click"'
 * @example buildImportPattern("scroll-down") → 'import { scrollDownAudio } from "@/assets/audio/scroll-down"'
 */
export function buildImportPattern(semanticName: string): string {
	const camelName = kebabToCamelCase(semanticName);
	return `import { ${camelName}Audio } from "@/assets/audio/${semanticName}"`;
}
