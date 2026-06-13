// Minimal — curated by @litlab/audx
// theme: Minimal
import type { SoundDefinition, SoundPatch } from "@litlab/audx";

export const click: SoundDefinition = {
	source: {
		type: "noise",
		color: "white",
	},
	filter: {
		type: "bandpass",
		frequency: 2400,
		resonance: 8,
	},
	envelope: {
		attack: 0,
		decay: 0.018,
		release: 0.006,
	},
	gain: 0.055,
};

export const hover: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 1500,
			end: 1650,
		},
	},
	envelope: {
		attack: 0.002,
		decay: 0.018,
		release: 0.006,
	},
	gain: 0.025,
};

export const focus: SoundDefinition = {
	source: {
		type: "sine",
		frequency: {
			start: 880,
			end: 1320,
		},
	},
	envelope: {
		attack: 0.004,
		decay: 0.04,
		release: 0.012,
	},
	gain: 0.04,
};

export const blur: SoundDefinition = {
	source: {
		type: "sine",
		frequency: {
			start: 1050,
			end: 700,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.035,
		release: 0.01,
	},
	gain: 0.03,
};

export const tap: SoundDefinition = {
	source: {
		type: "square",
		frequency: {
			start: 1800,
			end: 900,
		},
	},
	filter: {
		type: "lowpass",
		frequency: 2600,
	},
	envelope: {
		attack: 0,
		decay: 0.025,
		release: 0.006,
	},
	gain: 0.045,
};

export const press: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 520,
			end: 420,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.045,
		release: 0.014,
	},
	gain: 0.055,
};

export const release: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 640,
			end: 980,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.035,
		release: 0.01,
	},
	gain: 0.04,
};

export const toggle: SoundDefinition = {
	layers: [
		{
			source: {
				type: "triangle",
				frequency: {
					start: 420,
					end: 760,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.055,
				release: 0.012,
			},
			gain: 0.055,
		},
		{
			source: {
				type: "sine",
				frequency: {
					start: 760,
					end: 560,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.045,
				release: 0.012,
			},
			delay: 0.045,
			gain: 0.038,
		},
	],
};

export const enable: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: {
					start: 520,
					end: 784,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.06,
				release: 0.018,
			},
			gain: 0.055,
		},
		{
			source: {
				type: "sine",
				frequency: {
					start: 784,
					end: 1175,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.07,
				release: 0.02,
			},
			delay: 0.05,
			gain: 0.045,
		},
	],
};

export const disable: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: {
					start: 880,
					end: 587,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.055,
				release: 0.016,
			},
			gain: 0.05,
		},
		{
			source: {
				type: "sine",
				frequency: {
					start: 587,
					end: 392,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.065,
				release: 0.02,
			},
			delay: 0.045,
			gain: 0.04,
		},
	],
};

export const open: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 420,
			end: 1100,
		},
	},
	filter: {
		type: "highpass",
		frequency: 320,
	},
	envelope: {
		attack: 0.003,
		decay: 0.085,
		release: 0.024,
	},
	gain: 0.052,
};

export const close: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 1100,
			end: 360,
		},
	},
	filter: {
		type: "lowpass",
		frequency: 1400,
	},
	envelope: {
		attack: 0.002,
		decay: 0.075,
		release: 0.022,
	},
	gain: 0.047,
};

export const select: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: 880,
			},
			envelope: {
				attack: 0,
				decay: 0.032,
				release: 0.008,
			},
			gain: 0.045,
		},
		{
			source: {
				type: "sine",
				frequency: 1320,
			},
			envelope: {
				attack: 0,
				decay: 0.034,
				release: 0.009,
			},
			delay: 0.028,
			gain: 0.032,
		},
	],
};

export const deselect: SoundDefinition = {
	source: {
		type: "sine",
		frequency: {
			start: 820,
			end: 520,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.045,
		release: 0.012,
	},
	gain: 0.042,
};

export const tab: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 760,
			end: 1020,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.03,
		release: 0.008,
	},
	gain: 0.045,
};

export const copy: SoundDefinition = {
	layers: [
		{
			source: {
				type: "square",
				frequency: 1320,
			},
			filter: {
				type: "lowpass",
				frequency: 2400,
			},
			envelope: {
				attack: 0,
				decay: 0.02,
				release: 0.005,
			},
			gain: 0.035,
		},
		{
			source: {
				type: "square",
				frequency: 1760,
			},
			filter: {
				type: "lowpass",
				frequency: 2600,
			},
			envelope: {
				attack: 0,
				decay: 0.02,
				release: 0.005,
			},
			delay: 0.04,
			gain: 0.028,
		},
	],
};

export const paste: SoundDefinition = {
	layers: [
		{
			source: {
				type: "square",
				frequency: 1760,
			},
			filter: {
				type: "lowpass",
				frequency: 2600,
			},
			envelope: {
				attack: 0,
				decay: 0.02,
				release: 0.005,
			},
			gain: 0.026,
		},
		{
			source: {
				type: "square",
				frequency: 1046,
			},
			filter: {
				type: "lowpass",
				frequency: 2200,
			},
			envelope: {
				attack: 0,
				decay: 0.035,
				release: 0.01,
			},
			delay: 0.035,
			gain: 0.035,
		},
	],
};

export const success: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: 659,
			},
			envelope: {
				attack: 0,
				decay: 0.07,
				release: 0.018,
			},
			gain: 0.05,
		},
		{
			source: {
				type: "sine",
				frequency: 988,
			},
			envelope: {
				attack: 0,
				decay: 0.085,
				release: 0.024,
			},
			delay: 0.065,
			gain: 0.045,
		},
	],
};

export const complete: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: 523,
			},
			envelope: {
				attack: 0,
				decay: 0.06,
				release: 0.018,
			},
			gain: 0.04,
		},
		{
			source: {
				type: "sine",
				frequency: 659,
			},
			envelope: {
				attack: 0,
				decay: 0.06,
				release: 0.018,
			},
			delay: 0.055,
			gain: 0.038,
		},
		{
			source: {
				type: "sine",
				frequency: 1046,
			},
			envelope: {
				attack: 0,
				decay: 0.1,
				release: 0.03,
			},
			delay: 0.11,
			gain: 0.036,
		},
	],
};

export const error: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sawtooth",
				frequency: {
					start: 260,
					end: 120,
				},
				fm: {
					ratio: 1.5,
					depth: 40,
				},
			},
			filter: {
				type: "lowpass",
				frequency: 900,
				resonance: 1.4,
			},
			envelope: {
				attack: 0,
				decay: 0.12,
				release: 0.035,
			},
			gain: 0.06,
		},
		{
			source: {
				type: "noise",
				color: "brown",
			},
			filter: {
				type: "lowpass",
				frequency: 380,
			},
			envelope: {
				attack: 0,
				decay: 0.09,
				release: 0.025,
			},
			gain: 0.025,
		},
	],
};

export const warning: SoundDefinition = {
	layers: [
		{
			source: {
				type: "triangle",
				frequency: 740,
			},
			envelope: {
				attack: 0,
				decay: 0.07,
				sustain: 0.05,
				release: 0.035,
			},
			gain: 0.045,
		},
		{
			source: {
				type: "triangle",
				frequency: 620,
			},
			envelope: {
				attack: 0,
				decay: 0.07,
				sustain: 0.04,
				release: 0.03,
			},
			delay: 0.085,
			gain: 0.04,
		},
	],
};

export const info: SoundDefinition = {
	source: {
		type: "sine",
		frequency: {
			start: 784,
			end: 1175,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.075,
		release: 0.02,
	},
	gain: 0.045,
};

export const notify: SoundDefinition = {
	layers: [
		{
			source: {
				type: "sine",
				frequency: 988,
			},
			envelope: {
				attack: 0,
				decay: 0.09,
				release: 0.025,
			},
			gain: 0.048,
		},
		{
			source: {
				type: "sine",
				frequency: 1318,
			},
			envelope: {
				attack: 0,
				decay: 0.08,
				release: 0.022,
			},
			delay: 0.09,
			gain: 0.034,
		},
	],
};

export const loading: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 440,
			end: 660,
		},
	},
	lfo: {
		type: "sine",
		frequency: 7,
		depth: 35,
		target: "frequency",
	},
	envelope: {
		attack: 0.01,
		decay: 0.16,
		sustain: 0.08,
		release: 0.05,
	},
	gain: 0.035,
};

export const scroll: SoundDefinition = {
	source: {
		type: "noise",
		color: "pink",
	},
	filter: {
		type: "highpass",
		frequency: 2200,
	},
	envelope: {
		attack: 0,
		decay: 0.025,
		release: 0.006,
	},
	gain: 0.018,
};

export const slide: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 360,
			end: 920,
		},
	},
	envelope: {
		attack: 0.004,
		decay: 0.09,
		release: 0.022,
	},
	gain: 0.04,
};

export const drag: SoundDefinition = {
	source: {
		type: "noise",
		color: "pink",
	},
	filter: {
		type: "bandpass",
		frequency: 720,
		resonance: 2,
	},
	envelope: {
		attack: 0.01,
		decay: 0.12,
		sustain: 0.02,
		release: 0.04,
	},
	gain: 0.024,
};

export const drop: SoundDefinition = {
	layers: [
		{
			source: {
				type: "triangle",
				frequency: {
					start: 500,
					end: 170,
				},
			},
			envelope: {
				attack: 0,
				decay: 0.09,
				release: 0.026,
			},
			gain: 0.045,
		},
		{
			source: {
				type: "noise",
				color: "brown",
			},
			filter: {
				type: "lowpass",
				frequency: 500,
			},
			envelope: {
				attack: 0,
				decay: 0.055,
				release: 0.016,
			},
			delay: 0.02,
			gain: 0.018,
		},
	],
};

export const clear: SoundDefinition = {
	source: {
		type: "noise",
		color: "white",
	},
	filter: {
		type: "highpass",
		frequency: 1500,
		resonance: 0.8,
	},
	envelope: {
		attack: 0,
		decay: 0.08,
		release: 0.018,
	},
	gain: 0.035,
};

export const _delete: SoundDefinition = {
	source: {
		type: "sawtooth",
		frequency: {
			start: 420,
			end: 90,
		},
	},
	filter: {
		type: "lowpass",
		frequency: 700,
	},
	envelope: {
		attack: 0,
		decay: 0.11,
		release: 0.03,
	},
	gain: 0.05,
};

export const deny: SoundDefinition = {
	layers: [
		{
			source: {
				type: "square",
				frequency: 240,
			},
			filter: {
				type: "lowpass",
				frequency: 900,
			},
			envelope: {
				attack: 0,
				decay: 0.08,
				release: 0.02,
			},
			gain: 0.048,
		},
		{
			source: {
				type: "square",
				frequency: 220,
			},
			filter: {
				type: "lowpass",
				frequency: 900,
			},
			envelope: {
				attack: 0,
				decay: 0.08,
				release: 0.02,
			},
			delay: 0.08,
			gain: 0.038,
		},
	],
};

export const back: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 880,
			end: 440,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.065,
		release: 0.018,
	},
	gain: 0.045,
};

export const forward: SoundDefinition = {
	source: {
		type: "triangle",
		frequency: {
			start: 440,
			end: 880,
		},
	},
	envelope: {
		attack: 0,
		decay: 0.065,
		release: 0.018,
	},
	gain: 0.045,
};

export const _patch: SoundPatch = {
	name: "Minimal",
	author: "Om Mishra",
	version: "1.1.0",
	description:
		"Tactile, restrained UI cues with distinct pitches, envelopes, and noise textures for each interaction.",
	tags: ["ui", "minimal", "subtle", "tactile"],
	sounds: {
		click: click,
		hover: hover,
		focus: focus,
		blur: blur,
		tap: tap,
		press: press,
		release: release,
		toggle: toggle,
		enable: enable,
		disable: disable,
		open: open,
		close: close,
		select: select,
		deselect: deselect,
		tab: tab,
		copy: copy,
		paste: paste,
		success: success,
		complete: complete,
		error: error,
		warning: warning,
		info: info,
		notify: notify,
		loading: loading,
		scroll: scroll,
		slide: slide,
		drag: drag,
		drop: drop,
		clear: clear,
		delete: _delete,
		deny: deny,
		back: back,
		forward: forward,
	},
};

export default _patch;
