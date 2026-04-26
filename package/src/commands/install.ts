import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { writeRegistryFile } from "../core/file-writer.js";
import { fetchThemedItem } from "../core/registry.js";
import { SEMANTIC_SOUND_NAMES } from "../types.js";

/**
 * `audx install <theme> pack` — bulk-install all 67 semantic sounds for a theme.
 *
 * 1. Validates config exists
 * 2. Iterates SEMANTIC_SOUND_NAMES, fetching each from the specified theme
 * 3. Writes each sound to {soundDir}/{semantic-name}.ts, overwriting without prompting
 * 4. Updates config: sets theme and records all successfully installed names
 * 5. Logs warning per failed sound, continues with remaining
 * 6. Displays summary with total count
 */
export async function installPackCommand(
	themeName: string,
	projectRoot: string,
): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const aliasMap = loadFromTsConfig(projectRoot);
	const total = SEMANTIC_SOUND_NAMES.length;
	const installed: string[] = [];

	for (const name of SEMANTIC_SOUND_NAMES) {
		try {
			const item = await fetchThemedItem(config.registryUrl, themeName, name);

			for (const file of item.files) {
				writeRegistryFile(file, config.soundDir, aliasMap, config);
			}

			installed.push(name);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.warn(`⚠ Failed to install "${name}": ${message}`);
		}
	}

	config.theme = themeName;
	config.installedSounds = installed;
	ConfigManager.write(projectRoot, config);

	console.log(
		`✔ Installed ${installed.length}/${total} sounds from '${themeName}' theme.`,
	);
}
