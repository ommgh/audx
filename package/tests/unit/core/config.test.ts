import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exists, read, validate, write } from "../../../src/core/config.js";
import type { AudxConfig } from "../../../src/types.js";

function makeValidConfig(overrides: Partial<AudxConfig> = {}): AudxConfig {
	return {
		soundDir: "src/sounds",
		libDir: "src/lib",
		registryUrl: "https://audx.site",
		packageManager: "npm",
		aliases: { lib: "@/lib", hooks: "@/hooks", sounds: "@/sounds" },
		installedSounds: {},
		...overrides,
	};
}

describe("ConfigManager", () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "audx-config-test-"));
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	describe("exists", () => {
		it("returns false when config file is missing", () => {
			expect(exists(tmpDir)).toBe(false);
		});

		it("returns true when config file is present", () => {
			writeFileSync(join(tmpDir, "audx.config.json"), "{}");
			expect(exists(tmpDir)).toBe(true);
		});
	});

	describe("validate", () => {
		it("returns parsed config for valid input", () => {
			const raw = makeValidConfig();
			const result = validate(raw);
			expect(result).toEqual(raw);
		});

		it("throws on missing required fields", () => {
			expect(() => validate({})).toThrow();
		});

		it("throws on invalid registryUrl", () => {
			expect(() =>
				validate(makeValidConfig({ registryUrl: "not-a-url" })),
			).toThrow();
		});
	});

	describe("read", () => {
		it("reads and validates a valid config file", () => {
			const config = makeValidConfig();
			writeFileSync(join(tmpDir, "audx.config.json"), JSON.stringify(config));
			const result = read(tmpDir);
			expect(result).toEqual(config);
		});

		it("throws on invalid JSON", () => {
			writeFileSync(join(tmpDir, "audx.config.json"), "{bad json");
			expect(() => read(tmpDir)).toThrow();
		});

		it("throws when required fields are missing", () => {
			writeFileSync(
				join(tmpDir, "audx.config.json"),
				JSON.stringify({ soundDir: "src/sounds" }),
			);
			expect(() => read(tmpDir)).toThrow();
		});

		it("throws when file does not exist", () => {
			expect(() => read(tmpDir)).toThrow();
		});
	});

	describe("write", () => {
		it("creates config file with correct JSON content", () => {
			const config = makeValidConfig();
			write(tmpDir, config);
			const result = read(tmpDir);
			expect(result).toEqual(config);
		});

		it("uses 2-space indentation", () => {
			const config = makeValidConfig();
			write(tmpDir, config);
			const { readFileSync } = require("node:fs");
			const raw = readFileSync(join(tmpDir, "audx.config.json"), "utf-8");
			// 2-space indent means lines like '  "soundDir"'
			expect(raw).toContain('  "soundDir"');
		});
	});
});
