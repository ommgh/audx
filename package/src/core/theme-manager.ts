import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	SEMANTIC_SOUND_NAMES,
	type SemanticSoundName,
	type ThemeConfig,
	themeConfigSchema,
} from "../types.js";

const THEME_FILE_NAME = "audx.themes.json";

/**
 * Resolve the full path to the theme config file given a project root.
 */
function themePath(projectRoot: string): string {
	return join(projectRoot, THEME_FILE_NAME);
}

/**
 * Check whether `audx.themes.json` exists in the given project root.
 */
export function exists(projectRoot: string): boolean {
	return existsSync(themePath(projectRoot));
}

/**
 * Read and validate `audx.themes.json` from the given project root.
 * Throws if the file doesn't exist, contains invalid JSON, or fails validation.
 */
export function read(projectRoot: string): ThemeConfig {
	const filePath = themePath(projectRoot);
	const content = readFileSync(filePath, "utf-8");
	const parsed: unknown = JSON.parse(content);
	return themeConfigSchema.parse(parsed);
}

/**
 * Serialize and write a ThemeConfig to `audx.themes.json` in the given project root.
 * Uses 2-space indentation for readability.
 */
export function write(projectRoot: string, config: ThemeConfig): void {
	const filePath = themePath(projectRoot);
	const json = JSON.stringify(config, null, 2);
	writeFileSync(filePath, json + "\n", "utf-8");
}

/**
 * Return a new ThemeConfig with the active theme set to the given name.
 */
export function setActiveTheme(
	config: ThemeConfig,
	themeName: string,
): ThemeConfig {
	return { ...config, activeTheme: themeName };
}

/**
 * Return a new ThemeConfig with the given semantic name mapped to the sound path
 * in the active theme.
 */
export function mapSound(
	config: ThemeConfig,
	semanticName: SemanticSoundName,
	soundPath: string,
): ThemeConfig {
	const activeTheme = config.activeTheme;
	const currentMappings = config.themes[activeTheme];
	return {
		...config,
		themes: {
			...config.themes,
			[activeTheme]: {
				...currentMappings,
				[semanticName]: soundPath,
			},
		},
	};
}

/**
 * Return a new ThemeConfig with a new theme entry where all semantic names
 * are mapped to null.
 */
export function createTheme(
	config: ThemeConfig,
	themeName: string,
): ThemeConfig {
	const emptyMappings = Object.fromEntries(
		SEMANTIC_SOUND_NAMES.map((name) => [name, null]),
	) as Record<SemanticSoundName, null>;

	return {
		...config,
		themes: {
			...config.themes,
			[themeName]: emptyMappings,
		},
	};
}

/**
 * Return a new ThemeConfig with all references to the given sound name set to null
 * across all themes.
 */
export function removeSoundMappings(
	config: ThemeConfig,
	soundName: string,
): ThemeConfig {
	const updatedThemes: ThemeConfig["themes"] = {};

	for (const [themeName, mappings] of Object.entries(config.themes)) {
		const updatedMappings = { ...mappings };
		for (const [key, value] of Object.entries(updatedMappings)) {
			if (value !== null && value.includes(soundName)) {
				updatedMappings[key as SemanticSoundName] = null;
			}
		}
		updatedThemes[themeName] = updatedMappings;
	}

	return {
		...config,
		themes: updatedThemes,
	};
}
