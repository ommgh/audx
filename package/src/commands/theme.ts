import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { writeRegistryFile } from "../core/file-writer.js";
import { fetchThemedItem } from "../core/registry.js";

/**
 * `audx theme set <theme-name>` — switch all installed sounds to a new theme.
 *
 * 1. Validates config exists
 * 2. Updates config.theme and writes immediately
 * 3. Re-fetches every installed sound from the new theme
 * 4. Overwrites each sound file in-place
 * 5. Logs warnings for individual failures, continues with remaining
 * 6. Displays summary
 */
export async function themeSetCommand(
	themeName: string,
	projectRoot: string,
): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);

	// Update theme immediately
	config.theme = themeName;
	ConfigManager.write(projectRoot, config);

	const aliasMap = loadFromTsConfig(projectRoot);
	const total = config.installedSounds.length;
	let updated = 0;

	for (const name of config.installedSounds) {
		try {
			const item = await fetchThemedItem(config.registryUrl, themeName, name);

			for (const file of item.files) {
				writeRegistryFile(file, config.soundDir, aliasMap, config);
			}

			updated++;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.warn(`⚠ Failed to update "${name}": ${message}`);
		}
	}

	console.log(
		`✔ Theme set to '${themeName}'. Updated ${updated}/${total} sounds.`,
	);
}
