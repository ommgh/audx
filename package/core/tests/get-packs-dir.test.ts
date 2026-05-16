import { mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPatchesDir } from "../src/commands/utils.js";

describe("getPatchesDir", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeEach(() => {
		originalCwd = process.cwd();
		const raw = join(
			tmpdir(),
			`audio-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		);
		mkdirSync(raw, { recursive: true });
		tempDir = realpathSync(raw);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("returns src/audio/themes when no config exists", () => {
		process.chdir(tempDir);
		const result = getPatchesDir();
		expect(result).toBe(join(tempDir, "src", "audio", "themes"));
	});

	it("returns themes path from .themes/config.json", () => {
		const configDir = join(tempDir, ".themes");
		mkdirSync(configDir, { recursive: true });
		writeFileSync(
			join(configDir, "config.json"),
			JSON.stringify({ output: "src/sounds" }),
		);
		process.chdir(tempDir);
		const result = getPatchesDir();
		expect(result).toBe(join(tempDir, "src", "sounds", "themes"));
	});
});
