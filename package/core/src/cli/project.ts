import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { CliError } from "./args.js";

export const CONFIG_FILE = "audx.json";
export const DEFAULT_THEME = "minimal";

export type Config = {
	/** Theme new sounds are pulled from: a registry name, URL or path. */
	theme: string;
	/** Where sound modules are written, relative to the project root. */
	dir: string;
	/** Override the registry (mostly for local development). */
	registry?: string;
};

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type Project = {
	cwd: string;
	config: Config | null;
	typescript: boolean;
};

export function loadProject(cwd: string): Project {
	return {
		cwd,
		config: readConfig(cwd),
		typescript:
			existsSync(join(cwd, "tsconfig.json")) ||
			hasDependency(cwd, "typescript"),
	};
}

export function readConfig(cwd: string): Config | null {
	const file = join(cwd, CONFIG_FILE);
	if (!existsSync(file)) return null;
	let raw: Record<string, unknown>;
	try {
		raw = JSON.parse(readFileSync(file, "utf-8"));
	} catch (err) {
		throw new CliError(
			`Couldn't parse ${CONFIG_FILE}: ${(err as Error).message}`,
		);
	}
	return {
		theme: typeof raw.theme === "string" ? raw.theme : DEFAULT_THEME,
		dir: typeof raw.dir === "string" ? raw.dir : defaultDir(cwd),
		...(typeof raw.registry === "string" ? { registry: raw.registry } : {}),
	};
}

export function writeConfig(cwd: string, config: Config) {
	const data = {
		$schema: "https://audx.site/schemas/config.json",
		...config,
	};
	writeFileSync(
		join(cwd, CONFIG_FILE),
		`${JSON.stringify(data, null, 2)}\n`,
		"utf-8",
	);
}

export function defaultDir(cwd: string): string {
	if (existsSync(join(cwd, "src"))) return "src/sounds";
	if (existsSync(join(cwd, "lib"))) return "lib/sounds";
	return "sounds";
}

function readPackageJson(cwd: string): Record<string, unknown> | null {
	const file = join(cwd, "package.json");
	if (!existsSync(file)) return null;
	try {
		return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		return null;
	}
}

export function hasPackageJson(cwd: string) {
	return readPackageJson(cwd) !== null;
}

export function hasDependency(cwd: string, name: string): boolean {
	const pkg = readPackageJson(cwd);
	if (!pkg) return false;
	for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
		const deps = pkg[field] as Record<string, string> | undefined;
		if (deps && name in deps) return true;
	}
	return false;
}

export function detectPackageManager(cwd: string): PackageManager {
	const agent = process.env.npm_config_user_agent ?? "";
	const lockfiles: [string, PackageManager][] = [
		["bun.lock", "bun"],
		["bun.lockb", "bun"],
		["pnpm-lock.yaml", "pnpm"],
		["yarn.lock", "yarn"],
		["package-lock.json", "npm"],
	];
	for (const [file, pm] of lockfiles) {
		if (existsSync(join(cwd, file))) return pm;
	}
	if (agent.startsWith("bun")) return "bun";
	if (agent.startsWith("pnpm")) return "pnpm";
	if (agent.startsWith("yarn")) return "yarn";
	return "npm";
}

export function installCommand(pm: PackageManager, pkg: string): string[] {
	return pm === "npm" ? ["npm", "install", pkg] : [pm, "add", pkg];
}

/** Removes comments and trailing commas so tsconfig files parse as JSON. */
export function parseJsonc(text: string): unknown {
	let out = "";
	let inString = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inString) {
			out += c;
			if (c === "\\") out += text[++i] ?? "";
			else if (c === '"') inString = false;
			continue;
		}
		if (c === '"') {
			inString = true;
			out += c;
		} else if (c === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			out += "\n";
		} else if (c === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i++;
		} else {
			out += c;
		}
	}
	return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

/**
 * The import specifier users should write for the sounds directory, using a
 * tsconfig/jsconfig path alias when one covers it (e.g. `@/sounds`).
 */
export function importPathFor(cwd: string, dir: string): string {
	const normalizedDir = dir.replace(/^\.\//, "").replace(/\/+$/, "");
	for (const file of ["tsconfig.json", "jsconfig.json"]) {
		const path = join(cwd, file);
		if (!existsSync(path)) continue;
		try {
			const json = parseJsonc(readFileSync(path, "utf-8")) as {
				compilerOptions?: {
					baseUrl?: string;
					paths?: Record<string, string[]>;
				};
			};
			const opts = json.compilerOptions ?? {};
			const base = resolve(cwd, opts.baseUrl ?? ".");
			for (const [alias, targets] of Object.entries(opts.paths ?? {})) {
				if (!alias.endsWith("/*")) continue;
				for (const target of targets) {
					if (target !== "*" && !target.endsWith("/*")) continue;
					const targetDir = relative(cwd, resolve(base, target.slice(0, -1)));
					const prefix = targetDir === "" ? "" : `${targetDir}/`;
					if (normalizedDir.startsWith(prefix)) {
						return `${alias.slice(0, -2)}/${normalizedDir.slice(prefix.length)}`;
					}
				}
			}
		} catch {
			// unreadable tsconfig — fall through to a relative hint
		}
	}
	return `./${normalizedDir}`;
}

export type InstalledSound = {
	/** File name without extension, e.g. `click`. */
	file: string;
	sound: string;
	theme: string;
	custom: boolean;
};

const HEADER_RE = /^\/\/ @audx (\{.*\})$/m;

export function soundsDir(project: Project, config: Config): string {
	return resolve(project.cwd, config.dir);
}

export function listInstalled(
	project: Project,
	config: Config,
): InstalledSound[] {
	const dir = soundsDir(project, config);
	if (!existsSync(dir)) return [];
	const out: InstalledSound[] = [];
	for (const file of readdirSync(dir)) {
		const m = file.match(/^(.+)\.(ts|js)$/);
		if (!m || m[1] === "index") continue;
		try {
			const header = readFileSync(join(dir, file), "utf-8").match(HEADER_RE);
			if (!header) continue;
			const meta = JSON.parse(header[1]) as {
				theme?: string;
				sound?: string;
				custom?: boolean;
			};
			if (!meta.sound) continue;
			out.push({
				file: m[1],
				sound: meta.sound,
				theme: meta.theme ?? DEFAULT_THEME,
				custom: meta.custom === true,
			});
		} catch {
			// not ours
		}
	}
	return out.sort((a, b) => a.sound.localeCompare(b.sound));
}
