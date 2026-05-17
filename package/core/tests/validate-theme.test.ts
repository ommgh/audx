import { describe, expect, it } from "vitest";
import { validateTheme } from "../src/commands/utils.js";

describe("validateTheme", () => {
	it("returns true for a valid theme with name and sounds", () => {
		const data = {
			name: "test-theme",
			sounds: { click: { source: { type: "sine" } } },
		};
		expect(validateTheme(data)).toBe(true);
	});

	it("returns true for a theme with empty sounds object", () => {
		const data = { name: "empty", sounds: {} };
		expect(validateTheme(data)).toBe(true);
	});

	it("returns false when name is missing", () => {
		const data = { sounds: { click: {} } };
		expect(validateTheme(data)).toBe(false);
	});

	it("returns false when name is not a string", () => {
		const data = { name: 42, sounds: {} };
		expect(validateTheme(data as Record<string, unknown>)).toBe(false);
	});

	it("returns false when sounds is missing", () => {
		const data = { name: "test" };
		expect(validateTheme(data as Record<string, unknown>)).toBe(false);
	});

	it("returns false when sounds is null", () => {
		const data = { name: "test", sounds: null };
		expect(validateTheme(data as Record<string, unknown>)).toBe(false);
	});

	it("returns false when sounds is a string", () => {
		const data = { name: "test", sounds: "not-an-object" };
		expect(validateTheme(data as Record<string, unknown>)).toBe(false);
	});

	it("returns false for empty object", () => {
		expect(validateTheme({})).toBe(false);
	});
});
