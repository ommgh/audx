import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { CliError, flag, parseArgs } from "./args.js";
import * as commands from "./commands.js";
import { createContext } from "./context.js";

type Command = {
	run: (ctx: ReturnType<typeof createContext>) => Promise<void>;
	usage: string;
	summary: string;
	options?: [string, string][];
	examples?: string[];
};

const THEME_OPT: [string, string] = [
	"-t, --theme <name>",
	"Theme name, URL, or path to a .json theme",
];
const YES_OPT: [string, string] = [
	"-y, --yes",
	"Skip prompts and use defaults",
];

const COMMANDS: Record<string, Command> = {
	init: {
		run: commands.init,
		usage: "init",
		summary: "Set up audx in this project",
		options: [
			["--dir <path>", "Where sound files go (default: src/sounds)"],
			THEME_OPT,
			["--no-install", "Don't install @litlab/audx"],
			YES_OPT,
		],
		examples: ["init", "init -y --theme mechanical"],
	},
	add: {
		run: commands.add,
		usage: "add [sounds...]",
		summary: "Add sounds (opens a picker without arguments)",
		options: [
			THEME_OPT,
			["-a, --all", "Add every sound in the theme"],
			["-o, --overwrite", "Replace sounds that are already installed"],
			YES_OPT,
		],
		examples: [
			"add click success error",
			"add --all",
			"add toggle --theme retro",
		],
	},
	remove: {
		run: commands.remove,
		usage: "remove [sounds...]",
		summary: "Remove installed sounds",
		options: [["-a, --all", "Remove every installed sound"]],
		examples: ["remove hover"],
	},
	list: {
		run: commands.list,
		usage: "list [search]",
		summary: "Browse sounds in your theme (--themes for themes)",
		options: [THEME_OPT, ["--themes", "List available themes instead"]],
		examples: ["list", "list feedback", "list --themes"],
	},
	theme: {
		run: commands.theme,
		usage: "theme [name]",
		summary: "Show or switch the theme of every installed sound",
		options: [
			["-f, --force", "Also replace sounds you customized on audx.site"],
		],
		examples: ["theme", "theme playful", "theme ./audx/themes/brand.json"],
	},
	update: {
		run: commands.update,
		usage: "update",
		summary: "Pull the latest version of installed sounds",
		options: [["--check", "Only report what would change"]],
		examples: ["update", "update --check"],
	},
	create: {
		run: commands.create,
		usage: "create <name>",
		summary: "Start a custom theme from an existing one",
		options: [
			["--from <theme>", "Theme to copy (default: your current theme)"],
		],
		examples: ["create brand --from mechanical"],
	},
};

const ALIASES: Record<string, string> = {
	i: "init",
	a: "add",
	install: "add",
	rm: "remove",
	ls: "list",
	find: "list",
	search: "list",
	themes: "list",
	upgrade: "update",
	check: "update",
};

const BIN = "npx @litlab/audx";

function version(): string {
	try {
		const here = dirname(fileURLToPath(import.meta.url));
		return JSON.parse(readFileSync(join(here, "..", "package.json"), "utf-8"))
			.version;
	} catch {
		return "unknown";
	}
}

function printHelp() {
	const w = Math.max(...Object.values(COMMANDS).map((c) => c.usage.length)) + 3;
	const lines = [
		"",
		`  ${pc.bold("audx")} ${pc.dim(`v${version()}`)}  UI sound effects you own as code`,
		"",
		`  ${pc.dim("Usage")}  ${BIN} <command> [options]`,
		"",
		`  ${pc.dim("Commands")}`,
		...Object.values(COMMANDS).map(
			(c) => `    ${c.usage.padEnd(w)}${pc.dim(c.summary)}`,
		),
		"",
		`  ${pc.dim("Global options")}`,
		`    ${"--cwd <path>".padEnd(w)}${pc.dim("Run in another directory")}`,
		`    ${"-h, --help".padEnd(w)}${pc.dim("Help for a command, e.g. add --help")}`,
		`    ${"-v, --version".padEnd(w)}${pc.dim("Print the version")}`,
		"",
		`  ${pc.dim("Get started")}`,
		`    ${BIN} init`,
		`    ${BIN} add click success error`,
		`    ${BIN} theme playful`,
		"",
		`  ${pc.dim("Browse and preview every sound at")} https://audx.site`,
		`  ${pc.dim("Guides and full reference at")}       https://docs.audx.site`,
		"",
	];
	console.log(lines.join("\n"));
}

function printCommandHelp(name: string, cmd: Command) {
	const opts = cmd.options ?? [];
	const w = Math.max(0, ...opts.map(([f]) => f.length)) + 3;
	const lines = [
		"",
		`  ${pc.bold(`audx ${name}`)}  ${pc.dim(cmd.summary)}`,
		"",
		`  ${pc.dim("Usage")}  ${BIN} ${cmd.usage}`,
	];
	if (opts.length) {
		lines.push(
			"",
			`  ${pc.dim("Options")}`,
			...opts.map(([f, d]) => `    ${f.padEnd(w)}${pc.dim(d)}`),
		);
	}
	if (cmd.examples?.length) {
		lines.push(
			"",
			`  ${pc.dim("Examples")}`,
			...cmd.examples.map((e) => `    ${BIN} ${e}`),
		);
	}
	lines.push("");
	console.log(lines.join("\n"));
}

export async function run(argv = process.argv.slice(2)) {
	try {
		const args = parseArgs(argv);
		const first = args._.shift();

		if (flag(args, "version") && !first) {
			console.log(version());
			return;
		}
		if (!first || first === "help") {
			const target = first === "help" ? args._[0] : undefined;
			const name = target ? (ALIASES[target] ?? target) : undefined;
			if (name && COMMANDS[name]) printCommandHelp(name, COMMANDS[name]);
			else printHelp();
			return;
		}

		const name = ALIASES[first] ?? first;
		const cmd = COMMANDS[name];
		if (!cmd) {
			const known = Object.keys(COMMANDS);
			const guess = known.find((k) => k.startsWith(first.slice(0, 2)));
			throw new CliError(
				`Unknown command "${first}".`,
				guess
					? `Did you mean \`audx ${guess}\`? Run \`audx --help\` for all commands.`
					: "Run `audx --help` for all commands.",
			);
		}
		if (flag(args, "help")) {
			printCommandHelp(name, cmd);
			return;
		}
		if (first === "themes") args.flags.themes = true;
		if (first === "check") args.flags.check = true;

		await cmd.run(createContext(args));
	} catch (err) {
		if (err instanceof CliError) {
			p.log.error(err.message);
			if (err.hint) p.log.message(pc.dim(err.hint));
			process.exit(1);
		}
		throw err;
	}
}
