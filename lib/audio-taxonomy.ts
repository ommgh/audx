import { SOUND_CATALOG } from "@litlab/audx/catalog";

/** Every semantic sound name shipped by the built-in themes. */
export const audio = SOUND_CATALOG.map((entry) => entry.name);

/** Sound name -> category. */
export const CATEGORIES: Record<string, string> = Object.fromEntries(
	SOUND_CATALOG.map((entry) => [entry.name, entry.category]),
);
