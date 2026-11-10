import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { getSoundInfo, SOUND_CATEGORIES } from "../catalog.js";
import type { SoundPatch } from "../types.js";
import { CliError, flag, type ParsedArgs, value } from "./args.js";
import {
	type Config,
	DEFAULT_THEME,
	defaultDir,
	detectPackageManager,
	hasDependency,
	hasPackageJson,
	importPathFor,
	installCommand,
	loadProject,
	type Project,
	writeConfig,
} from "./project.js";
import {
	closest,
	loadTheme,
	registryUrl,
	sourceKind,
	themeIndexOrBuiltIns,
} from "./registry.js";

export const PACKAGE = "@litlab/audx";

export type Ctx = {
	args: ParsedArgs;
	cwd: string;
	project: Project;
	/** Prompts are allowed (TTY, not CI, no --yes). */
	interactive: boolean;
	yes: boolean;
	registry: string;
};

export function createContext(args: ParsedArgs): Ctx {
	const cwd = resolve(process.cwd(), value(args, "cwd") ?? ".");
	const project = loadProject(cwd);
	const yes = flag(args, "yes");
	const interactive =
		!yes &&
		!process.env.CI &&
		process.stdin.isTTY === true &&
		process.stdout.isTTY === true;
	return {
		args,
		cwd,
		project,
		interactive,
		yes,
		registry: registryUrl(project.config?.registry),
	};
}

/** Unwraps a prompt result, exiting cleanly on Ctrl+C. */
export function guard<T>(result: T | symbol): T {
	if (p.isCancel(result)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}
	return result as T;
}

export function ext(ctx: Ctx): "ts" | "js" {
	return ctx.project.typescript ? "ts" : "js";
}

export function themeLabel(source: string): string {
	return sourceKind(source) === "registry" ? source : pc.dim(source);
}

export async function getTheme(ctx: Ctx, source: string): Promise<SoundPatch> {
	const s = ctx.interactive ? p.spinner() : null;
	s?.start(`Loading ${source}`);
	try {
		const theme = await loadTheme(source, {
			cwd: ctx.cwd,
			registry: ctx.registry,
		});
		s?.stop(
			`Loaded ${pc.bold(theme.name)} ${pc.dim(`(${Object.keys(theme.sounds).length} sounds)`)}`,
		);
		return theme;
	} catch (err) {
		s?.stop(`Couldn't load ${source}`, 1);
		throw err;
	}
}

/**
 * Returns the project's config, creating `audx.json` on first use. Asks for
 * the directory and theme when prompts are allowed, otherwise uses defaults.
 */
export async function ensureSetup(ctx: Ctx): Promise<Config> {
	if (ctx.project.config) return ctx.project.config;

	if (!hasPackageJson(ctx.cwd)) {
		p.log.warn(
			`No package.json in ${pc.dim(ctx.cwd)}. Run audx from your app's root, or pass --cwd.`,
		);
	}

	let dir = value(ctx.args, "dir") ?? defaultDir(ctx.cwd);
	let theme = value(ctx.args, "theme") ?? DEFAULT_THEME;

	if (ctx.interactive) {
		dir = guard(
			await p.text({
				message: "Where should sound files go?",
				initialValue: dir,
				validate: (v) => (v.trim() ? undefined : "Pick a directory"),
			}),
		).trim();

		if (!value(ctx.args, "theme")) {
			const { themes } = await themeIndexOrBuiltIns(ctx.registry);
			theme = guard(
				await p.select({
					message: "Pick a theme (you can switch anytime with `audx theme`)",
					initialValue: DEFAULT_THEME,
					options: themes.map((t) => ({
						value: t.name,
						label: t.name,
						hint: t.description,
					})),
				}),
			);
		}
	}

	const config: Config = { theme, dir: dir.replace(/\/+$/, "") };
	writeConfig(ctx.cwd, config);
	ctx.project.config = config;
	p.log.success(
		`Created ${pc.bold("audx.json")} ${pc.dim(`theme: ${theme} · dir: ${config.dir}`)}`,
	);

	ensureDependency(ctx);
	return config;
}

/** Makes sure `@litlab/audx` is installed — generated files import it. */
export function ensureDependency(ctx: Ctx) {
	if (!hasPackageJson(ctx.cwd) || hasDependency(ctx.cwd, PACKAGE)) return;
	if (flag(ctx.args, "no-install")) return;

	const pm = detectPackageManager(ctx.cwd);
	const cmd = installCommand(pm, PACKAGE);

	if (!ctx.yes && !ctx.interactive) {
		p.log.info(
			`Generated files import ${PACKAGE}. Install it with: ${pc.cyan(cmd.join(" "))}`,
		);
		return;
	}

	p.log.step(`Installing ${PACKAGE} ${pc.dim(`(${cmd.join(" ")})`)}`);
	const result = spawnSync(cmd[0], cmd.slice(1), {
		cwd: ctx.cwd,
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.status !== 0) {
		p.log.warn(`Install failed. Run it yourself: ${pc.cyan(cmd.join(" "))}`);
	}
}

/** A grouped, searchable-by-eye picker of every sound in a theme. */
export async function pickSounds(
	theme: SoundPatch,
	opts: { installed: Set<string>; initial: string[]; message: string },
): Promise<string[]> {
	const groups: Record<
		string,
		{ value: string; label: string; hint?: string }[]
	> = {};
	const labelFor = new Map<string, string>(
		SOUND_CATEGORIES.map((c) => [c.name, c.label]),
	);

	for (const name of Object.keys(theme.sounds)) {
		const info = getSoundInfo(name);
		const group = labelFor.get(info?.category ?? "") ?? "Other";
		groups[group] ??= [];
		groups[group].push({
			value: name,
			label: opts.installed.has(name)
				? `${name} ${pc.dim("(installed)")}`
				: name,
			hint: info?.description,
		});
	}

	const ordered: typeof groups = {};
	for (const c of SOUND_CATEGORIES)
		if (groups[c.label]) ordered[c.label] = groups[c.label];
	if (groups.Other) ordered.Other = groups.Other;

	const picked = guard(
		await p.groupMultiselect({
			message: `${opts.message} ${pc.dim("(space to toggle, enter to confirm)")}`,
			options: ordered,
			initialValues: opts.initial.filter((n) => n in theme.sounds),
			required: false,
		}),
	);
	return picked as string[];
}

export function usageNote(
	ctx: Ctx,
	config: Config,
	sounds: string[],
	ids: string[],
) {
	const from = importPathFor(ctx.cwd, config.dir);
	const shown = ids.slice(0, 3);
	const lines = [
		`import { ${shown.join(", ")} } from "${from}";`,
		"",
		`${shown[0]}();`,
		"",
		pc.dim("// in React, respects <SoundProvider> and reduced motion"),
		`import { useSound } from "${PACKAGE}/react";`,
		`const play = useSound(${shown[0]});`,
	];
	p.note(lines.join("\n"), sounds.length === 1 ? "Use it" : "Use them");
}

export function assertKnownSounds(
	names: string[],
	available: string[],
	themeName: string,
) {
	const unknown = names.filter((n) => !available.includes(n));
	if (unknown.length === 0) return;
	const lines = unknown.map((n) => {
		const guess = closest(n, available);
		return guess ? `"${n}" (did you mean "${guess}"?)` : `"${n}"`;
	});
	throw new CliError(
		`${themeName} has no ${unknown.length === 1 ? "sound" : "sounds"} named ${lines.join(", ")}.`,
		"Run `audx list` to see every sound.",
	);
}
