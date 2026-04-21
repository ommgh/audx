#!/usr/bin/env npx tsx
/**
 * Generates theme definition files, placeholder sound assets, and registry entries
 * for the semantic sound vocabulary feature.
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");

const SEMANTIC_SOUND_NAMES = [
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
	"tap",
	"press",
	"release",
	"drag",
	"drop",
	"select",
	"deselect",
	"focus",
	"blur",
	"forward",
	"open",
	"close",
	"expand",
	"collapse",
	"tab",
	"swipe",
	"confirm",
	"cancel",
	"deny",
	"undo",
	"redo",
	"alert",
	"message",
	"reminder",
	"mention",
	"show",
	"hide",
	"slide",
	"fade",
	"pop",
	"clear",
	"remove",
	"trash",
	"shred",
	"upload",
	"download",
	"refresh",
	"sync",
	"process",
	"cut",
	"snapshot",
	"lock",
	"unlock",
	"enable",
	"disable",
	"connect",
	"disconnect",
	"mute",
	"unmute",
	"record",
	"capture",
] as const;

const CATEGORIES: Record<string, string> = {
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
	tap: "interaction",
	press: "interaction",
	release: "interaction",
	drag: "interaction",
	drop: "interaction",
	select: "interaction",
	deselect: "interaction",
	focus: "interaction",
	blur: "interaction",
	forward: "navigation",
	open: "navigation",
	close: "navigation",
	expand: "navigation",
	collapse: "navigation",
	tab: "navigation",
	swipe: "navigation",
	confirm: "feedback",
	cancel: "feedback",
	deny: "feedback",
	undo: "feedback",
	redo: "feedback",
	alert: "notification",
	message: "notification",
	reminder: "notification",
	mention: "notification",
	show: "transition",
	hide: "transition",
	slide: "transition",
	fade: "transition",
	pop: "transition",
	clear: "destructive",
	remove: "destructive",
	trash: "destructive",
	shred: "destructive",
	upload: "progress",
	download: "progress",
	refresh: "progress",
	sync: "progress",
	process: "progress",
	cut: "clipboard",
	snapshot: "clipboard",
	lock: "state",
	unlock: "state",
	enable: "state",
	disable: "state",
	connect: "state",
	disconnect: "state",
	mute: "media",
	unmute: "media",
	record: "media",
	capture: "media",
};

const THEMES = ["minimal", "playful"] as const;

// Short silent MP3 placeholder (valid MP3 frame, ~0.026s of silence)
const SILENT_MP3_BASE64 =
	"SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYwLjMuMTAwAAAAAAAAAAAAAAD/+0DAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzYwLjMAAAAAAAAAAAAAAAAkAAAAAAAAAAAAYYQHAAAAAAAAAAAAAAAAAAAA//tAxAAAAAANIAAAAAAAAAA0gAAAAAAAAAAAAAAAAAD/+1DEFIAAAA0gAAAAAAAADSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Descriptions per category for theme definitions
const THEME_DESCRIPTIONS: Record<string, { minimal: string; playful: string }> =
	{
		interaction: {
			minimal: "A clean, minimal %s sound for UI interactions.",
			playful: "A rich, expressive %s sound for UI interactions.",
		},
		navigation: {
			minimal: "A subtle %s sound for navigation feedback.",
			playful: "A playful %s sound for navigation feedback.",
		},
		feedback: {
			minimal: "A clear, minimal %s feedback sound.",
			playful: "An expressive %s feedback sound.",
		},
		notification: {
			minimal: "A subtle %s notification tone.",
			playful: "A cheerful %s notification tone.",
		},
		transition: {
			minimal: "A clean %s transition sound.",
			playful: "A smooth, expressive %s transition sound.",
		},
		destructive: {
			minimal: "A subtle %s sound for destructive actions.",
			playful: "A dramatic %s sound for destructive actions.",
		},
		progress: {
			minimal: "A minimal %s progress indicator sound.",
			playful: "An engaging %s progress indicator sound.",
		},
		clipboard: {
			minimal: "A subtle %s clipboard action sound.",
			playful: "A satisfying %s clipboard action sound.",
		},
		state: {
			minimal: "A clean %s state change sound.",
			playful: "An expressive %s state change sound.",
		},
		media: {
			minimal: "A subtle %s media control sound.",
			playful: "A rich %s media control sound.",
		},
	};

function titleCase(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

// Deterministic pseudo-random duration based on name hash
function getDuration(name: string, theme: string): number {
	let hash = 0;
	const seed = `${name}-${theme}`;
	for (let i = 0; i < seed.length; i++) {
		hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
	}
	const normalized = Math.abs(hash % 1000) / 1000;
	if (theme === "minimal") {
		return Math.round((0.03 + normalized * 0.27) * 1000) / 1000; // 0.03 - 0.3
	}
	return Math.round((0.05 + normalized * 0.75) * 1000) / 1000; // 0.05 - 0.8
}

// ── Generate theme definition files ──────────────────────────────────────

for (const theme of THEMES) {
	const mappings: Record<string, string> = {};
	for (const name of SEMANTIC_SOUND_NAMES) {
		mappings[name] =
			`registry/audx/audio/${name}-${theme}-001/${name}-${theme}-001.ts`;
	}

	const definition = {
		name: theme,
		displayName: titleCase(theme),
		description:
			theme === "minimal"
				? "Clean, subtle sounds for professional interfaces. Short durations, simple tones."
				: "Rich, expressive sounds for playful interfaces. Longer durations, dynamic character.",
		author: "audx",
		mappings,
	};

	const dir = resolve(ROOT, "registry/audx/themes");
	mkdirSync(dir, { recursive: true });
	writeFileSync(
		resolve(dir, `${theme}.json`),
		JSON.stringify(definition, null, "\t") + "\n",
	);
	console.log(`✔ Created registry/audx/themes/${theme}.json`);
}

// ── Generate placeholder sound asset files ───────────────────────────────

for (const theme of THEMES) {
	for (const name of SEMANTIC_SOUND_NAMES) {
		const assetName = `${name}-${theme}-001`;
		const dir = resolve(ROOT, `registry/audx/audio/${assetName}`);
		mkdirSync(dir, { recursive: true });

		const duration = getDuration(name, theme);
		const varName =
			assetName
				.split("-")
				.map((part, i) =>
					i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
				)
				.join("") + "Audio";

		const content = `import type { AudioAsset } from "@/lib/audio-types";

export const ${varName}: AudioAsset = {
\tname: "${assetName}",
\tdataUri:
\t\t"data:audio/mpeg;base64,${SILENT_MP3_BASE64}",
\tduration: ${duration},
\tformat: "mp3",
\tlicense: "CC0",
\tauthor: "audx",
};
`;
		writeFileSync(resolve(dir, `${assetName}.ts`), content);
	}
	console.log(
		`✔ Created ${SEMANTIC_SOUND_NAMES.length} placeholder assets for ${theme} theme`,
	);
}

// ── Update registry.json ─────────────────────────────────────────────────

const registryPath = resolve(ROOT, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

// Remove any existing theme sound assets (to avoid duplicates on re-run)
registry.items = registry.items.filter((item: any) => {
	if (item.type !== "registry:block") return true;
	return !item.meta?.theme;
});

for (const theme of THEMES) {
	for (const name of SEMANTIC_SOUND_NAMES) {
		const assetName = `${name}-${theme}-001`;
		const category = CATEGORIES[name] ?? "interaction";
		const duration = getDuration(name, theme);
		const desc = (
			THEME_DESCRIPTIONS[category]?.[theme] ?? "A %s sound."
		).replace("%s", name);

		registry.items.push({
			name: assetName,
			type: "registry:block",
			title: `${titleCase(name)} (${titleCase(theme)})`,
			description: desc,
			files: [
				{
					path: `registry/audx/audio/${assetName}/${assetName}.ts`,
					type: "registry:lib",
				},
				{ path: "registry/audx/lib/audio-types.ts", type: "registry:lib" },
				{ path: "registry/audx/lib/audio-engine.ts", type: "registry:lib" },
			],
			author: "audx",
			meta: {
				duration,
				format: "mp3",
				sizeKb: 1,
				license: "CC0",
				tags: [name, theme, category],
				keywords: [name, theme, category, "ui", "sound"],
				theme,
				semanticName: name,
			},
		});
	}
	console.log(
		`✔ Added ${SEMANTIC_SOUND_NAMES.length} registry entries for ${theme} theme`,
	);
}

writeFileSync(registryPath, JSON.stringify(registry, null, "\t") + "\n");
console.log(`✔ Updated registry.json (${registry.items.length} total items)`);
