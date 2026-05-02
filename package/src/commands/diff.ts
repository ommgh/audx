import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import * as ConfigManager from "../core/config.js";
import { buildSoundFilePath } from "../core/naming.js";
import { fetchThemedItem } from "../core/registry.js";
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
		if (normalised.startsWith("audio/") || normalised.includes("/audio/")) {
			const semanticName = basename(fileName, ".ts");
			return buildSoundFilePath(
				join(projectRoot, config.soundDir),
				semanticName,
			);
		}
		return join(projectRoot, config.libDir, fileName);
	}

	const semanticName = basename(fileName, ".ts");
	return buildSoundFilePath(join(projectRoot, config.soundDir), semanticName);
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
 * Check whether a registry item has changes compared to local files.
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
			return true;
		}

		if (file.content !== localContent) {
			return true;
		}
	}
	return false;
}

export async function diffCommand(projectRoot: string): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const installedNames = config.installedSounds;

	if (installedNames.length === 0) {
		console.log("No sounds installed.");
		return;
	}

	const changedSounds: string[] = [];

	for (const soundName of installedNames) {
		try {
			// Requirement 9.1 — fetch themed registry item for each installed sound
			const item = await fetchThemedItem(
				config.registryUrl,
				config.theme,
				soundName,
			);

			if (hasChanges(item.files, config, projectRoot)) {
				changedSounds.push(soundName);
			}
		} catch (error) {
			// Requirement 9.5 — continue on individual fetch failures with warning
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`⚠ Could not check '${soundName}': ${message}`);
		}
	}

	if (changedSounds.length > 0) {
		console.log("Sounds with available updates:");
		for (const name of changedSounds) {
			console.log(`  • ${name}`);
		}
	} else {
		console.log("All sounds are up to date.");
	}
}
