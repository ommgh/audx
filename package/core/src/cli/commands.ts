import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { getSoundInfo, SOUND_CATEGORIES, STARTER_SOUNDS } from "../catalog.js";
import type { SoundPatch } from "../types.js";
import { CliError, flag, value } from "./args.js";
import {
	renderSoundModule,
	soundFileExists,
	toFileName,
	toIdentifier,
	writeIndex,
	writeSoundFile,
} from "./codegen.js";
import {
	assertKnownSounds,
	type Ctx,
	ensureDependency,
	ensureSetup,
	ext,
	getTheme,
	guard,
	pickSounds,
	usageNote,
} from "./context.js";
import {
	customizeDefinition,
	decodeSoundCustomization,
	decodeSoundDefinition,
	validateSoundDefinition,
} from "./customize.js";
import {
	type Config,
	listInstalled,
	soundsDir,
	writeConfig,
} from "./project.js";
import { sourceKind, themeIndexOrBuiltIns } from "./registry.js";

// ─── init ────────────────────────────────────────────────────────────────────

export async function init(ctx: Ctx) {
	p.intro(pc.inverse(" audx init "));

	if (ctx.project.config) {
		p.log.info(
			`Already set up ${pc.dim(`(audx.json · theme: ${ctx.project.config.theme} · dir: ${ctx.project.config.dir})`)}`,
		);
		ensureDependency(ctx);
	}

	const config = await ensureSetup(ctx);
	const theme = await getTheme(ctx, config.theme);
	const installed = new Set(
		listInstalled(ctx.project, config).map((s) => s.sound),
	);

	const names = ctx.interactive
		? await pickSounds(theme, {
				installed,
				initial: installed.size ? [] : STARTER_SOUNDS,
				message: "Which sounds do you want to start with?",
			})
		: STARTER_SOUNDS.filter((n) => n in theme.sounds && !installed.has(n));

	if (names.length === 0) {
		p.outro(
			`Add sounds any time with ${pc.cyan("npx @litlab/audx add <sound>")}`,
		);
		return;
	}

	const written = await writeSounds(ctx, config, theme, config.theme, names);
	finish(ctx, config, written);
}

// ─── add ─────────────────────────────────────────────────────────────────────

export async function add(ctx: Ctx) {
	p.intro(pc.inverse(" audx add "));

	const config = await ensureSetup(ctx);
	const themeSource = value(ctx.args, "theme") ?? config.theme;
	const theme = await getTheme(ctx, themeSource);
	const available = Object.keys(theme.sounds);
	const installed = new Set(
		listInstalled(ctx.project, config).map((s) => s.sound),
	);

	const tune = value(ctx.args, "tune");
	const data = value(ctx.args, "data");
	let names = ctx.args._.map((n) => n.toLowerCase());

	if (flag(ctx.args, "all")) {
		names = available;
	} else if (names.length === 0) {
		if (!ctx.interactive) {
			throw new CliError(
				"Which sounds? Pass names or --all.",
				"e.g. `npx @litlab/audx add click success error`",
			);
		}
		names = await pickSounds(theme, {
			installed,
			initial: [],
			message: `Pick sounds from ${theme.name}`,
		});
		if (names.length === 0) {
			p.outro("Nothing selected.");
			return;
		}
	}

	if ((tune || data) && names.length !== 1) {
		throw new CliError("--tune and --data customize exactly one sound.");
	}

	if (!data) assertKnownSounds(names, available, theme.name);

	let custom: Record<string, unknown> | undefined;
	if (tune) {
		const settings = decodeSoundCustomization(tune);
		custom = {
			[names[0]]: customizeDefinition(theme.sounds[names[0]], settings),
		};
	} else if (data) {
		const def = decodeSoundDefinition(data);
		if (!validateSoundDefinition(def)) {
			throw new CliError("The --data payload is not a valid sound definition.");
		}
		custom = { [names[0]]: def };
	}

	const written = await writeSounds(
		ctx,
		config,
		theme,
		themeSource,
		names,
		custom,
	);
	finish(ctx, config, written);
}

// ─── remove ──────────────────────────────────────────────────────────────────

export async function remove(ctx: Ctx) {
	p.intro(pc.inverse(" audx remove "));

	const config = requireConfig(ctx);
	const installed = listInstalled(ctx.project, config);
	if (installed.length === 0) {
		p.outro(`No sounds installed in ${config.dir}.`);
		return;
	}

	let names = ctx.args._.map((n) => n.toLowerCase());

	if (flag(ctx.args, "all")) {
		names = installed.map((s) => s.sound);
	} else if (names.length === 0) {
		if (!ctx.interactive)
			throw new CliError("Which sounds? Pass names or --all.");
		names = guard(
			await p.multiselect({
				message: `Remove which sounds? ${pc.dim("(space to toggle)")}`,
				options: installed.map((s) => ({
					value: s.sound,
					label: s.sound,
					hint: s.theme,
				})),
				required: false,
			}),
		) as string[];
		if (names.length === 0) {
			p.outro("Nothing removed.");
			return;
		}
	}

	assertKnownSounds(
		names,
		installed.map((s) => s.sound),
		config.dir,
	);

	const dir = soundsDir(ctx.project, config);
	for (const name of names) {
		const file = soundFileExists(dir, name);
		if (file) unlinkSync(join(dir, file));
	}
	writeIndex(dir, ext(ctx));

	p.log.success(`Removed ${names.map((n) => pc.bold(n)).join(", ")}`);
	p.outro("Done. Remember to delete any imports of them.");
}

// ─── list ────────────────────────────────────────────────────────────────────

export async function list(ctx: Ctx) {
	if (flag(ctx.args, "themes")) return listThemes(ctx);

	const config = ctx.project.config;
	const themeSource = value(ctx.args, "theme") ?? config?.theme ?? "minimal";
	const theme = await getTheme({ ...ctx, interactive: false }, themeSource);
	const installed = new Set(
		config ? listInstalled(ctx.project, config).map((s) => s.sound) : [],
	);
	const query = ctx.args._.join(" ").toLowerCase();

	const rows = Object.keys(theme.sounds)
		.map((name) => ({ name, info: getSoundInfo(name) }))
		.filter(
			({ name, info }) =>
				!query ||
				name.includes(query) ||
				info?.category.includes(query) ||
				info?.description.toLowerCase().includes(query),
		);

	console.log();
	console.log(
		`  ${pc.bold(theme.name)} ${pc.dim(`· ${Object.keys(theme.sounds).length} sounds${config ? ` · ${installed.size} installed` : ""}`)}`,
	);
	if (theme.description) console.log(`  ${pc.dim(theme.description)}`);

	if (rows.length === 0) {
		console.log(`\n  No sounds match "${query}".\n`);
		return;
	}

	const width = Math.max(...rows.map((r) => r.name.length)) + 2;
	const groups = [...SOUND_CATEGORIES.map((c) => c.name as string), "other"];
	for (const group of groups) {
		const items = rows.filter((r) => (r.info?.category ?? "other") === group);
		if (items.length === 0) continue;
		const label =
			SOUND_CATEGORIES.find((c) => c.name === group)?.label ?? "Other";
		console.log(`\n  ${pc.dim(label.toUpperCase())}`);
		for (const { name, info } of items) {
			const mark = installed.has(name) ? pc.green("●") : pc.dim("○");
			console.log(
				`  ${mark} ${name.padEnd(width)}${pc.dim(info?.description ?? "")}`,
			);
		}
	}
	console.log();
	console.log(
		pc.dim(
			`  ${pc.green("●")} installed   add with: npx @litlab/audx add <sound>   preview at https://audx.site`,
		),
	);
	console.log();
}

async function listThemes(ctx: Ctx) {
	const { themes, offline } = await themeIndexOrBuiltIns(ctx.registry);
	const current = ctx.project.config?.theme;
	const width = Math.max(...themes.map((t) => t.name.length)) + 2;
	console.log();
	for (const t of themes) {
		const mark = t.name === current ? pc.green("●") : pc.dim("○");
		console.log(
			`  ${mark} ${t.name.padEnd(width)}${pc.dim(`${String(t.soundCount).padStart(3)} sounds  ${t.description}`)}`,
		);
	}
	console.log();
	if (offline)
		console.log(pc.yellow("  Offline: showing built-in themes only.\n"));
	console.log(
		pc.dim(
			"  Switch every installed sound with: npx @litlab/audx theme <name>\n",
		),
	);
}

// ─── theme ───────────────────────────────────────────────────────────────────

export async function theme(ctx: Ctx) {
	const target = ctx.args._[0];
	if (!target) {
		if (ctx.project.config) {
			console.log(`\n  Current theme: ${pc.bold(ctx.project.config.theme)}`);
		}
		return listThemes(ctx);
	}

	p.intro(pc.inverse(" audx theme "));
	const config = await ensureSetup(ctx);
	const next = await getTheme(ctx, target);
	const installed = listInstalled(ctx.project, config);

	const swap = installed.filter((s) => !s.custom || flag(ctx.args, "force"));
	const kept = installed.filter((s) => s.custom && !flag(ctx.args, "force"));
	const missing = swap.filter((s) => !(s.sound in next.sounds));
	const switching = swap.filter((s) => s.sound in next.sounds);

	const dir = soundsDir(ctx.project, config);
	for (const s of switching) {
		writeSoundFile(dir, ext(ctx), {
			sound: s.sound,
			theme: target,
			definition: next.sounds[s.sound],
		});
	}
	if (switching.length) writeIndex(dir, ext(ctx));

	writeConfig(ctx.cwd, { ...config, theme: target });

	if (switching.length) {
		p.log.success(
			`Switched ${switching.length} sounds to ${pc.bold(next.name)}. No code changes needed.`,
		);
	} else {
		p.log.success(`New sounds will come from ${pc.bold(next.name)}.`);
	}
	if (kept.length) {
		p.log.info(
			`Kept ${kept.length} customized: ${kept.map((s) => s.sound).join(", ")} ${pc.dim("(--force to replace)")}`,
		);
	}
	if (missing.length) {
		p.log.warn(
			`${next.name} has no ${missing.map((s) => s.sound).join(", ")}; left unchanged.`,
		);
	}
	p.outro("Done.");
}

// ─── update ──────────────────────────────────────────────────────────────────

export async function update(ctx: Ctx, opts: { check?: boolean } = {}) {
	const check = opts.check || flag(ctx.args, "check");
	p.intro(pc.inverse(check ? " audx check " : " audx update "));

	const config = requireConfig(ctx);
	const installed = listInstalled(ctx.project, config).filter((s) => !s.custom);
	if (installed.length === 0) {
		p.outro("No sounds to update.");
		return;
	}

	const dir = soundsDir(ctx.project, config);
	const changed: string[] = [];
	const byTheme = new Map<string, typeof installed>();
	for (const s of installed)
		byTheme.set(s.theme, [...(byTheme.get(s.theme) ?? []), s]);

	for (const [source, sounds] of byTheme) {
		const t = await getTheme(ctx, source);
		for (const s of sounds) {
			const def = t.sounds[s.sound];
			if (!def) continue;
			const next = renderSoundModule({
				sound: s.sound,
				theme: source,
				definition: def,
			});
			const file = join(dir, `${s.file}.${ext(ctx)}`);
			const current = existsSync(file) ? readFileSync(file, "utf-8") : "";
			if (current === next) continue;
			changed.push(s.sound);
			if (!check) writeFileSync(file, next, "utf-8");
		}
	}

	if (changed.length === 0) {
		p.outro(`All ${installed.length} sounds are up to date.`);
	} else if (check) {
		p.log.info(`${changed.length} can be updated: ${changed.join(", ")}`);
		p.outro(`Run ${pc.cyan("npx @litlab/audx update")} to pull them.`);
	} else {
		writeIndex(dir, ext(ctx));
		p.outro(`Updated ${changed.length}: ${changed.join(", ")}`);
	}
}

// ─── create ──────────────────────────────────────────────────────────────────

export async function create(ctx: Ctx) {
	p.intro(pc.inverse(" audx create "));

	let name = ctx.args._[0];
	if (!name) {
		if (!ctx.interactive)
			throw new CliError("Name your theme: `audx create my-theme`.");
		name = guard(
			await p.text({
				message: "Theme name",
				placeholder: "my-theme",
				validate: (v) =>
					toFileName(v) ? undefined : "Use letters and numbers",
			}),
		);
	}

	const from =
		value(ctx.args, "from") ?? ctx.project.config?.theme ?? "minimal";
	const base = await getTheme(ctx, from);
	const slug = toFileName(name);
	const dir = join(ctx.cwd, "audx", "themes");
	const file = join(dir, `${slug}.json`);

	if (existsSync(file) && !flag(ctx.args, "overwrite")) {
		throw new CliError(
			`${relative(ctx.cwd, file)} already exists.`,
			"Pass --overwrite to replace it.",
		);
	}

	mkdirSync(dir, { recursive: true });
	const patch: SoundPatch = {
		$schema: "../../node_modules/@litlab/audx/schemas/theme.schema.json",
		name: slug,
		description: `Based on ${base.name}.`,
		version: "1.0.0",
		tags: [],
		sounds: base.sounds,
	};
	writeFileSync(file, `${JSON.stringify(patch, null, "\t")}\n`, "utf-8");

	const rel = `./${relative(ctx.cwd, file)}`;
	p.log.success(`Created ${pc.bold(rel)} from ${base.name}`);
	p.note(
		[
			"Tweak any sound in the JSON (your editor autocompletes it), then:",
			"",
			`  npx @litlab/audx theme ${rel}`,
		].join("\n"),
		"Next",
	);
	p.outro("Happy sound designing.");
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function requireConfig(ctx: Ctx): Config {
	if (!ctx.project.config) {
		throw new CliError(
			"audx isn't set up here yet.",
			"Run `npx @litlab/audx init` (or `add <sound>`) first.",
		);
	}
	return ctx.project.config;
}

async function writeSounds(
	ctx: Ctx,
	config: Config,
	theme: SoundPatch,
	themeSource: string,
	names: string[],
	custom?: Record<string, unknown>,
): Promise<string[]> {
	const dir = soundsDir(ctx.project, config);
	const overwrite = flag(ctx.args, "overwrite") || !!custom;
	const existing = names.filter((n) => soundFileExists(dir, n));
	let skip = new Set<string>();

	if (existing.length && !overwrite) {
		if (ctx.interactive) {
			const ok = guard(
				await p.confirm({
					message: `${existing.join(", ")} ${existing.length === 1 ? "is" : "are"} already installed. Overwrite?`,
					initialValue: false,
				}),
			);
			if (!ok) skip = new Set(existing);
		} else {
			skip = new Set(existing);
			p.log.warn(
				`Skipped ${existing.join(", ")} (already installed; --overwrite to replace)`,
			);
		}
	}

	const recorded =
		sourceKind(themeSource) === "file"
			? `./${relative(ctx.cwd, join(ctx.cwd, themeSource))}`
			: themeSource;

	const written: string[] = [];
	for (const name of names) {
		if (skip.has(name)) continue;
		writeSoundFile(dir, ext(ctx), {
			sound: name,
			theme: recorded,
			definition: custom?.[name] ?? theme.sounds[name],
			custom: !!custom,
		});
		written.push(name);
	}
	if (written.length) writeIndex(dir, ext(ctx));
	return written;
}

function finish(ctx: Ctx, config: Config, written: string[]) {
	if (written.length === 0) {
		p.outro("Nothing to do.");
		return;
	}
	p.log.success(
		`Added ${written.length} ${written.length === 1 ? "sound" : "sounds"} to ${pc.bold(config.dir)}  ${pc.dim(written.join(" "))}`,
	);
	usageNote(ctx, config, written, written.map(toIdentifier));
	p.outro(
		`Swap the whole set any time: ${pc.cyan("npx @litlab/audx theme playful")}`,
	);
}
