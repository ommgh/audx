/**
 * A tiny DSL for designing audx sounds by hand.
 *
 * Gains here are *relative* between layers — the build step renders every
 * sound offline and rescales it to a loudness target for its role, so a
 * designer only needs to think about balance, not absolute volume.
 */
import type {
	BiquadFilter,
	Effect,
	FilterEnvelope,
	Layer,
	LFO,
	MultiLayerSound,
	SoundDefinition,
} from "../../package/core/src/types";

export type Freq = number | { start: number; end: number };

/** [attack, decay, sustain?, release?] in seconds, or just a decay. */
export type Env = number | [number, number, number?, number?];

type Opts = {
	g?: number;
	at?: number;
	fm?: { ratio: number; depth: number };
	detune?: number;
	filter?: BiquadFilter | BiquadFilter[];
	lfo?: LFO | LFO[];
	fx?: Effect[];
	pan?: number;
};

const NOTE_INDEX: Record<string, number> = {
	C: -9,
	"C#": -8,
	Db: -8,
	D: -7,
	"D#": -6,
	Eb: -6,
	E: -5,
	F: -4,
	"F#": -3,
	Gb: -3,
	G: -2,
	"G#": -1,
	Ab: -1,
	A: 0,
	"A#": 1,
	Bb: 1,
	B: 2,
};

/** Note name to Hz, e.g. `n("A4") === 440`. */
export function n(note: string): number {
	const m = note.match(/^([A-G][#b]?)(-?\d)$/);
	if (!m) throw new Error(`bad note ${note}`);
	const semis = NOTE_INDEX[m[1]] + (Number(m[2]) - 4) * 12;
	return round(440 * 2 ** (semis / 12));
}

export const sweep = (start: number, end: number): Freq => ({ start, end });

function round(v: number, p = 2) {
	const k = 10 ** p;
	return Math.round(v * k) / k;
}

function env(e: Env) {
	if (typeof e === "number") return { attack: 0, decay: e };
	const [attack, decay, sustain, release] = e;
	return {
		attack,
		decay,
		...(sustain !== undefined ? { sustain } : {}),
		...(release !== undefined ? { release } : {}),
	};
}

function layer(source: Layer["source"], e: Env, o: Opts = {}): Layer {
	const l: Layer = { source, envelope: env(e), gain: o.g ?? 1 };
	if (o.filter) l.filter = o.filter;
	if (o.lfo) l.lfo = o.lfo;
	if (o.fx) l.effects = o.fx;
	if (o.pan) l.pan = o.pan;
	if (o.at) l.delay = round(o.at, 4);
	return l;
}

function oscOf(type: "sine" | "triangle" | "square" | "sawtooth") {
	return (freq: Freq, e: Env, o: Opts = {}) =>
		layer(
			{
				type,
				frequency: freq,
				...(o.detune ? { detune: o.detune } : {}),
				...(o.fm ? { fm: o.fm } : {}),
			},
			e,
			o,
		);
}

export const sine = oscOf("sine");
export const tri = oscOf("triangle");
export const sq = oscOf("square");
export const saw = oscOf("sawtooth");

export function noise(
	color: "white" | "pink" | "brown",
	e: Env,
	o: Opts = {},
): Layer {
	return layer({ type: "noise", color }, e, o);
}

function biquad(type: BiquadFilter["type"]) {
	return (
		frequency: number,
		resonance?: number,
		envelope?: FilterEnvelope,
	): BiquadFilter => ({
		type,
		frequency,
		...(resonance !== undefined ? { resonance } : {}),
		...(envelope ? { envelope } : {}),
	});
}

export const lp = biquad("lowpass");
export const hp = biquad("highpass");
export const bp = biquad("bandpass");

/** Filter sweep helper: from `from` Hz up/down to `to` Hz over `time`. */
export function fsweep(
	type: "lowpass" | "highpass" | "bandpass",
	from: number,
	to: number,
	time: number,
	resonance = 1,
): BiquadFilter {
	// The engine ramps base -> peak during `attack`, then decays back to base.
	// Rising sweeps use the attack phase; falling sweeps jump to the peak and
	// let the decay phase carry them down.
	if (to >= from) {
		return {
			type,
			frequency: from,
			resonance,
			envelope: { attack: time, peak: to, decay: 0.08 },
		};
	}
	return {
		type,
		frequency: to,
		resonance,
		envelope: { attack: 0, peak: from, decay: time },
	};
}

export const vibrato = (rate: number, depth: number): LFO => ({
	type: "sine",
	frequency: rate,
	depth,
	target: "frequency",
});

export const tremolo = (rate: number, depth: number): LFO => ({
	type: "sine",
	frequency: rate,
	depth,
	target: "gain",
});

export const room = (mix = 0.15, decay = 0.6): Effect => ({
	type: "reverb",
	decay,
	damping: 0.5,
	mix,
});

export const echo = (time = 0.09, feedback = 0.3, mix = 0.25): Effect => ({
	type: "delay",
	time,
	feedback,
	mix,
});

export const crush = (bits = 6, mix = 1): Effect => ({
	type: "bitcrusher",
	bits,
	mix,
});

/** Shift a layer (or a group of layers) later in time. */
export function at<T extends Layer | Layer[]>(delay: number, l: T): T {
	if (Array.isArray(l)) return l.map((x) => at(delay, x)) as T;
	return { ...l, delay: round((l.delay ?? 0) + delay, 4) };
}

/** Plays `notes` one after another, `stagger` seconds apart. */
export function arp(
	notes: number[],
	stagger: number,
	make: (f: number, i: number) => Layer | Layer[],
): Layer[] {
	return notes.flatMap((f, i) => {
		const made = make(f, i);
		return at(i * stagger, Array.isArray(made) ? made : [made]);
	});
}

export function stack(
	...items: (Layer | Layer[] | { effects: Effect[] })[]
): SoundDefinition {
	const layers: Layer[] = [];
	let effects: Effect[] | undefined;
	for (const it of items) {
		if (Array.isArray(it)) layers.push(...it);
		else if ("source" in it) layers.push(it);
		else effects = it.effects;
	}
	if (layers.length === 1 && !effects) return layers[0];
	const out: MultiLayerSound = { layers };
	if (effects) out.effects = effects;
	return out;
}

export const fx = (...effects: Effect[]) => ({ effects });

export type ThemeDesign = {
	name: string;
	description: string;
	tags: string[];
	/** Overall loudness offset in dB relative to the shared role targets. */
	loudness?: number;
	sounds: Record<string, SoundDefinition | Layer[]>;
};

export function toDefinition(d: SoundDefinition | Layer[]): SoundDefinition {
	return Array.isArray(d) ? { layers: d } : d;
}
