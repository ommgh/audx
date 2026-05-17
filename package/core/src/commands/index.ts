import * as p from "@clack/prompts";
import { add } from "./add.js";
import { check } from "./check.js";
import { find } from "./find.js";
import { init, themeInit } from "./init.js";
import { list } from "./list.js";
import { remove } from "./remove.js";
import { update } from "./update.js";

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
	add,
	a: add,
	find,
	search: find,
	f: find,
	s: find,
	list,
	ls: list,
	remove,
	rm: remove,
	check,
	update,
	upgrade: update,
	init,
	theme: async (args) => {
		if (args[0] !== "init") {
			p.log.error(`Unknown theme command: ${args[0] ?? ""}`);
			p.log.message("Run @litlab/audx theme init to create a new theme.");
			process.exit(1);
		}
		await themeInit(args.slice(1));
	},
};

function showBanner() {
	p.intro("@litlab/audx");

	p.log.message("Manage sound themes for your project.");

	p.log.message(
		[
			"Themes",
			"  add [sound]     Install an individual sound",
			"  add             Browse and install themes",
			"  find [query]    Search for themes",
			"  list            List installed themes",
			"  remove          Remove installed themes",
		].join("\n"),
	);

	p.log.message(
		[
			"Updates",
			"  check           Check for updates",
			"  update          Update installed themes",
		].join("\n"),
	);

	p.log.message(
		[
			"Project",
			"  init            Set up AudX and install themes",
			"  theme init      Create a new local theme JSON",
		].join("\n"),
	);

	p.outro("try: npx @litlab/audx add ommgh/audio");
}

function showHelp() {
	p.intro("@litlab/audx");

	p.log.message(
		[
			"Usage: @litlab/audx <command> [options]",
			"",
			"Manage Themes:",
			"  add [sound]     Install an individual sound",
			"  add             Browse and install themes",
			"  add <source>    Install themes from a source",
			"  find [query]    Search for themes in the registry",
			"  list, ls        List installed themes",
			"  remove, rm      Remove installed themes",
			"",
			"Updates:",
			"  check           Check for available updates",
			"  update          Update all installed themes",
			"",
			"Project:",
			"  init            Set up AudX and install themes",
			"  theme init      Create a new local theme JSON",
		].join("\n"),
	);

	p.log.message(
		[
			"Add Options:",
			"  -l, --list      Preview available themes without installing",
			"  -y, --yes       Skip confirmation prompts",
			"  --theme <name>  Install a specific theme by name",
			"",
			"Remove Options:",
			"  -y, --yes       Skip confirmation prompts",
		].join("\n"),
	);

	p.log.message(
		[
			"Source Formats:",
			"  ./local/path                    Local file or directory",
			"  owner/repo                      GitHub shorthand",
			"  https://github.com/user/repo    Full GitHub URL",
			"  https://...theme.json           Direct URL to a theme file",
			"  (no argument)                   Browse the registry",
		].join("\n"),
	);

	p.log.message(
		[
			"Options:",
			"  --help, -h      Show this help message",
			"  --version, -v   Show version number",
		].join("\n"),
	);

	p.note(
		[
			"  @litlab/audx add ommgh/audio",
			"  @litlab/audx add ./.themes/",
			"  @litlab/audx add ommgh/audio --list",
			"  @litlab/audx add --theme core -y",
			"  @litlab/audx remove core -y",
			"  @litlab/audx find ambient",
			"  @litlab/audx check",
			"  @litlab/audx update",
		].join("\n"),
		"Examples",
	);

	p.outro("");
}

export async function run() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command) {
		showBanner();
		return;
	}

	if (command === "--help" || command === "-h") {
		showHelp();
		return;
	}

	if (command === "--version" || command === "-v") {
		try {
			const { readFileSync } = await import("node:fs");
			const { join, dirname } = await import("node:path");
			const { fileURLToPath } = await import("node:url");
			const __dirname = dirname(fileURLToPath(import.meta.url));
			const pkg = JSON.parse(
				readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
			);
			console.log(pkg.version);
		} catch {
			console.log("0.0.0");
		}
		return;
	}

	const handler = COMMANDS[command];
	if (!handler) {
		p.log.error(`Unknown command: ${command}`);
		p.log.message("Run @litlab/audx --help for usage information.");
		process.exit(1);
	}

	await handler(args.slice(1));
}
