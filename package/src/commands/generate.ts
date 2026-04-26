import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as ConfigManager from "../core/config.js";
import { buildSoundFilePath } from "../core/naming.js";
import { generateSound } from "../core/registry.js";
import { deriveKebabName, encodeAudioToDataUri } from "../core/utils.js";
import type { GenerateSoundParams } from "../types.js";

/**
 * Convert a kebab-case name to a camelCase variable name suffixed with "Audio".
 * e.g. "laser-blast" → "laserBlastAudio"
 */
function toCamelCaseAudioVar(kebab: string): string {
	const camel = kebab.replace(/-([a-z0-9])/g, (_, c: string) =>
		c.toUpperCase(),
	);
	return `${camel}Audio`;
}

/**
 * Build the Sound_Module TypeScript source for a generated sound.
 */
function buildSoundModule(
	name: string,
	dataUri: string,
	duration: number | undefined,
): string {
	const varName = toCamelCaseAudioVar(name);
	const dur = duration ?? 2;

	const lines = [
		`import type { AudioAsset } from "@/lib/audio-types";`,
		``,
		`export const ${varName}: AudioAsset = {`,
		`  name: "${name}",`,
		`  dataUri:`,
		`    "${dataUri}",`,
		`  duration: ${dur},`,
		`  format: "mp3",`,
		`  license: "MIT",`,
		`  author: "Generated",`,
		`};`,
		``,
	];

	return lines.join("\n");
}

/**
 * `audx generate "<prompt>"` command handler.
 *
 * Accepts a prompt string, optional --name and --duration flags.
 * Generates a sound via the API, writes a Sound_Module file, and
 * updates the config manifest.
 */
export async function generateCommand(
	prompt: string,
	options: { name?: string; duration?: string },
	projectRoot: string,
): Promise<void> {
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);

	// Requirement 13.2 — derive or use provided name
	const soundName = options.name ?? deriveKebabName(prompt);

	// Build API params
	const params: GenerateSoundParams = { text: prompt };

	// Optional duration
	if (options.duration !== undefined) {
		const dur = Number(options.duration);
		if (Number.isNaN(dur) || dur < 0.5 || dur > 22) {
			console.error("Duration must be a number between 0.5 and 22.");
			process.exit(1);
		}
		params.duration_seconds = dur;
	}

	try {
		console.log(`Generating sound "${soundName}" from prompt: "${prompt}"...`);
		const audioBuffer = await generateSound(config.registryUrl, params);

		// Encode as base64 data URI and create Sound_Module
		const dataUri = encodeAudioToDataUri(audioBuffer);
		const moduleContent = buildSoundModule(
			soundName,
			dataUri,
			params.duration_seconds,
		);

		// Requirement 13.1 — write to {soundDir}/{name}.ts using buildSoundFilePath
		const targetDir = join(projectRoot, config.soundDir);
		mkdirSync(targetDir, { recursive: true });
		const filePath = buildSoundFilePath(targetDir, soundName);
		writeFileSync(filePath, moduleContent, "utf-8");

		// Requirement 13.3 — update installedSounds as flat string array, avoid duplicates
		const updatedInstalledSounds = [...config.installedSounds];
		if (!updatedInstalledSounds.includes(soundName)) {
			updatedInstalledSounds.push(soundName);
		}
		ConfigManager.write(projectRoot, {
			...config,
			installedSounds: updatedInstalledSounds,
		});

		console.log(`✔ Generated and installed ${soundName}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`✘ ${message}`);
		process.exit(2);
	}
}
