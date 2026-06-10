import type {
	Effect,
	Layer,
	OscillatorSource,
	SoundDefinition,
} from "@litlab/audx";

export type Waveform = OscillatorSource["type"];

export type SoundCustomization = {
	pitch: number;
	duration: number;
	gain: number;
	pan: number;
	waveform: Waveform | "original";
};

export const DEFAULT_CUSTOMIZATION: SoundCustomization = {
	pitch: 0,
	duration: 1,
	gain: 1,
	pan: 0,
	waveform: "original",
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

function scaleEffect(effect: Effect, duration: number): Effect {
	if (effect.type === "delay") {
		return { ...effect, time: (effect.time ?? 0.25) * duration };
	}
	if (effect.type === "reverb") {
		return {
			...effect,
			decay: (effect.decay ?? 0.5) * duration,
			preDelay: (effect.preDelay ?? 0) * duration,
		};
	}
	return effect;
}

function customizeLayer(layer: Layer, settings: SoundCustomization): Layer {
	const frequencyScale = 2 ** (settings.pitch / 12);
	let source = layer.source;

	if (
		source.type === "sine" ||
		source.type === "triangle" ||
		source.type === "square" ||
		source.type === "sawtooth"
	) {
		const frequency =
			typeof source.frequency === "number"
				? source.frequency * frequencyScale
				: {
						start: source.frequency.start * frequencyScale,
						end: source.frequency.end * frequencyScale,
					};
		source = {
			...source,
			type: settings.waveform === "original" ? source.type : settings.waveform,
			frequency,
		};
	} else if (source.type === "wavetable") {
		source = {
			...source,
			frequency:
				typeof source.frequency === "number"
					? source.frequency * frequencyScale
					: {
							start: source.frequency.start * frequencyScale,
							end: source.frequency.end * frequencyScale,
						},
		};
	} else if (source.type === "sample") {
		source = {
			...source,
			detune: (source.detune ?? 0) + settings.pitch * 100,
		};
	}

	const envelope = layer.envelope
		? {
				...layer.envelope,
				attack: (layer.envelope.attack ?? 0) * settings.duration,
				decay: layer.envelope.decay * settings.duration,
				release: (layer.envelope.release ?? 0) * settings.duration,
			}
		: undefined;

	return {
		...layer,
		source,
		envelope,
		gain: clamp((layer.gain ?? 0.5) * settings.gain, 0, 1),
		...(layer.panner
			? {}
			: { pan: clamp((layer.pan ?? 0) + settings.pan, -1, 1) }),
		delay: (layer.delay ?? 0) * settings.duration,
		effects: layer.effects?.map((effect) =>
			scaleEffect(effect, settings.duration),
		),
	};
}

export function customizeSound(
	definition: SoundDefinition,
	settings: SoundCustomization,
): SoundDefinition {
	if ("layers" in definition) {
		return {
			...definition,
			layers: definition.layers.map((layer) => customizeLayer(layer, settings)),
			effects: definition.effects?.map((effect) =>
				scaleEffect(effect, settings.duration),
			),
		};
	}

	return customizeLayer(definition, settings);
}

export function encodeSoundDefinition(definition: SoundDefinition): string {
	const bytes = new TextEncoder().encode(JSON.stringify(definition));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

const WAVEFORM_CODES: Record<SoundCustomization["waveform"], string> = {
	original: "o",
	sine: "s",
	triangle: "t",
	square: "q",
	sawtooth: "w",
};

export function encodeSoundCustomization(settings: SoundCustomization): string {
	return [
		"1",
		Math.round(settings.pitch + 12).toString(36),
		Math.round(settings.duration * 20).toString(36),
		Math.round(settings.gain * 20).toString(36),
		Math.round(settings.pan * 20 + 20).toString(36),
		WAVEFORM_CODES[settings.waveform],
	].join(".");
}
