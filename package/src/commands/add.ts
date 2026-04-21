import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { writeRegistryFile } from "../core/file-writer.js";
import { fetchItem } from "../core/registry.js";
import type { AudxConfig, RegistryFile } from "../types.js";

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
 * Check whether a registry file would conflict with an existing file on disk.
 * Returns the resolved target path if a conflict exists, otherwise null.
 */
function getConflictPath(
	file: RegistryFile,
	targetDir: string,
	config: AudxConfig,
): string | null {
	const fileName = basename(file.path);

	let targetPath: string;
	if (file.type === "registry:hook") {
		const hooksDir = join(dirname(config.libDir), "hooks");
		targetPath = join(hooksDir, fileName);
	} else if (file.type === "registry:lib") {
		const normalised = file.path.replace(/\\/g, "/");
		if (normalised.includes("/sounds/")) {
			targetPath = join(targetDir, fileName);
		} else {
			targetPath = join(config.libDir, fileName);
		}
	} else {
		targetPath = join(targetDir, fileName);
	}

	return existsSync(targetPath) ? targetPath : null;
}

/**
 * Determine whether a registry file is a shared dependency (lib or hook)
 * rather than the primary sound module.
 */
function isDependencyFile(file: RegistryFile): boolean {
	if (file.type === "registry:hook") return true;
	if (file.type === "registry:lib") {
		const normalised = file.path.replace(/\\/g, "/");
		return !normalised.includes("/sounds/");
	}
	return false;
}

export async function addCommand(
	sounds: string[],
	projectRoot: string,
): Promise<void> {
	// Requirement 3.8 — config must exist
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

	for (const soundName of sounds) {
		try {
			// Requirement 3.1 — fetch registry item
			const item = await fetchItem(config.registryUrl, soundName);
			const targetDir = join(projectRoot, config.soundDir);
			const writtenFiles: string[] = [];

			for (const file of item.files) {
				// Requirement 3.5 — skip dependency files that already exist
				if (isDependencyFile(file)) {
					const conflictPath = getConflictPath(file, targetDir, config);
					if (conflictPath) {
						writtenFiles.push(conflictPath);
						continue;
					}
				} else {
					// Requirement 3.9 — prompt on file conflicts for non-dependency files
					const conflictPath = getConflictPath(file, targetDir, config);
					if (conflictPath) {
						const overwrite = await confirm(
							`File '${conflictPath}' already exists. Overwrite? (y/N) `,
						);
						if (!overwrite) {
							console.log(`  Skipped ${conflictPath}`);
							continue;
						}
					}
				}

				// Requirement 3.2, 3.3 — write file with import rewriting
				const writtenPath = writeRegistryFile(
					file,
					targetDir,
					aliasMap,
					config,
				);
				if (writtenPath) {
					writtenFiles.push(writtenPath);
				}
			}

			// Requirement 3.6 — update installedSounds in config
			updatedConfig.installedSounds[soundName] = {
				files: writtenFiles,
				installedAt: new Date().toISOString(),
			};

			console.log(`✔ Added ${soundName}`);
		} catch (error) {
			// Requirement 3.7 — handle HTTP errors with sound name and status code
			const message = error instanceof Error ? error.message : String(error);
			console.error(`✘ ${message}`);
			process.exit(2);
		}
	}

	// Write updated config once after all sounds are processed
	ConfigManager.write(projectRoot, updatedConfig);
}
