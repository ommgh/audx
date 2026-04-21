import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { writeRegistryFile } from "../core/file-writer.js";
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
	// Config must exist
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	const aliasMap = loadFromTsConfig(projectRoot);
	const updatedConfig = {
		...config,
		installedSounds: { ...config.installedSounds },
	};

	// Requirement 10.5 — if sound name provided, update only that sound
	const soundsToUpdate = soundName
		? [soundName]
		: Object.keys(config.installedSounds);

	if (soundsToUpdate.length === 0) {
		console.log("No sounds installed.");
		return;
	}

	// Validate the specified sound is installed
	if (soundName && !config.installedSounds[soundName]) {
		console.error(
			`Sound '${soundName}' is not installed. Installed sounds: ${Object.keys(config.installedSounds).join(", ") || "(none)"}`,
		);
		process.exit(1);
	}

	let updatedCount = 0;

	for (const name of soundsToUpdate) {
		try {
			// Fetch current registry item
			const item = await fetchItem(config.registryUrl, name);

			// Requirement 10.4 — only update sounds that have differences
			if (!soundName && !hasChanges(item.files, config, projectRoot)) {
				continue;
			}

			const targetDir = join(projectRoot, config.soundDir);
			const writtenFiles: string[] = [];

			// Overwrite local files with registry content
			for (const file of item.files) {
				const writtenPath = writeRegistryFile(
					file,
					targetDir,
					aliasMap,
					config,
				);
				if (writtenPath) {
					writtenFiles.push(writtenPath);
				} else {
					// File was skipped (existing dependency) — keep it in the list
					const localPath = resolveLocalPath(file, config, projectRoot);
					writtenFiles.push(localPath);
				}
			}

			// Requirement 10.6 — update timestamp in config
			updatedConfig.installedSounds[name] = {
				files: writtenFiles,
				installedAt: new Date().toISOString(),
			};

			updatedCount++;
			console.log(`✔ Updated ${name}`);
		} catch (error) {
			// Requirement 10.7 — continue on individual fetch failures with warning
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`⚠ Could not update '${name}': ${message}`);
		}
	}

	// Write updated config if any sounds were updated
	if (updatedCount > 0) {
		ConfigManager.write(projectRoot, updatedConfig);
	} else {
		console.log("All sounds are up to date.");
	}
}
