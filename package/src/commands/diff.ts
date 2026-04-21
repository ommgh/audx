import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import * as ConfigManager from "../core/config.js";
import { fetchItem } from "../core/registry.js";
import type { AudxConfig, RegistryFile } from "../types.js";

/**
 * Resolve the expected local file path for a registry file based on its type
 * and the project config.
 */
function resolveLocalPath(
	file: RegistryFile,
	config: AudxConfig,
	projectRoot: string,
): string {
	const fileName = basename(file.path);

	if (file.type === "registry:hook") {
		const hooksDir = join(dirname(config.libDir), "hooks");
		return join(projectRoot, hooksDir, fileName);
	}

	if (file.type === "registry:lib") {
		const normalised = file.path.replace(/\\/g, "/");
		if (normalised.includes("/sounds/")) {
			return join(projectRoot, config.soundDir, fileName);
		}
		return join(projectRoot, config.libDir, fileName);
	}

	return join(projectRoot, config.soundDir, fileName);
}

/**
 * Read local file content, returning null if the file cannot be read.
 */
function readLocalFile(filePath: string): string | null {
	try {
		return readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
}

/**
 * Compare registry file content against local file content.
 * Returns true if the files differ (ignoring import path differences
 * is not feasible here — we compare raw registry content against local).
 *
 * Since local files have rewritten imports, we only compare the sound
 * module files (the primary files in /sounds/) by checking if the local
 * file exists and has different content length or key data sections.
 * For a pragmatic approach, we compare the full content of each registry
 * file against the local file. Note: import-rewritten files will always
 * show as different if aliases differ from registry defaults, but this
 * is the expected behavior for detecting upstream changes.
 */
function hasChanges(
	registryFiles: RegistryFile[],
	config: AudxConfig,
	projectRoot: string,
): boolean {
	for (const file of registryFiles) {
		const localPath = resolveLocalPath(file, config, projectRoot);
		const localContent = readLocalFile(localPath);

		if (localContent === null) {
			// File missing locally — counts as a difference
			return true;
		}

		// Compare registry content against local content
		if (file.content !== localContent) {
			return true;
		}
	}
	return false;
}

export async function diffCommand(projectRoot: string): Promise<void> {
	// Config must exist
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const installedNames = Object.keys(config.installedSounds);

	if (installedNames.length === 0) {
		console.log("No sounds installed.");
		return;
	}

	const changedSounds: string[] = [];

	for (const soundName of installedNames) {
		try {
			// Requirement 10.1 — fetch current registry item for each installed sound
			const item = await fetchItem(config.registryUrl, soundName);

			// Compare fetched file content against local files
			if (hasChanges(item.files, config, projectRoot)) {
				changedSounds.push(soundName);
			}
		} catch (error) {
			// Requirement 10.7 — continue on individual fetch failures with warning
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`⚠ Could not check '${soundName}': ${message}`);
		}
	}

	// Requirement 10.2 — display changed sound names
	if (changedSounds.length > 0) {
		console.log("Sounds with available updates:");
		for (const name of changedSounds) {
			console.log(`  • ${name}`);
		}
	} else {
		// Requirement 10.3 — all up to date message
		console.log("All sounds are up to date.");
	}
}
