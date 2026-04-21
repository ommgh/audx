import { z } from "zod";

// ── Semantic Sound Names ────────────────────────────────────────────────────

export const SEMANTIC_SOUND_NAMES = [
	// Existing (16)
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
	// Interaction (9)
	"tap",
	"press",
	"release",
	"drag",
	"drop",
	"select",
	"deselect",
	"focus",
	"blur",
	// Navigation (7)
	"forward",
	"open",
	"close",
	"expand",
	"collapse",
	"tab",
	"swipe",
	// Feedback (5)
	"confirm",
	"cancel",
	"deny",
	"undo",
	"redo",
	// Notification (4)
	"alert",
	"message",
	"reminder",
	"mention",
	// Transition (5)
	"show",
	"hide",
	"slide",
	"fade",
	"pop",
	// Destructive (4)
	"clear",
	"remove",
	"trash",
	"shred",
	// Progress (5)
	"upload",
	"download",
	"refresh",
	"sync",
	"process",
	// Clipboard (2)
	"cut",
	"snapshot",
	// State (6)
	"lock",
	"unlock",
	"enable",
	"disable",
	"connect",
	"disconnect",
	// Media (4)
	"mute",
	"unmute",
	"record",
	"capture",
] as const;

export type SemanticSoundName = (typeof SEMANTIC_SOUND_NAMES)[number];

// ── Category Metadata ───────────────────────────────────────────────────────

export const CATEGORY_NAMES = [
	"interaction",
	"navigation",
	"feedback",
	"notification",
	"transition",
	"destructive",
	"progress",
	"clipboard",
	"state",
	"media",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export const SEMANTIC_SOUND_CATEGORIES: Record<
	SemanticSoundName,
	CategoryName
> = {
	// Existing (16) — mapped to closest categories
	success: "feedback",
	error: "feedback",
	warning: "feedback",
	info: "notification",
	click: "interaction",
	back: "navigation",
	enter: "interaction",
	delete: "destructive",
	copy: "clipboard",
	paste: "clipboard",
	scroll: "navigation",
	hover: "interaction",
	toggle: "interaction",
	notify: "notification",
	complete: "feedback",
	loading: "progress",
	// Interaction (9)
	tap: "interaction",
	press: "interaction",
	release: "interaction",
	drag: "interaction",
	drop: "interaction",
	select: "interaction",
	deselect: "interaction",
	focus: "interaction",
	blur: "interaction",
	// Navigation (7)
	forward: "navigation",
	open: "navigation",
	close: "navigation",
	expand: "navigation",
	collapse: "navigation",
	tab: "navigation",
	swipe: "navigation",
	// Feedback (5)
	confirm: "feedback",
	cancel: "feedback",
	deny: "feedback",
	undo: "feedback",
	redo: "feedback",
	// Notification (4)
	alert: "notification",
	message: "notification",
	reminder: "notification",
	mention: "notification",
	// Transition (5)
	show: "transition",
	hide: "transition",
	slide: "transition",
	fade: "transition",
	pop: "transition",
	// Destructive (4)
	clear: "destructive",
	remove: "destructive",
	trash: "destructive",
	shred: "destructive",
	// Progress (5)
	upload: "progress",
	download: "progress",
	refresh: "progress",
	sync: "progress",
	process: "progress",
	// Clipboard (2)
	cut: "clipboard",
	snapshot: "clipboard",
	// State (6)
	lock: "state",
	unlock: "state",
	enable: "state",
	disable: "state",
	connect: "state",
	disconnect: "state",
	// Media (4)
	mute: "media",
	unmute: "media",
	record: "media",
	capture: "media",
};

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
	themes: z.record(z.string(), z.record(z.string(), z.string().nullable())),
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
		theme?: string;
		semanticName?: string;
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
