import type { SoundPatch } from "@litlab/audx";

/**
 * Theme loader utility for loading audio themes from the .themes folder
 */

/**
 * Available theme names
 */
const AVAILABLE_THEMES = ["minimal", "playful"] as const;

export type ThemeName = (typeof AVAILABLE_THEMES)[number];

/**
 * Load a theme from the .themes folder
 * @param themeName - Name of the theme to load (e.g., "minimal", "playful")
 * @returns Promise resolving to the SoundPatch object
 * @throws Error if theme fails to load or is malformed
 */
export async function loadTheme(themeName: string): Promise<SoundPatch> {
  // Validate theme name
  if (!AVAILABLE_THEMES.includes(themeName as ThemeName)) {
    throw new Error(
      `Invalid theme name: ${themeName}. Available themes: ${AVAILABLE_THEMES.join(", ")}`,
    );
  }

  try {
    // Dynamically import the theme module
    const module = await import(`@/.themes/${themeName}`);

    // Validate the module structure
    if (!module._patch) {
      throw new Error(`Theme module "${themeName}" is missing _patch export`);
    }

    const theme = module._patch as SoundPatch;

    // Validate theme structure
    if (!theme.sounds || typeof theme.sounds !== "object") {
      throw new Error(
        `Theme "${themeName}" has invalid or missing sounds object`,
      );
    }

    if (!theme.name || typeof theme.name !== "string") {
      throw new Error(`Theme "${themeName}" has invalid or missing name`);
    }

    return theme;
  } catch (error) {
    // Re-throw validation errors
    if (error instanceof Error && error.message.includes("Theme")) {
      throw error;
    }

    // Handle import errors
    throw new Error(
      `Failed to load theme "${themeName}": ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get list of available theme names
 * @returns Array of available theme names
 */
export function getAvailableThemes(): string[] {
  return [...AVAILABLE_THEMES];
}

/**
 * Check if a theme name is valid
 * @param themeName - Theme name to validate
 * @returns True if the theme name is valid
 */
export function isValidTheme(themeName: string): themeName is ThemeName {
  return AVAILABLE_THEMES.includes(themeName as ThemeName);
}
