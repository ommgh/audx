import { describe, expect, it } from "vitest";
import { getAvailableThemes, isValidTheme, loadTheme } from "./theme-loader";

describe("theme-loader", () => {
  describe("getAvailableThemes", () => {
    it("should return an array of available theme names", () => {
      const themes = getAvailableThemes();
      expect(themes).toBeInstanceOf(Array);
      expect(themes.length).toBeGreaterThan(0);
    });

    it("should include minimal and playful themes", () => {
      const themes = getAvailableThemes();
      expect(themes).toContain("minimal");
      expect(themes).toContain("playful");
    });

    it("should return a new array each time (not mutate original)", () => {
      const themes1 = getAvailableThemes();
      const themes2 = getAvailableThemes();
      expect(themes1).not.toBe(themes2);
      expect(themes1).toEqual(themes2);
    });
  });

  describe("isValidTheme", () => {
    it("should return true for valid theme names", () => {
      expect(isValidTheme("minimal")).toBe(true);
      expect(isValidTheme("playful")).toBe(true);
    });

    it("should return false for invalid theme names", () => {
      expect(isValidTheme("invalid")).toBe(false);
      expect(isValidTheme("")).toBe(false);
      expect(isValidTheme("Minimal")).toBe(false); // case-sensitive
    });
  });

  describe("loadTheme", () => {
    it("should load the minimal theme successfully", async () => {
      const theme = await loadTheme("minimal");

      expect(theme).toBeDefined();
      expect(theme.name).toBe("Minimal");
      expect(theme.sounds).toBeDefined();
      expect(typeof theme.sounds).toBe("object");
    });

    it("should load the playful theme successfully", async () => {
      const theme = await loadTheme("playful");

      expect(theme).toBeDefined();
      expect(theme.name).toBe("Playful");
      expect(theme.sounds).toBeDefined();
      expect(typeof theme.sounds).toBe("object");
    });

    it("should include expected sound definitions in minimal theme", async () => {
      const theme = await loadTheme("minimal");

      // Check for some common sounds
      expect(theme.sounds.click).toBeDefined();
      expect(theme.sounds.success).toBeDefined();
      expect(theme.sounds.error).toBeDefined();
      expect(theme.sounds.hover).toBeDefined();
    });

    it("should include expected sound definitions in playful theme", async () => {
      const theme = await loadTheme("playful");

      // Check for some common sounds
      expect(theme.sounds.click).toBeDefined();
      expect(theme.sounds.success).toBeDefined();
      expect(theme.sounds.error).toBeDefined();
      expect(theme.sounds.hover).toBeDefined();
    });

    it("should include metadata in the theme", async () => {
      const theme = await loadTheme("minimal");

      expect(theme.name).toBeDefined();
      expect(typeof theme.name).toBe("string");
      expect(theme.author).toBeDefined();
      expect(theme.version).toBeDefined();
      expect(theme.description).toBeDefined();
    });

    it("should throw error for invalid theme name", async () => {
      await expect(loadTheme("invalid")).rejects.toThrow(
        "Invalid theme name: invalid",
      );
    });

    it("should throw error for empty theme name", async () => {
      await expect(loadTheme("")).rejects.toThrow("Invalid theme name");
    });

    it("should throw error for case-mismatched theme name", async () => {
      await expect(loadTheme("Minimal")).rejects.toThrow(
        "Invalid theme name: Minimal",
      );
    });

    it("should validate theme structure", async () => {
      // This test ensures the loaded theme has the expected structure
      const theme = await loadTheme("minimal");

      // Validate sounds object
      expect(theme.sounds).toBeDefined();
      expect(typeof theme.sounds).toBe("object");
      expect(Object.keys(theme.sounds).length).toBeGreaterThan(0);

      // Validate at least one sound definition
      const firstSound = Object.values(theme.sounds)[0];
      expect(firstSound).toBeDefined();
    });
  });
});
