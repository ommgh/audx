/**
 * Homepage FAQ. Written as the literal questions developers type into search
 * engines and AI assistants, answered in self-contained sentences so any one
 * answer can be quoted on its own. Rendered on the page, as FAQPage JSON-LD,
 * and in /llms-full.txt.
 */
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
	{
		question: "What is audx?",
		answer:
			"audx is an open-source (MIT) library of UI sound effects for React, Next.js and any web app. It ships 43 semantic interaction sounds such as click, toggle, success, error and notify in four themes (minimal, playful, mechanical, retro). A CLI copies each sound into your project as a few lines of TypeScript you own, much like shadcn/ui does for components.",
	},
	{
		question: "How do I add sound effects to a React or Next.js app?",
		answer:
			'Run `npx @litlab/audx init` to pick a theme and a starter set of sounds. They are generated into `src/sounds/`, so you can `import { click } from "@/sounds"` and call `click()` in any event handler. In React, wrap the call with `useSound(click)` from `@litlab/audx/react` to respect a global mute, volume and the user\'s reduced-motion preference.',
	},
	{
		question: "Does audx use MP3 or WAV audio files?",
		answer:
			"No. Every audx sound is a few hundred bytes of JSON synthesized at runtime with the Web Audio API, so there are no audio files to host, preload or cache. If you do need a file, `renderToWav()` renders any sound offline to a WAV blob.",
	},
	{
		question: "Which UI sounds are included?",
		answer:
			"Input (click, tap, press, release, hover, focus, blur, type, tick), selection (toggle, enable, disable, select, deselect, tab), navigation (open, close, expand, collapse, back, forward, scroll, slide), editing (copy, paste, undo, clear, delete, drag, drop), feedback (success, complete, error, warning, deny, info), notification (notify, send, receive, pop) and status (loading, lock, unlock).",
	},
	{
		question: "Can I change every sound in my app at once?",
		answer:
			"Yes. Every first-party theme implements the same semantic names, so `npx @litlab/audx theme playful` regenerates every installed sound in the new style without touching your code. You can also start a custom brand theme with `npx @litlab/audx create brand --from mechanical`.",
	},
	{
		question: "Does audx work without React?",
		answer:
			"Yes. The core package is framework-agnostic: each generated sound is a plain function you can call from Vue, Svelte, Solid, Angular or vanilla JavaScript. React bindings (`SoundProvider`, `useSound`, `usePatch`) live in the separate `@litlab/audx/react` entry point.",
	},
	{
		question: "How is audx different from use-sound or UI sound packs?",
		answer:
			"use-sound and similar hooks play audio files you supply, and most UI sound packs ship hundreds of MP3 or OGG files. audx instead gives you a named, themeable set of synthesized sounds as source code: nothing to download at runtime, consistent loudness across sounds, and one command to re-skin the whole app.",
	},
	{
		question: "Is audx free for commercial use?",
		answer:
			"Yes. audx and all built-in themes are MIT licensed and free for personal and commercial projects.",
	},
	{
		question: "Can AI coding agents design new sounds with audx?",
		answer:
			"Yes. audx publishes a `create-audio` agent skill that lets coding agents such as Claude Code generate a new audx sound definition from a text prompt or a reference audio file. Install it with `npx skills add ommgh/audx`.",
	},
];
