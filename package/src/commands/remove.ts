import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import * as ConfigManager from "../core/config.js";
import { buildSoundFilePath } from "../core/naming.js";

export async function removeCommand(
	sounds: string[],
	projectRoot: string,
): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);
	let updatedInstalledSounds = [...config.installedSounds];

	for (const soundName of sounds) {
		// Requirement 11.3 — error if sound is not installed
		if (!updatedInstalledSounds.includes(soundName)) {
			const list =
				updatedInstalledSounds.length > 0
					? updatedInstalledSounds.join(", ")
					: "(none)";
			console.error(
				`Sound '${soundName}' is not installed. Installed sounds: ${list}`,
			);
			process.exit(1);
		}

		// Requirement 11.1 — delete sound file
		const filePath = buildSoundFilePath(
			join(projectRoot, config.soundDir),
			soundName,
		);
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}

		// Requirement 11.2 — remove from installedSounds
		updatedInstalledSounds = updatedInstalledSounds.filter(
			(name) => name !== soundName,
		);

		// Requirement 11.4 — display success even if file was missing on disk
		console.log(`✔ Removed ${soundName}`);
	}

	// Write updated config once after all sounds are processed
	ConfigManager.write(projectRoot, {
		...config,
		installedSounds: updatedInstalledSounds,
	});
}
