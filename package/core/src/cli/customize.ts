/**
 * Decoding for the compact customization tokens produced by the sound editor
 * on audx.site (`audx add click --theme minimal --tune 1.c.k.k.k.o`).
 */

export type CompactCustomization = {
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
