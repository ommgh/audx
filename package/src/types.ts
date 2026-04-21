import { z } from "zod";

// ── Semantic Sound Names ────────────────────────────────────────────────────

export const SEMANTIC_SOUND_NAMES = [
	"success",
	"error",
	"warning",
	"info",
	"click",
	"back",
	"enter",
	"delete",
	"copy",
	"paste",
	"scroll",
	"hover",
	"toggle",
	"notify",
	"complete",
	"loading",
] as const;

export type SemanticSoundName = (typeof SEMANTIC_SOUND_NAMES)[number];

// ── Package Manager ─────────────────────────────────────────────────────────

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

// ── AudxConfig (audx.config.json) ───────────────────────────────────────────

export const audxConfigSchema = z.object({
	$schema: z.string().optional(),
	soundDir: z.string(),
	libDir: z.string(),
	registryUrl: z.string().url(),
	packageManager: z.enum(["npm", "pnpm", "yarn", "bun"]),
	aliases: z.object({
		lib: z.string(),
		hooks: z.string(),
		sounds: z.string(),
	}),
	installedSounds: z.record(
		z.string(),
		z.object({
			files: z.array(z.string()),
			installedAt: z.string().datetime(),
		}),
	),
});

export type AudxConfig = z.infer<typeof audxConfigSchema>;

// ── ThemeConfig (audx.themes.json) ──────────────────────────────────────────

export const themeConfigSchema = z.object({
	activeTheme: z.string(),
	themes: z.record(
		z.string(),
		z.record(z.enum(SEMANTIC_SOUND_NAMES), z.string().nullable()),
	),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

// ── Registry Types ──────────────────────────────────────────────────────────

export interface RegistryFile {
	path: string;
	content: string;
	type: string;
}

export interface RegistryItem {
	$schema: string;
	name: string;
	type: string;
	title: string;
	author?: string;
	description: string;
	files: RegistryFile[];
	meta?: {
		duration: number;
		format: string;
		sizeKb: number;
		license: string;
		tags: string[];
	};
}

export interface RegistryCatalog {
	$schema: string;
	name: string;
	homepage: string;
	items: RegistryItem[];
}

// ── Alias Map ───────────────────────────────────────────────────────────────

export interface AliasMap {
	hasAliases: boolean;
	patterns: Array<{
		alias: string;
		paths: string[];
	}>;
}

// ── Generate Sound Params ───────────────────────────────────────────────────

export interface GenerateSoundParams {
	text: string;
	duration_seconds?: number;
	prompt_influence?: number;
}
