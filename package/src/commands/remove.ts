import { existsSync, unlinkSync } from "node:fs";
import * as ConfigManager from "../core/config.js";
import * as ThemeManager from "../core/theme-manager.js";
import type { AudxConfig } from "../types.js";

/**
 * Collect every file path referenced by installed sounds *other* than the
 * ones being removed. These are the files that must be preserved.
 */
function getFilesReferencedByOtherSounds(
	config: AudxConfig,
	soundsToRemove: Set<string>,
): Set<string> {
	const referenced = new Set<string>();
	for (const [name, entry] of Object.entries(config.installedSounds)) {
		if (soundsToRemove.has(name)) continue;
		for (const file of entry.files) {
			referenced.add(file);
		}
	}
	return referenced;
}

/**
 * Determine which files from a sound's entry are safe to delete.
 * Shared dependency files still referenced by other sounds are preserved.
 */
function getFilesToDelete(
	files: string[],
	preservedFiles: Set<string>,
): string[] {
	return files.filter((f) => !preservedFiles.has(f));
}

export async function removeCommand(
	sounds: string[],
	projectRoot: string,
): Promise<void> {
	// Requirement 9 — config must exist
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const updatedConfig: AudxConfig = {
		...config,
		installedSounds: { ...config.installedSounds },
	};

	const soundsToRemove = new Set(sounds);

	// Requirement 9.4 — error if sound is not installed
	for (const soundName of sounds) {
		if (!updatedConfig.installedSounds[soundName]) {
			const installed = Object.keys(updatedConfig.installedSounds);
			const list = installed.length > 0 ? installed.join(", ") : "(none)";
			console.error(
				`Sound '${soundName}' is not installed. Installed sounds: ${list}`,
			);
			process.exit(1);
		}
	}

	// Requirement 9.6 — preserve shared dependency files
	const preservedFiles = getFilesReferencedByOtherSounds(
		updatedConfig,
		soundsToRemove,
	);

	for (const soundName of sounds) {
		const entry = updatedConfig.installedSounds[soundName];
		const filesToDelete = getFilesToDelete(entry.files, preservedFiles);

		// Requirement 9.1 — delete sound module files
		for (const filePath of filesToDelete) {
			if (existsSync(filePath)) {
				unlinkSync(filePath);
			}
		}

		// Requirement 9.2 — remove from installedSounds
		delete updatedConfig.installedSounds[soundName];

		// Requirement 9.3 — update theme mappings
		if (ThemeManager.exists(projectRoot)) {
			const themeConfig = ThemeManager.read(projectRoot);
			const updatedThemeConfig = ThemeManager.removeSoundMappings(
				themeConfig,
				soundName,
			);
			ThemeManager.write(projectRoot, updatedThemeConfig);
		}

		console.log(`✔ Removed ${soundName}`);
	}

	// Write updated config once after all sounds are processed
	ConfigManager.write(projectRoot, updatedConfig);
}
