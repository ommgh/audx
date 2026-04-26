#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program.name("audx").version(pkg.version).description(pkg.description);

// ── init ────────────────────────────────────────────────────────────────────

program
	.command("init")
	.description("Initialize audx in the current project")
	.action(async () => {
		const { initCommand } = await import("./commands/init.js");
		await initCommand(process.cwd());
	});

// ── add ─────────────────────────────────────────────────────────────────────

program
	.command("add")
	.description("Add sounds from the audx registry")
	.argument("<sounds...>", "Sound names to add")
	.action(async (sounds: string[]) => {
		const { addCommand } = await import("./commands/add.js");
		await addCommand(sounds, process.cwd());
	});

// ── list ────────────────────────────────────────────────────────────────────

program
	.command("list")
	.description("List available sounds in the registry")
	.option("--tag <tag>", "Filter by tag")
	.option("--search <query>", "Search by name, description, or tags")
	.option("--theme <theme>", "Filter by theme (defaults to config theme)")
	.action(
		async (options: { tag?: string; search?: string; theme?: string }) => {
			const { listCommand } = await import("./commands/list.js");
			await listCommand(process.cwd(), options);
		},
	);

// ── remove ──────────────────────────────────────────────────────────────────

program
	.command("remove")
	.description("Remove installed sounds")
	.argument("<sounds...>", "Sound names to remove")
	.action(async (sounds: string[]) => {
		const { removeCommand } = await import("./commands/remove.js");
		await removeCommand(sounds, process.cwd());
	});

// ── diff ────────────────────────────────────────────────────────────────────

program
	.command("diff")
	.description("Check for updates to installed sounds")
	.action(async () => {
		const { diffCommand } = await import("./commands/diff.js");
		await diffCommand(process.cwd());
	});

// ── update ──────────────────────────────────────────────────────────────────

program
	.command("update")
	.description("Update installed sounds from the registry")
	.argument("[sound-name]", "Specific sound to update")
	.action(async (soundName?: string) => {
		const { updateCommand } = await import("./commands/update.js");
		await updateCommand(soundName, process.cwd());
	});

// ── generate ────────────────────────────────────────────────────────────────

program
	.command("generate")
	.description("Generate a sound from a text prompt")
	.argument("<prompt>", "Text prompt describing the sound")
	.option("--name <name>", "Custom name for the generated sound")
	.option("--duration <seconds>", "Duration in seconds (0.5–22)")
	.action(
		async (prompt: string, options: { name?: string; duration?: string }) => {
			const { generateCommand } = await import("./commands/generate.js");
			await generateCommand(prompt, options, process.cwd());
		},
	);

// ── install ──────────────────────────────────────────────────────────────────

const install = program.command("install").description("Install sound packs");

install
	.command("pack")
	.description("Install all sounds for a theme")
	.argument("<theme>", "Theme name to install")
	.action(async (themeName: string) => {
		const { installPackCommand } = await import("./commands/install.js");
		await installPackCommand(themeName, process.cwd());
	});

// ── theme (parent with subcommands) ────────────────────────────────────────

const theme = program.command("theme").description("Manage sound themes");

theme
	.command("set")
	.description("Set the active theme")
	.argument("<theme-name>", "Theme name to activate")
	.action(async (themeName: string) => {
		const { themeSetCommand } = await import("./commands/theme.js");
		await themeSetCommand(themeName, process.cwd());
	});

// ── Parse and run ───────────────────────────────────────────────────────────

// Requirement 1.6 — display help when invoked without subcommand
if (process.argv.length <= 2) {
	program.help();
}

program.parse();
