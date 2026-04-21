import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { generate as generateThemeCode } from "../codegen/theme-codegen.js";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import * as ThemeManager from "../core/theme-manager.js";
import { SEMANTIC_SOUND_NAMES, type SemanticSoundName } from "../types.js";

/**
 * Prompt the user with a yes/no question via stdin/stdout.
 * Returns `true` when the user answers y/yes (case-insensitive).
 */
function confirm(question: string): Promise<boolean> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(/^y(es)?$/i.test(answer.trim()));
		});
	});
}

/**
 * `audx theme init` — create `audx.themes.json` with a default theme.
 * Requirement 5.1, 5.2, 5.3, 5.4
 */
export async function themeInitCommand(projectRoot: string): Promise<void> {
	// Prompt if theme config already exists
	if (ThemeManager.exists(projectRoot)) {
		const overwrite = await confirm(
			"audx.themes.json already exists. Overwrite? (y/N) ",
		);
		if (!overwrite) {
			console.log("Theme init cancelled.");
			return;
		}
	}

	// Build default theme with all semantic names mapped to null
	const defaultMappings = Object.fromEntries(
		SEMANTIC_SOUND_NAMES.map((name) => [name, null]),
	) as Record<SemanticSoundName, null>;

	const themeConfig = {
		activeTheme: "default",
		themes: {
			default: defaultMappings,
		},
	};

	ThemeManager.write(projectRoot, themeConfig);
	console.log("✔ Created audx.themes.json with default theme");
}

/**
 * `audx theme set <theme-name>` — set the active theme.
 * Requirement 6.1, 6.2
 */
export function themeSetCommand(themeName: string, projectRoot: string): void {
	const themeConfig = ThemeManager.read(projectRoot);

	if (!(themeName in themeConfig.themes)) {
		const available = Object.keys(themeConfig.themes).join(", ");
		console.error(
			`Theme "${themeName}" does not exist. Available themes: ${available}`,
		);
		process.exit(1);
	}

	const updated = ThemeManager.setActiveTheme(themeConfig, themeName);
	ThemeManager.write(projectRoot, updated);
	console.log(`✔ Active theme set to "${themeName}"`);
}

/**
 * `audx theme map <semantic-name> <sound-name>` — map a semantic name to an installed sound.
 * Requirement 6.3, 6.4, 6.5
 */
export function themeMapCommand(
	semanticName: string,
	soundName: string,
	projectRoot: string,
): void {
	// Validate semantic name
	if (!SEMANTIC_SOUND_NAMES.includes(semanticName as SemanticSoundName)) {
		const valid = SEMANTIC_SOUND_NAMES.join(", ");
		console.error(
			`"${semanticName}" is not a valid semantic sound name. Valid names: ${valid}`,
		);
		process.exit(1);
	}

	// Validate config exists and sound is installed
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const installed = config.installedSounds[soundName];

	if (!installed) {
		console.error(
			`Sound "${soundName}" is not installed. Run 'audx add ${soundName}' first.`,
		);
		process.exit(1);
	}

	// Find the sound module file path (the first file in soundDir, or the first file overall)
	const soundFilePath =
		installed.files.find((f) => f.includes(config.soundDir)) ??
		installed.files[0];

	const themeConfig = ThemeManager.read(projectRoot);
	const updated = ThemeManager.mapSound(
		themeConfig,
		semanticName as SemanticSoundName,
		soundFilePath,
	);
	ThemeManager.write(projectRoot, updated);
	console.log(
		`✔ Mapped "${semanticName}" → "${soundName}" (${soundFilePath}) in theme "${updated.activeTheme}"`,
	);
}

/**
 * `audx theme create <theme-name>` — add a new theme with all names mapped to null.
 * Requirement 6.6
 */
export function themeCreateCommand(
	themeName: string,
	projectRoot: string,
): void {
	const themeConfig = ThemeManager.read(projectRoot);

	if (themeName in themeConfig.themes) {
		console.error(`Theme "${themeName}" already exists.`);
		process.exit(1);
	}

	const updated = ThemeManager.createTheme(themeConfig, themeName);
	ThemeManager.write(projectRoot, updated);
	console.log(`✔ Created theme "${themeName}"`);
}

/**
 * `audx theme list` — display all themes, indicate active theme.
 * Requirement 6.7
 */
export function themeListCommand(projectRoot: string): void {
	const themeConfig = ThemeManager.read(projectRoot);

	console.log("Themes:");
	for (const themeName of Object.keys(themeConfig.themes)) {
		const indicator = themeName === themeConfig.activeTheme ? " (active)" : "";
		const mappings = themeConfig.themes[themeName];
		const mapped = Object.values(mappings).filter((v) => v !== null).length;
		const total = Object.keys(mappings).length;
		console.log(
			`  ${themeName}${indicator} — ${mapped}/${total} sounds mapped`,
		);
	}
}

/**
 * `audx theme generate` — generate `sound-theme.ts` via ThemeCodegen.
 * Requirement 7.1
 */
export function themeGenerateCommand(projectRoot: string): void {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	if (!ThemeManager.exists(projectRoot)) {
		console.error(
			"Theme configuration not found. Run 'audx theme init' first.",
		);
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const themeConfig = ThemeManager.read(projectRoot);
	const aliasMap = loadFromTsConfig(projectRoot);

	const source = generateThemeCode(themeConfig, aliasMap, config);
	const outputPath = join(projectRoot, config.libDir, "sound-theme.ts");

	mkdirSync(join(projectRoot, config.libDir), { recursive: true });
	writeFileSync(outputPath, source, "utf-8");

	console.log(`✔ Generated ${config.libDir}/sound-theme.ts`);
}
