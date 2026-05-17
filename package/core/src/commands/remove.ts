import { unlink } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { getInstalledThemes, getThemesDir, regenerateIndex } from "./utils.js";

export interface RemoveOptions {
	yes?: boolean;
}

export function parseRemoveOptions(args: string[]): {
	themes: string[];
	options: RemoveOptions;
} {
	const options: RemoveOptions = {};
	const themes: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "-y" || arg === "--yes") {
			options.yes = true;
		} else if (arg && !arg.startsWith("-")) {
			themes.push(arg);
		}
	}

	return { themes, options };
}

export async function remove(args: string[]) {
	const { themes: themeNames, options } = parseRemoveOptions(args);

	p.intro("@litlab/audx remove");

	const themes = await getInstalledThemes();

	if (themes.length === 0) {
		p.log.warn("No themes installed.");
		p.outro("Nothing to remove.");
		return;
	}

	let files: string[];

	if (themeNames.length > 0) {
		const matched = themes.filter((pk) =>
			themeNames.some((n) => n.toLowerCase() === pk.name.toLowerCase()),
		);
		if (matched.length === 0) {
			p.log.error(`No matching themes found for: ${themeNames.join(", ")}`);
			return;
		}
		files = matched.map((pk) => pk.file);
	} else {
		const selected = await p.multiselect({
			message: "Select themes to remove",
			options: themes.map((pk) => ({
				value: pk.file,
				label: pk.name,
				hint: `${pk.soundCount} sounds`,
			})),
		});

		if (p.isCancel(selected)) {
			p.cancel("Cancelled.");
			process.exit(0);
		}

		files = selected as string[];
		if (files.length === 0) {
			p.outro("No themes selected.");
			return;
		}
	}

	if (!options.yes) {
		const confirmed = await p.confirm({
			message: `Remove ${files.length} theme(es)?`,
		});

		if (p.isCancel(confirmed) || !confirmed) {
			p.cancel("Cancelled.");
			process.exit(0);
		}
	}

	const dir = getThemesDir();
	const removed: string[] = [];

	for (const file of files) {
		try {
			await unlink(join(dir, file));
			const pk = themes.find((item) => item.file === file);
			removed.push(pk?.name ?? file);
		} catch (err) {
			p.log.warn(`Failed to remove ${file}: ${err}`);
		}
	}

	await regenerateIndex(dir);

	p.note(removed.map((n) => `  - ${n}`).join("\n"), "Removed themes");
	p.outro("Done!");
}
