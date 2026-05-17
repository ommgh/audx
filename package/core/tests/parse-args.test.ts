import { describe, expect, it } from "vitest";
import { parseAddOptions } from "../src/commands/add.js";
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
