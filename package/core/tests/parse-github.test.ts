import { describe, expect, it } from "vitest";
import { isGitHubSource, parseGitHubSource } from "../src/commands/utils.js";

describe("parseGitHubSource", () => {
	it("parses owner/repo shorthand", () => {
		const result = parseGitHubSource("ommgh/audio");
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "",
		});
	});

	it("parses full GitHub URL", () => {
		const result = parseGitHubSource("https://github.com/ommgh/audio");
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "",
		});
	});

	it("parses GitHub URL with trailing slash", () => {
		const result = parseGitHubSource("https://github.com/ommgh/audio/");
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "",
		});
	});

	it("parses GitHub URL with .git suffix", () => {
		const result = parseGitHubSource("https://github.com/ommgh/audio.git");
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "",
		});
	});

	it("parses GitHub URL with branch", () => {
		const result = parseGitHubSource(
			"https://github.com/ommgh/audio/tree/develop",
		);
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "develop",
			path: "",
		});
	});

	it("parses GitHub URL with branch and path", () => {
		const result = parseGitHubSource(
			"https://github.com/ommgh/audio/tree/main/packs",
		);
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "packs",
		});
	});

	it("returns null for a plain URL", () => {
		expect(parseGitHubSource("https://example.com/pack.json")).toBeNull();
	});

	it("returns null for a local path", () => {
		expect(parseGitHubSource("./packs/core.json")).toBeNull();
	});

	it("returns null for a single word", () => {
		expect(parseGitHubSource("audio")).toBeNull();
	});

	it("returns null for empty string", () => {
		expect(parseGitHubSource("")).toBeNull();
	});

	it("parses owner/repo shorthand with .git suffix", () => {
		const result = parseGitHubSource("ommgh/audio.git");
		expect(result).toEqual({
			owner: "ommgh",
			repo: "audio",
			branch: "main",
			path: "",
		});
	});
});

describe("isGitHubSource", () => {
	it("returns true for owner/repo", () => {
		expect(isGitHubSource("ommgh/audio")).toBe(true);
	});

	it("returns true for GitHub URL", () => {
		expect(isGitHubSource("https://github.com/ommgh/audio")).toBe(true);
	});

	it("returns false for a URL that is not GitHub", () => {
		expect(isGitHubSource("https://example.com/pack.json")).toBe(false);
	});

	it("returns false for a single word", () => {
		expect(isGitHubSource("packs")).toBe(false);
	});
});
