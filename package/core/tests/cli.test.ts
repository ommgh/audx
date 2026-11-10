import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SOUND_CATALOG } from "../src/catalog.js";
import { CliError, parseArgs } from "../src/cli/args.js";
import {
	renderIndex,
	renderSoundModule,
	toFileName,
	toIdentifier,
	writeIndex,
	writeSoundFile,
} from "../src/cli/codegen.js";
import {
	customizeDefinition,
	decodeSoundCustomization,
	decodeSoundDefinition,
	validateSoundDefinition,
} from "../src/cli/customize.js";
import {
	defaultDir,
	detectPackageManager,
	importPathFor,
	listInstalled,
	loadProject,
	parseJsonc,
	readConfig,
	writeConfig,
} from "../src/cli/project.js";
import { closest, isThemePatch, sourceKind } from "../src/cli/registry.js";

describe("parseArgs", () => {
	it("splits positionals and boolean flags", () => {
		expect(parseArgs(["click", "success", "-y", "--overwrite"])).toEqual({
			_: ["click", "success"],
			flags: { yes: true, overwrite: true },
		});
	});

	it("reads value flags in every form", () => {
		expect(parseArgs(["--theme", "retro"]).flags.theme).toBe("retro");
		expect(parseArgs(["--theme=retro"]).flags.theme).toBe("retro");
		expect(parseArgs(["-t", "retro"]).flags.theme).toBe("retro");
		expect(parseArgs(["-tretro"]).flags.theme).toBe("retro");
	});

	it("expands combined short flags", () => {
		expect(parseArgs(["-yo"]).flags).toEqual({ yes: true, overwrite: true });
	});

	it("throws a CliError when a value is missing", () => {
		expect(() => parseArgs(["--theme"])).toThrow(CliError);
		expect(() => parseArgs(["--theme", "-y"])).toThrow(CliError);
	});

	it("treats everything after -- as positional", () => {
		expect(parseArgs(["--", "-weird"])._).toEqual(["-weird"]);
	});
});

describe("codegen", () => {
	it("makes safe identifiers", () => {
		expect(toIdentifier("click")).toBe("click");
		expect(toIdentifier("modal-open")).toBe("modalOpen");
		expect(toIdentifier("delete")).toBe("deleteSound");
		expect(toIdentifier("3d-pop")).toBe("sound3dPop");
	});

	it("gives every catalog sound a valid, unique identifier", () => {
		const ids = SOUND_CATALOG.map((s) => toIdentifier(s.name));
		for (const id of ids) expect(id).toMatch(/^[a-zA-Z_$][\w$]*$/);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("slugifies file names", () => {
		expect(toFileName("Modal Open!")).toBe("modal-open");
	});

	it("renders a module with a machine-readable header", () => {
		const out = renderSoundModule({
			sound: "click",
			theme: "minimal",
			definition: { source: { type: "sine", frequency: 440 } },
		});
		expect(out.split("\n")[0]).toBe(
			'// @audx {"theme":"minimal","sound":"click"}',
		);
		expect(out).toContain('import { defineSound } from "@litlab/audx";');
		expect(out).toContain("export const click = defineSound(");
	});

	it("renders a sorted barrel", () => {
		expect(renderIndex(["success", "delete", "click"])).toContain(
			[
				'export { click } from "./click";',
				'export { deleteSound } from "./delete";',
				'export { success } from "./success";',
			].join("\n"),
		);
	});
});

describe("project", () => {
	let dir: string;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "audx-cli-"));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("defaults the sounds dir from the project layout", () => {
		expect(defaultDir(dir)).toBe("sounds");
		mkdirSync(join(dir, "src"));
		expect(defaultDir(dir)).toBe("src/sounds");
	});

	it("round-trips audx.json", () => {
		expect(readConfig(dir)).toBeNull();
		writeConfig(dir, { theme: "retro", dir: "src/sounds" });
		expect(readConfig(dir)).toEqual({ theme: "retro", dir: "src/sounds" });
	});

	it("parses tsconfig with comments, URLs and trailing commas", () => {
		const parsed = parseJsonc(
			'{ // hi\n "$schema": "https://x.dev/a//b", /* block */ "a": [1,2,], }',
		);
		expect(parsed).toEqual({ $schema: "https://x.dev/a//b", a: [1, 2] });
	});

	it("resolves the import path through tsconfig aliases", () => {
		writeFileSync(
			join(dir, "tsconfig.json"),
			'{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
		);
		expect(importPathFor(dir, "src/sounds")).toBe("@/sounds");
		expect(importPathFor(dir, "lib/sounds")).toBe("./lib/sounds");

		writeFileSync(
			join(dir, "tsconfig.json"),
			'{ "compilerOptions": { "baseUrl": ".", "paths": { "~/*": ["*"] } } }',
		);
		expect(importPathFor(dir, "lib/sounds")).toBe("~/lib/sounds");
	});

	it("detects the package manager from the lockfile", () => {
		expect(detectPackageManager(dir)).toBeTypeOf("string");
		writeFileSync(join(dir, "pnpm-lock.yaml"), "");
		expect(detectPackageManager(dir)).toBe("pnpm");
	});

	it("lists installed sounds from generated headers only", () => {
		const config = { theme: "minimal", dir: "sounds" };
		const project = loadProject(dir);
		const out = join(dir, "sounds");
		writeSoundFile(out, "ts", {
			sound: "click",
			theme: "minimal",
			definition: {},
		});
		writeSoundFile(out, "ts", {
			sound: "pop",
			theme: "retro",
			definition: {},
			custom: true,
		});
		writeFileSync(join(out, "mine.ts"), "export const mine = 1;\n");
		writeIndex(out, "ts");

		expect(listInstalled(project, config)).toEqual([
			{ file: "click", sound: "click", theme: "minimal", custom: false },
			{ file: "pop", sound: "pop", theme: "retro", custom: true },
		]);
	});
});

describe("registry helpers", () => {
	it("classifies theme sources", () => {
		expect(sourceKind("minimal")).toBe("registry");
		expect(sourceKind("https://x.dev/t.json")).toBe("url");
		expect(sourceKind("./brand.json")).toBe("file");
		expect(sourceKind("themes/brand.json")).toBe("file");
	});

	it("suggests close matches", () => {
		expect(closest("clik", ["click", "close"])).toBe("click");
		expect(closest("succ", ["success", "select"])).toBe("success");
		expect(closest("zzzzzz", ["click"])).toBeUndefined();
	});

	it("validates theme shape", () => {
		expect(isThemePatch({ name: "x", sounds: {} })).toBe(true);
		expect(isThemePatch({ name: "x", sounds: [] })).toBe(false);
		expect(isThemePatch(null)).toBe(false);
	});
});

describe("customize", () => {
	it("decodes editor tuning tokens", () => {
		expect(decodeSoundCustomization("1.c.k.k.k.s")).toEqual({
			pitch: 0,
			duration: 1,
			gain: 1,
			pan: 0,
			waveform: "sine",
		});
		expect(() => decodeSoundCustomization("2.c.k.k.k.s")).toThrow();
	});

	it("applies pitch and gain to every layer", () => {
		const out = customizeDefinition(
			{
				layers: [
					{
						source: { type: "sine", frequency: 440 },
						envelope: { decay: 0.1 },
						gain: 0.5,
					},
				],
			},
			{ pitch: 12, duration: 2, gain: 0.5, pan: 0, waveform: "original" },
		) as {
			layers: {
				source: { frequency: number };
				gain: number;
				envelope: { decay: number };
			}[];
		};
		expect(out.layers[0].source.frequency).toBe(880);
		expect(out.layers[0].gain).toBe(0.25);
		expect(out.layers[0].envelope.decay).toBe(0.2);
	});

	it("round-trips --data payloads", () => {
		const def = { source: { type: "noise" } };
		const encoded = Buffer.from(JSON.stringify(def)).toString("base64url");
		expect(decodeSoundDefinition(encoded)).toEqual(def);
		expect(validateSoundDefinition(def)).toBe(true);
		expect(validateSoundDefinition({ layers: [] })).toBe(false);
	});
});
