import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { writeRegistryFile } from "../core/file-writer.js";
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

export async function updateCommand(
	soundName: string | undefined,
	projectRoot: string,
): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const aliasMap = loadFromTsConfig(projectRoot);

	// Iterate installedSounds as flat string array
	const soundsToUpdate = soundName ? [soundName] : [...config.installedSounds];

	if (soundsToUpdate.length === 0) {
		console.log("No sounds installed.");
		return;
	}

	// Validate the specified sound is installed
	if (soundName && !config.installedSounds.includes(soundName)) {
		const list =
			config.installedSounds.length > 0
				? config.installedSounds.join(", ")
				: "(none)";
		console.error(
			`Sound '${soundName}' is not installed. Installed sounds: ${list}`,
		);
		process.exit(1);
	}

	let updatedCount = 0;

	for (const name of soundsToUpdate) {
		try {
			// Requirement 9.2 — fetch themed registry item
			const item = await fetchThemedItem(
				config.registryUrl,
				config.theme,
				name,
			);

			// Only update sounds that have differences (unless explicitly named)
			if (!soundName && !hasChanges(item.files, config, projectRoot)) {
				continue;
			}

			const targetDir = join(projectRoot, config.soundDir);

			// Overwrite local files with registry content
			for (const file of item.files) {
				writeRegistryFile(file, targetDir, aliasMap, config);
			}

			updatedCount++;
			console.log(`✔ Updated ${name}`);
		} catch (error) {
			// Requirement 9.5 — continue on individual fetch failures with warning
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`⚠ Could not update '${name}': ${message}`);
		}
	}

	if (updatedCount === 0) {
		console.log("All sounds are up to date.");
	}
}
