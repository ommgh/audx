/**
 * Builds the first-party audx themes.
 *
 *   bun run sounds:build            # write .themes/*.json
 *   bun run sounds:build --check    # validate only
 *
 * Every theme must implement the full SOUND_CATALOG. Each sound is rendered
 * offline (via node-web-audio-api) and its gains are rescaled so that sounds
 * with the same role sit at the same perceived loudness across themes.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	SOUND_CATALOG,
	type SoundCategory,
} from "../../package/core/src/catalog";
import type {
	Layer,
	SoundDefinition,
	SoundPatch,
} from "../../package/core/src/types";
import { type ThemeDesign, toDefinition } from "./dsl";
import { mechanical } from "./themes/mechanical";
import { minimal } from "./themes/minimal";
import { playful } from "./themes/playful";
import { retro } from "./themes/retro";

export const THEMES: ThemeDesign[] = [minimal, playful, mechanical, retro];

const ROOT = resolve(import.meta.dirname, "../..");
const SR = 44100;

/** Short-term (50ms) loudness targets in dBFS by role. */
const CATEGORY_TARGET: Record<SoundCategory, number> = {
	input: -27,
	selection: -24,
	navigation: -25,
	editing: -24,
	feedback: -21,
	notification: -22,
	status: -24,
};
const SOUND_TARGET: Record<string, number> = {
	hover: -33,
	tick: -30,
	scroll: -30,
	type: -29,
	tap: -28,
	loading: -26,
	slide: -27,
};
const PEAK_CEILING = -3;

function targetFor(name: string, theme: ThemeDesign) {
	const entry = SOUND_CATALOG.find((s) => s.name === name);
	const base =
		SOUND_TARGET[name] ?? (entry ? CATEGORY_TARGET[entry.category] : -24);
	return base + (theme.loudness ?? 0);
}

function layersOf(def: SoundDefinition): Layer[] {
	return "layers" in def ? def.layers : [def];
}

function scale(def: SoundDefinition, k: number): SoundDefinition {
	const fix = (l: Layer): Layer => ({
		...l,
		gain: Math.round((l.gain ?? 0.5) * k * 10000) / 10000,
	});
	if ("layers" in def) return { ...def, layers: def.layers.map(fix) };
	return fix(def);
}

type Renderer = (def: SoundDefinition) => Promise<Float32Array>;

async function createRenderer(): Promise<Renderer | null> {
	try {
		const wa = await import("node-web-audio-api");
		const g = globalThis as Record<string, unknown>;
		g.OfflineAudioContext = wa.OfflineAudioContext;
		const { render } = await import("../../package/core/src/engine");
		return async (def) => {
			const ctx = new wa.OfflineAudioContext(2, SR * 1.6, SR);
			render(
				ctx as unknown as BaseAudioContext,
				def,
				undefined,
				0,
				ctx.destination as unknown as AudioNode,
			);
			const buf = await ctx.startRendering();
			const l = buf.getChannelData(0);
			const r = buf.getChannelData(1);
			const mono = new Float32Array(l.length);
			for (let i = 0; i < l.length; i++) mono[i] = (l[i] + r[i]) / 2;
			return mono;
		};
	} catch (err) {
		console.warn(
			`! node-web-audio-api unavailable, skipping loudness normalization (${String(err)})`,
		);
		return null;
	}
}

function measure(mono: Float32Array) {
	let peak = 0;
	for (const s of mono) peak = Math.max(peak, Math.abs(s));
	let short = 0;
	const W = 2205;
	for (let i = 0; i + W <= mono.length; i += 220) {
		let s2 = 0;
		for (let k = 0; k < W; k++) s2 += mono[i + k] ** 2;
		short = Math.max(short, Math.sqrt(s2 / W));
	}
	return {
		peakDb: 20 * Math.log10(peak + 1e-9),
		shortDb: 20 * Math.log10(short + 1e-9),
	};
}

async function normalize(
	def: SoundDefinition,
	target: number,
	renderer: Renderer,
): Promise<SoundDefinition> {
	let out = def;
	// Iterate: bitcrushers and other non-linear stages don't scale linearly.
	for (let pass = 0; pass < 3; pass++) {
		const m = measure(await renderer(out));
		let deltaDb = target - m.shortDb;
		if (m.peakDb + deltaDb > PEAK_CEILING) deltaDb = PEAK_CEILING - m.peakDb;
		if (Math.abs(deltaDb) < 0.3) break;
		out = scale(out, 10 ** (deltaDb / 20));
	}
	return out;
}

function validate(theme: ThemeDesign): string[] {
	const problems: string[] = [];
	for (const { name } of SOUND_CATALOG) {
		if (!theme.sounds[name]) problems.push(`${theme.name}: missing "${name}"`);
	}
	for (const [name, raw] of Object.entries(theme.sounds)) {
		for (const l of layersOf(toDefinition(raw))) {
			const e = l.envelope;
			const total =
				(l.delay ?? 0) +
				(e ? (e.attack ?? 0) + e.decay + (e.release ?? 0) : 0.5);
			if (total > 1.2) problems.push(`${theme.name}/${name}: longer than 1.2s`);
		}
	}
	return problems;
}

/** Deterministic RNG so noise renders (and therefore gains) are reproducible. */
function seedRandom(seed: number) {
	let t = seed >>> 0;
	Math.random = () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

async function main() {
	const checkOnly = process.argv.includes("--check");
	const problems = THEMES.flatMap(validate);
	if (problems.length) {
		console.error(problems.join("\n"));
		process.exit(1);
	}
	if (checkOnly) {
		console.log(
			`✓ ${THEMES.length} themes cover all ${SOUND_CATALOG.length} sounds`,
		);
		return;
	}

	const renderer = await createRenderer();
	for (const theme of THEMES) {
		const sounds: Record<string, SoundDefinition> = {};
		// catalog order first so generated files read top-to-bottom by category
		const names = [
			...SOUND_CATALOG.map((s) => s.name),
			...Object.keys(theme.sounds).filter(
				(k) => !SOUND_CATALOG.some((s) => s.name === k),
			),
		];
		for (const name of names) {
			const def = toDefinition(theme.sounds[name]);
			seedRandom(0xa0d1);
			sounds[name] = renderer
				? await normalize(def, targetFor(name, theme), renderer)
				: def;
		}
		const patch: SoundPatch = {
			$schema: "https://audx.site/schemas/theme.schema.json",
			name: theme.name,
			author: "Om Mishra",
			version: "2.0.0",
			description: theme.description,
			tags: theme.tags,
			sounds,
		};
		const file = resolve(ROOT, ".themes", `${theme.name}.json`);
		writeFileSync(file, `${JSON.stringify(patch, null, "\t")}\n`);
		console.log(
			`✓ ${theme.name.padEnd(11)} ${names.length} sounds → .themes/${theme.name}.json`,
		);
	}
}

main();
