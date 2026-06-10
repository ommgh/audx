import type { SoundDefinition } from "@litlab/audx";
import { describe, expect, it } from "vitest";
import {
	customizeSound,
	DEFAULT_CUSTOMIZATION,
	encodeSoundCustomization,
} from "./sound-customization";

describe("customizeSound", () => {
	it("customizes a single oscillator layer", () => {
		const definition: SoundDefinition = {
			source: {
				type: "sine",
				frequency: { start: 400, end: 800 },
			},
			envelope: { attack: 0.01, decay: 0.1, release: 0.02 },
			gain: 0.5,
		};

		expect(
			customizeSound(definition, {
				pitch: 12,
				duration: 2,
				gain: 1.5,
				pan: -0.25,
				waveform: "triangle",
			}),
		).toEqual({
			source: {
				type: "triangle",
				frequency: { start: 800, end: 1600 },
			},
			envelope: { attack: 0.02, decay: 0.2, release: 0.04 },
			gain: 0.75,
			pan: -0.25,
			delay: 0,
			effects: undefined,
		});
	});

	it("preserves layers while scaling their timing and effect tails", () => {
		const definition: SoundDefinition = {
			layers: [
				{
					source: { type: "noise", color: "pink" },
					envelope: { decay: 0.2 },
					delay: 0.1,
					gain: 0.8,
				},
			],
			effects: [{ type: "reverb", decay: 0.5, preDelay: 0.1 }],
		};

		const result = customizeSound(definition, {
			...DEFAULT_CUSTOMIZATION,
			duration: 0.5,
			gain: 2,
			pan: 2,
		});

		expect(result).toMatchObject({
			layers: [
				{
					envelope: { decay: 0.1 },
					delay: 0.05,
					gain: 1,
					pan: 1,
				},
			],
			effects: [{ type: "reverb", decay: 0.25, preDelay: 0.05 }],
		});
	});

	it("encodes exact slider steps into a short token", () => {
		expect(
			encodeSoundCustomization({
				pitch: -3,
				duration: 1.25,
				gain: 0.8,
				pan: -0.35,
				waveform: "triangle",
			}),
		).toBe("1.9.p.g.d.t");
	});
});
