import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
	type DiscoveredTheme,
	discoverThemesFromGitHub,
	discoverThemesFromLocal,
	ensureConfig,
	fetchThemeIndex,
	fetchThemeJson,
	generateModule,
	generateSoundModule,
	getInstalledThemes,
	getSoundsDir,
	getThemesDir,
	type InstalledTheme,
	isGitHubSource,
	isLocalSource,
	regenerateIndex,
	registerTheme,
	type ThemeIndexEntry,
	toIdentifier,
	validateTheme,
} from "./utils.js";

export interface AddOptions {
	list?: boolean;
	yes?: boolean;
	theme?: string;
	data?: string;
	tune?: string;
}

export function parseAddOptions(args: string[]): {
	source: string | undefined;
	options: AddOptions;
} {
	const options: AddOptions = {};
	let source: string | undefined;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "-y" || arg === "--yes") {
			options.yes = true;
		} else if (arg === "-l" || arg === "--list") {
			options.list = true;
		} else if (arg === "--theme") {
			options.theme = args[++i];
		} else if (arg === "--data") {
			options.data = args[++i];
		} else if (arg === "--tune") {
			options.tune = args[++i];
		} else if (arg && !arg.startsWith("-")) {
			source = arg;
		}
	}

	return { source, options };
}

export async function add(args: string[]) {
	const { source, options } = parseAddOptions(args);

	p.intro("@litlab/audx add");

	if (!source) {
		if (options.data || options.tune) {
			p.log.error("--data and --tune require a sound name.");
			process.exit(1);
		}
		await addFromRegistry(options);
		return;
	}

	if (options.data) {
		await addEncodedSound(source, options);
		return;
	}

	if (options.tune) {
		await addTunedSound(source, options);
		return;
	}

	if (isLocalSource(source)) {
		await addFromLocal(source, options);
		return;
	}

	if (source.startsWith("http") && source.endsWith(".json")) {
		await addFromUrl(source, options);
		return;
	}

	if (isGitHubSource(source)) {
		await addFromGitHub(source, options);
		return;
	}

	await addSoundFromRegistry(source, options);
}

type CompactCustomization = {
	pitch: number;
	duration: number;
	gain: number;
	pan: number;
	waveform: "original" | "sine" | "triangle" | "square" | "sawtooth";
};

const WAVEFORM_CODES: Record<string, CompactCustomization["waveform"]> = {
	o: "original",
	s: "sine",
	t: "triangle",
	q: "square",
	w: "sawtooth",
};

export function decodeSoundCustomization(value: string): CompactCustomization {
	const [version, pitch, duration, gain, pan, waveform, ...extra] =
		value.split(".");
	if (
		version !== "1" ||
		extra.length > 0 ||
		!pitch ||
		!duration ||
		!gain ||
		!pan ||
		!waveform
	) {
		throw new Error("unsupported tuning token");
	}

	const settings = {
		pitch: Number.parseInt(pitch, 36) - 12,
		duration: Number.parseInt(duration, 36) / 20,
		gain: Number.parseInt(gain, 36) / 20,
		pan: (Number.parseInt(pan, 36) - 20) / 20,
		waveform: WAVEFORM_CODES[waveform],
	};

	if (
		!Number.isInteger(settings.pitch) ||
		settings.pitch < -12 ||
		settings.pitch > 12 ||
		!Number.isFinite(settings.duration) ||
		settings.duration < 0.25 ||
		settings.duration > 3 ||
		!Number.isFinite(settings.gain) ||
		settings.gain < 0 ||
		settings.gain > 2 ||
		!Number.isFinite(settings.pan) ||
		settings.pan < -1 ||
		settings.pan > 1 ||
		!settings.waveform
	) {
		throw new Error("invalid tuning values");
	}

	return settings as CompactCustomization;
}

async function addTunedSound(soundName: string, options: AddOptions) {
	if (!options.theme) {
		p.log.error("--tune requires --theme <name>.");
		process.exit(1);
	}

	let settings: CompactCustomization;
	try {
		settings = decodeSoundCustomization(options.tune ?? "");
	} catch (err) {
		p.log.error(
			`Invalid tuning token: ${err instanceof Error ? err.message : String(err)}`,
		);
		process.exit(1);
	}

	const s = p.spinner();
	s.start(`Fetching "${soundName}" from ${options.theme}...`);

	try {
		const theme = await fetchThemeJson(options.theme);
		if (!validateTheme(theme)) throw new Error("invalid theme");
		const match = Object.entries(theme.sounds).find(
			([name]) => name.toLowerCase() === soundName.toLowerCase(),
		);
		if (!match) throw new Error(`sound not found in theme "${options.theme}"`);

		const definition = customizeDefinition(match[1], settings);
		if (!validateSoundDefinition(definition)) {
			throw new Error("theme returned an invalid sound definition");
		}

		s.stop(`Customized "${soundName}" from ${theme.name}`);
		await writeSound(soundName, definition, options);
		p.note(`  - ${soundName}`, "Installed customized sound");
		p.outro("Done!");
	} catch (err) {
		s.stop("Failed to install customized sound.");
		p.log.error(err instanceof Error ? err.message : String(err));
		process.exit(1);
	}
}

export function customizeDefinition(
	value: unknown,
	settings: CompactCustomization,
): unknown {
	if (!value || typeof value !== "object" || Array.isArray(value)) return value;
	const definition = value as Record<string, unknown>;

	if (Array.isArray(definition.layers)) {
		return {
			...definition,
			layers: definition.layers.map((layer) =>
				customizeDefinition(layer, settings),
			),
			effects: scaleEffects(definition.effects, settings.duration),
		};
	}

	const source = customizeSource(definition.source, settings);
	const envelope =
		definition.envelope &&
		typeof definition.envelope === "object" &&
		!Array.isArray(definition.envelope)
			? scaleEnvelope(
					definition.envelope as Record<string, unknown>,
					settings.duration,
				)
			: undefined;
	const gain = typeof definition.gain === "number" ? definition.gain : 0.5;
	const delay = typeof definition.delay === "number" ? definition.delay : 0;

	return {
		...definition,
		source,
		envelope,
		gain: clamp(gain * settings.gain, 0, 1),
		...("panner" in definition
			? {}
			: {
					pan: clamp(
						(typeof definition.pan === "number" ? definition.pan : 0) +
							settings.pan,
						-1,
						1,
					),
				}),
		delay: delay * settings.duration,
		effects: scaleEffects(definition.effects, settings.duration),
	};
}

function customizeSource(
	value: unknown,
	settings: CompactCustomization,
): unknown {
	if (!value || typeof value !== "object" || Array.isArray(value)) return value;
	const source = value as Record<string, unknown>;
	const frequencyScale = 2 ** (settings.pitch / 12);

	if (
		source.type === "sine" ||
		source.type === "triangle" ||
		source.type === "square" ||
		source.type === "sawtooth" ||
		source.type === "wavetable"
	) {
		return {
			...source,
			...(source.type === "wavetable" || settings.waveform === "original"
				? {}
				: { type: settings.waveform }),
			frequency: scaleFrequency(source.frequency, frequencyScale),
		};
	}

	if (source.type === "sample") {
		return {
			...source,
			detune:
				(typeof source.detune === "number" ? source.detune : 0) +
				settings.pitch * 100,
		};
	}

	return source;
}

function scaleFrequency(value: unknown, scale: number): unknown {
	if (typeof value === "number") return value * scale;
	if (!value || typeof value !== "object" || Array.isArray(value)) return value;
	const frequency = value as Record<string, unknown>;
	if (
		typeof frequency.start !== "number" ||
		typeof frequency.end !== "number"
	) {
		return value;
	}
	return { start: frequency.start * scale, end: frequency.end * scale };
}

function scaleEnvelope(
	envelope: Record<string, unknown>,
	duration: number,
): Record<string, unknown> {
	return {
		...envelope,
		attack:
			(typeof envelope.attack === "number" ? envelope.attack : 0) * duration,
		decay: (typeof envelope.decay === "number" ? envelope.decay : 0) * duration,
		release:
			(typeof envelope.release === "number" ? envelope.release : 0) * duration,
	};
}

function scaleEffects(value: unknown, duration: number): unknown {
	if (!Array.isArray(value)) return undefined;
	return value.map((effect) => {
		if (!effect || typeof effect !== "object" || Array.isArray(effect)) {
			return effect;
		}
		const item = effect as Record<string, unknown>;
		if (item.type === "delay") {
			return {
				...item,
				time: (typeof item.time === "number" ? item.time : 0.25) * duration,
			};
		}
		if (item.type === "reverb") {
			return {
				...item,
				decay: (typeof item.decay === "number" ? item.decay : 0.5) * duration,
				preDelay:
					(typeof item.preDelay === "number" ? item.preDelay : 0) * duration,
			};
		}
		return item;
	});
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

async function addEncodedSound(soundName: string, options: AddOptions) {
	let definition: unknown;
	try {
		definition = decodeSoundDefinition(options.data ?? "");
	} catch (err) {
		p.log.error(
			`Invalid customized sound data: ${err instanceof Error ? err.message : String(err)}`,
		);
		process.exit(1);
	}

	if (!validateSoundDefinition(definition)) {
		p.log.error("Invalid customized sound definition.");
		process.exit(1);
	}

	await writeSound(soundName, definition, options);
	p.note(`  - ${soundName}`, "Installed customized sound");
	p.outro("Done!");
}

export function decodeSoundDefinition(value: string): unknown {
	if (!value) throw new Error("missing value");
	return JSON.parse(Buffer.from(value, "base64url").toString("utf-8"));
}

export function validateSoundDefinition(value: unknown): boolean {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const definition = value as Record<string, unknown>;
	if (Array.isArray(definition.layers)) {
		return (
			definition.layers.length > 0 &&
			definition.layers.every(validateSoundDefinition)
		);
	}
	return (
		!!definition.source &&
		typeof definition.source === "object" &&
		!Array.isArray(definition.source)
	);
}

async function addFromLocal(source: string, options: AddOptions) {
	const s = p.spinner();
	s.start("Scanning local path for themes...");

	let discovered: DiscoveredTheme[];
	try {
		discovered = await discoverThemesFromLocal(source);
		s.stop(`Found ${discovered.length} theme(es)`);
	} catch (err) {
		s.stop("Failed to scan local path.");
		p.log.error(String(err));
		process.exit(1);
	}

	if (discovered.length === 0) {
		p.log.warn("No valid sound themes found at this path.");
		p.outro("Themes must be JSON files with a name and sounds object.");
		return;
	}

	if (options.list) {
		printThemeList(discovered);
		return;
	}

	const toInstall = selectThemes(discovered, options);
	if (!toInstall || toInstall.length === 0) return;

	const installed = await getInstalledThemes();
	const installedNames = new Set(installed.map((p: InstalledTheme) => p.name));

	const final = options.yes
		? toInstall
		: await confirmThemeOverwrites(toInstall, installedNames);
	if (!final || final.length === 0) return;

	const dl = p.spinner();
	dl.start(`Installing ${final.length} theme(es)...`);

	const results: string[] = [];
	for (const theme of final) {
		try {
			const raw = await readFile(theme.downloadUrl, "utf-8");
			const data = JSON.parse(raw) as Record<string, unknown>;
			if (!validateTheme(data)) {
				p.log.warn(`Skipping ${theme.name}: invalid theme format`);
				continue;
			}
			await writeTheme(theme.name, data);
			results.push(data.name);
		} catch (err) {
			p.log.warn(`Failed to install ${theme.name}: ${err}`);
		}
	}

	dl.stop(`Installed ${results.length} theme(es)`);
	p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed themes");
	p.outro("Done!");
}

async function addFromGitHub(source: string, options: AddOptions) {
	const s = p.spinner();
	s.start("Scanning repository for themes...");

	let discovered: DiscoveredTheme[];
	try {
		discovered = await discoverThemesFromGitHub(source);
		s.stop(`Found ${discovered.length} theme(es)`);
	} catch (err) {
		s.stop("Failed to scan repository.");
		p.log.error(String(err));
		process.exit(1);
	}

	if (discovered.length === 0) {
		p.log.warn("No valid sound themes found in this repository.");
		p.outro("Themes must be JSON files with a name and sounds object.");
		return;
	}

	if (options.list) {
		printThemeList(discovered);
		return;
	}

	const installed = await getInstalledThemes();
	const installedNames = new Set(installed.map((p: InstalledTheme) => p.name));

	const toInstall = await resolveThemeSelection(
		discovered,
		installedNames,
		options,
	);
	if (!toInstall || toInstall.length === 0) return;

	const dl = p.spinner();
	dl.start(`Installing ${toInstall.length} theme(es)...`);

	const results: string[] = [];
	for (const theme of toInstall) {
		try {
			const data = await fetchThemeJson(theme.downloadUrl);
			if (!validateTheme(data)) {
				p.log.warn(`Skipping ${theme.name}: invalid theme format`);
				continue;
			}
			await writeTheme(theme.name, data);
			registerTheme(theme.downloadUrl);
			results.push(data.name);
		} catch (err) {
			p.log.warn(`Failed to install ${theme.name}: ${err}`);
		}
	}

	dl.stop(`Installed ${results.length} theme(es)`);

	p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed themes");
	p.outro("Done!");
}

async function addFromUrl(url: string, options: AddOptions) {
	const s = p.spinner();
	s.start("Fetching theme...");

	try {
		const data = await fetchThemeJson(url);
		if (!validateTheme(data)) {
			s.stop("Invalid theme format.");
			p.log.error(
				"The fetched JSON is not a valid sound theme (missing name or sounds).",
			);
			process.exit(1);
		}
		s.stop(`Fetched "${data.name}"`);

		if (options.list) {
			console.log(
				`  ${pc.bold(data.name)}  ${pc.dim(`${Object.keys(data.sounds).length} sounds`)}`,
			);
			console.log();
			return;
		}

		await writeTheme(data.name, data);
		registerTheme(url);
	} catch (err) {
		s.stop("Failed to fetch theme.");
		p.log.error(String(err));
		process.exit(1);
	}
}

async function addFromRegistry(options: AddOptions) {
	const s = p.spinner();
	s.start("Fetching available themes...");

	let index: Awaited<ReturnType<typeof fetchThemeIndex>>;
	try {
		index = await fetchThemeIndex();
		s.stop(`Found ${index.length} themes`);
	} catch (err) {
		s.stop("Failed to fetch theme index.");
		p.log.error(String(err));
		process.exit(1);
	}

	if (options.list) {
		console.log();
		for (const entry of index) {
			console.log(`  ${pc.bold(entry.name)}  ${pc.dim(entry.description)}`);
		}
		console.log();
		return;
	}

	const installed = await getInstalledThemes();
	const installedNames = new Set(installed.map((p: InstalledTheme) => p.name));

	let names: string[];

	if (options.theme) {
		const themeName = options.theme;
		names = [themeName];
		const match = index.find(
			(e: ThemeIndexEntry) => e.name.toLowerCase() === themeName.toLowerCase(),
		);
		if (!match) {
			p.log.error(`Theme "${themeName}" not found in registry.`);
			process.exit(1);
		}
	} else if (options.yes) {
		names = index.map((e: ThemeIndexEntry) => e.name);
	} else {
		const selected = await p.multiselect({
			message: "Select themes to install",
			options: index.map((entry: ThemeIndexEntry) => ({
				value: entry.name,
				label: `${entry.name}${installedNames.has(entry.name) ? " (installed)" : ""}`,
				hint: entry.description,
			})),
		});

		if (p.isCancel(selected)) {
			p.cancel("Cancelled.");
			process.exit(0);
		}

		names = selected as string[];
		if (names.length === 0) {
			p.outro("No themes selected.");
			return;
		}
	}

	if (!options.yes) {
		const existing = names.filter((n) => installedNames.has(n));
		if (existing.length > 0) {
			const overwrite = await p.confirm({
				message: `${existing.length} theme(es) already installed. Overwrite?`,
			});
			if (p.isCancel(overwrite) || !overwrite) {
				p.cancel("Cancelled.");
				process.exit(0);
			}
		}
	}

	const dl = p.spinner();
	dl.start(`Downloading ${names.length} theme(es)...`);

	const results: string[] = [];
	for (const name of names) {
		try {
			const data = await fetchThemeJson(name);
			if (!validateTheme(data)) {
				p.log.warn(`Skipping ${name}: invalid theme format`);
				continue;
			}
			await writeTheme(name, data);
			results.push(data.name);
		} catch (err) {
			p.log.warn(`Failed to download ${name}: ${err}`);
		}
	}

	dl.stop(`Downloaded ${results.length} theme(es)`);

	p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed themes");
	p.outro("Done!");
}

async function addSoundFromRegistry(soundName: string, options: AddOptions) {
	if (options.list) {
		p.log.error("--list is only available when browsing themes.");
		process.exit(1);
	}

	const s = p.spinner();
	s.start(`Finding "${soundName}"...`);

	let index: Awaited<ReturnType<typeof fetchThemeIndex>>;
	try {
		index = await fetchThemeIndex();
	} catch (err) {
		s.stop("Failed to fetch theme index.");
		p.log.error(String(err));
		process.exit(1);
	}

	let found:
		| {
				theme: string;
				definition: unknown;
		  }
		| undefined;

	for (const entry of index) {
		try {
			const data = await fetchThemeJson(entry.name);
			if (!validateTheme(data)) continue;
			const match = Object.entries(data.sounds).find(
				([name]) => name.toLowerCase() === soundName.toLowerCase(),
			);
			if (match) {
				found = { theme: data.name, definition: match[1] };
				break;
			}
		} catch {}
	}

	if (!found) {
		s.stop(`Sound "${soundName}" not found.`);
		p.log.error("Run `@litlab/audx add` to browse available themes.");
		process.exit(1);
	}

	s.stop(`Found "${soundName}" in ${found.theme}`);
	await writeSound(soundName, found.definition, options);
	p.note(`  - ${soundName}`, "Installed sound");
	p.outro("Done!");
}

function printThemeList(themes: DiscoveredTheme[]) {
	console.log();
	for (const theme of themes) {
		const desc = theme.description ? `  ${pc.dim(theme.description)}` : "";
		console.log(
			`  ${pc.bold(theme.name)}  ${pc.dim(`${theme.soundCount} sounds`)}${desc}`,
		);
	}
	console.log();
}

function selectThemes(
	discovered: DiscoveredTheme[],
	options: AddOptions,
): DiscoveredTheme[] {
	if (options.theme) {
		const themeName = options.theme;
		const match = discovered.filter(
			(d) => d.name.toLowerCase() === themeName.toLowerCase(),
		);
		if (match.length === 0) {
			p.log.error(`Theme "${themeName}" not found.`);
			process.exit(1);
		}
		return match;
	}
	if (options.yes) return discovered;
	return discovered;
}

async function resolveThemeSelection(
	discovered: DiscoveredTheme[],
	installedNames: Set<string>,
	options: AddOptions,
): Promise<DiscoveredTheme[]> {
	if (options.theme) {
		const themeName = options.theme;
		const match = discovered.filter(
			(d) => d.name.toLowerCase() === themeName.toLowerCase(),
		);
		if (match.length === 0) {
			p.log.error(`Theme "${themeName}" not found.`);
			process.exit(1);
		}
		return match;
	}

	if (options.yes) return discovered;

	if (discovered.length === 1) return discovered;

	return await promptThemeSelection(discovered, installedNames);
}

async function promptThemeSelection(
	discovered: DiscoveredTheme[],
	installedNames: Set<string>,
) {
	const selected = await p.multiselect({
		message: "Select themes to install",
		options: discovered.map((theme) => ({
			value: theme.name,
			label: `${theme.name}${installedNames.has(theme.name) ? " (installed)" : ""}`,
			hint: theme.description
				? `${theme.soundCount} sounds — ${theme.description}`
				: `${theme.soundCount} sounds`,
		})),
	});

	if (p.isCancel(selected)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const names = new Set(selected as string[]);
	return discovered.filter((d) => names.has(d.name));
}

async function confirmThemeOverwrites(
	themes: DiscoveredTheme[],
	installedNames: Set<string>,
): Promise<DiscoveredTheme[]> {
	const existing = themes.filter((theme) => installedNames.has(theme.name));
	if (existing.length === 0) return themes;

	const overwrite = await p.confirm({
		message: `${existing.length} theme(es) already installed. Overwrite?`,
	});
	if (p.isCancel(overwrite) || !overwrite) {
		p.cancel("Cancelled.");
		process.exit(0);
	}
	return themes;
}

async function writeTheme(filename: string, data: Record<string, unknown>) {
	await ensureConfig("themes");
	const dir = getThemesDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const slug = filename
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	const moduleSource = generateModule(
		data as { name: string; sounds: Record<string, unknown> },
	);
	const target = join(dir, `${slug}.ts`);
	await writeFile(target, moduleSource, "utf-8");
	await regenerateIndex(dir);
}

async function writeSound(
	name: string,
	definition: unknown,
	options: AddOptions,
) {
	await ensureConfig("setup");
	const dir = getSoundsDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	const target = join(dir, `${slug}.ts`);

	if (existsSync(target) && !options.yes) {
		const overwrite = await p.confirm({
			message: `${slug}.ts already exists. Overwrite?`,
		});
		if (p.isCancel(overwrite) || !overwrite) {
			p.cancel("Cancelled.");
			process.exit(0);
		}
	}

	await writeFile(
		target,
		generateSoundModule(toIdentifier(name), definition),
		"utf-8",
	);
}
