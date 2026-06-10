import { describe, expect, it } from "vitest";
import {
	customizeDefinition,
	decodeSoundCustomization,
	decodeSoundDefinition,
	parseAddOptions,
	validateSoundDefinition,
} from "../src/commands/add.js";
import { parseRemoveOptions } from "../src/commands/remove.js";

describe("parseAddOptions", () => {
	it("parses source with no flags", () => {
		const result = parseAddOptions(["ommgh/audio"]);
		expect(result.source).toBe("ommgh/audio");
		expect(result.options).toEqual({});
	});

	it("parses --yes flag", () => {
		const result = parseAddOptions(["ommgh/audio", "--yes"]);
		expect(result.source).toBe("ommgh/audio");
		expect(result.options.yes).toBe(true);
	});

	it("parses -y shorthand", () => {
		const result = parseAddOptions(["-y", "ommgh/audio"]);
		expect(result.source).toBe("ommgh/audio");
		expect(result.options.yes).toBe(true);
	});

	it("parses --list flag", () => {
		const result = parseAddOptions(["ommgh/audio", "--list"]);
		expect(result.options.list).toBe(true);
	});

	it("parses -l shorthand", () => {
		const result = parseAddOptions(["-l", "ommgh/audio"]);
		expect(result.options.list).toBe(true);
	});

	it("parses --theme flag with value", () => {
		const result = parseAddOptions(["--theme", "core"]);
		expect(result.options.theme).toBe("core");
		expect(result.source).toBeUndefined();
	});

	it("parses all flags together", () => {
		const result = parseAddOptions([
			"ommgh/audio",
			"-y",
			"--theme",
			"core",
			"-l",
		]);
		expect(result.source).toBe("ommgh/audio");
		expect(result.options.yes).toBe(true);
		expect(result.options.list).toBe(true);
		expect(result.options.theme).toBe("core");
	});

	it("returns undefined source when no positional args", () => {
		const result = parseAddOptions(["--yes", "--list"]);
		expect(result.source).toBeUndefined();
	});

	it("handles empty args", () => {
		const result = parseAddOptions([]);
		expect(result.source).toBeUndefined();
		expect(result.options).toEqual({});
	});

	it("parses an encoded customized sound", () => {
		const result = parseAddOptions(["click", "--data", "encoded", "-y"]);
		expect(result.source).toBe("click");
		expect(result.options).toEqual({ data: "encoded", yes: true });
	});

	it("parses a compact tuning token", () => {
		const result = parseAddOptions([
			"click",
			"--theme",
			"minimal",
			"--tune",
			"1.9.p.g.d.t",
			"-y",
		]);
		expect(result.source).toBe("click");
		expect(result.options).toEqual({
			theme: "minimal",
			tune: "1.9.p.g.d.t",
			yes: true,
		});
	});
});

describe("custom sound data", () => {
	it("decodes base64url JSON", () => {
		const definition = {
			source: { type: "sine", frequency: 440 },
			envelope: { decay: 0.1 },
		};
		const encoded = Buffer.from(JSON.stringify(definition)).toString(
			"base64url",
		);
		expect(decodeSoundDefinition(encoded)).toEqual(definition);
	});

	it("decodes compact tuning settings without losing slider values", () => {
		expect(decodeSoundCustomization("1.9.p.g.d.t")).toEqual({
			pitch: -3,
			duration: 1.25,
			gain: 0.8,
			pan: -0.35,
			waveform: "triangle",
		});
	});

	it("rejects invalid tuning settings", () => {
		expect(() => decodeSoundCustomization("2.9.p.g.d.t")).toThrow();
		expect(() => decodeSoundCustomization("1.zz.p.g.d.t")).toThrow();
	});

	it("reconstructs the customized definition from the compact settings", () => {
		const settings = decodeSoundCustomization("1.o.a.u.k.q");
		const definition = {
			layers: [
				{
					source: {
						type: "sine",
						frequency: { start: 400, end: 800 },
					},
					envelope: { attack: 0.01, decay: 0.1, release: 0.02 },
					delay: 0.1,
					gain: 0.5,
				},
			],
			effects: [{ type: "delay", time: 0.2 }],
		};

		expect(customizeDefinition(definition, settings)).toEqual({
			layers: [
				{
					source: {
						type: "square",
						frequency: { start: 800, end: 1600 },
					},
					envelope: { attack: 0.005, decay: 0.05, release: 0.01 },
					delay: 0.05,
					gain: 0.75,
					pan: 0,
					effects: undefined,
				},
			],
			effects: [{ type: "delay", time: 0.1 }],
		});
	});

	it("validates single and layered definitions", () => {
		const layer = { source: { type: "noise" } };
		expect(validateSoundDefinition(layer)).toBe(true);
		expect(validateSoundDefinition({ layers: [layer, layer] })).toBe(true);
		expect(validateSoundDefinition({ layers: [] })).toBe(false);
		expect(validateSoundDefinition({ source: null })).toBe(false);
	});
});

describe("parseRemoveOptions", () => {
	it("parses theme names as positional args", () => {
		const result = parseRemoveOptions(["core", "minimal"]);
		expect(result.themes).toEqual(["core", "minimal"]);
		expect(result.options).toEqual({});
	});

	it("parses --yes flag", () => {
		const result = parseRemoveOptions(["core", "--yes"]);
		expect(result.themes).toEqual(["core"]);
		expect(result.options.yes).toBe(true);
	});

	it("parses -y shorthand", () => {
		const result = parseRemoveOptions(["-y", "core"]);
		expect(result.themes).toEqual(["core"]);
		expect(result.options.yes).toBe(true);
	});

	it("handles empty args", () => {
		const result = parseRemoveOptions([]);
		expect(result.themes).toEqual([]);
		expect(result.options).toEqual({});
	});
});
