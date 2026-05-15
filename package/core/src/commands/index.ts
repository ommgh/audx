import * as p from "@clack/prompts";
import { add } from "./add.js";
import { check } from "./check.js";
import { find } from "./find.js";
import { init } from "./init.js";
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
};

function showBanner() {
	p.intro("@litlab/audx");

	p.log.message("Manage sound patches for your project.");

	p.log.message(
		[
			"Patches",
			"  add [source]    Install sound patches",
			"  find [query]    Search for patches",
			"  list            List installed patches",
			"  remove          Remove installed patches",
		].join("\n"),
	);

	p.log.message(
		[
			"Updates",
			"  check           Check for updates",
			"  update          Update installed patches",
		].join("\n"),
	);

	p.log.message(
		["Project", "  init            Create a new sound patch"].join("\n"),
	);

	p.outro("try: npx @litlab/audx add ommgh/audio");
}

function showHelp() {
	p.intro("@litlab/audx");

	p.log.message(
		[
			"Usage: @litlab/audx <command> [options]",
			"",
			"Manage Patches:",
			"  add [source]    Install sound patches",
			"  find [query]    Search for patches in the registry",
			"  list, ls        List installed patches",
			"  remove, rm      Remove installed patches",
			"",
			"Updates:",
			"  check           Check for available updates",
			"  update          Update all installed patches",
			"",
			"Project:",
			"  init            Create a new sound patch",
		].join("\n"),
	);

	p.log.message(
		[
			"Add Options:",
			"  -l, --list      Preview available patches without installing",
			"  -y, --yes       Skip confirmation prompts",
			"  --patch <name>  Install a specific patch by name",
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
			"  https://...patch.json           Direct URL to a patch file",
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
			"  @litlab/audx add --patch core -y",
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
