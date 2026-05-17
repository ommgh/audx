import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import {
	fetchThemeIndex,
	fetchThemeJson,
	generateModule,
	getInstalledThemes,
	getThemesDir,
	regenerateIndex,
	validateTheme,
} from "./utils.js";

export async function update(_args: string[]) {
	p.intro("@litlab/audx update");

	const installed = await getInstalledThemes();

	if (installed.length === 0) {
		p.log.warn("No themes installed.");
		p.outro("Install themes with npx @litlab/audx add");
		return;
	}

	const s = p.spinner();
	s.start("Fetching registry...");

	let registry: Awaited<ReturnType<typeof fetchThemeIndex>>;
	try {
		registry = await fetchThemeIndex();
		s.stop(`Found ${registry.length} registry theme(es)`);
	} catch (err) {
		s.stop("Failed to fetch registry.");
		p.log.error(String(err));
		process.exit(1);
	}

	const registryMap = new Map(registry.map((e) => [e.name.toLowerCase(), e]));

	const toUpdate = installed.filter((pk) =>
		registryMap.has(pk.name.toLowerCase()),
	);

	if (toUpdate.length === 0) {
		p.log.warn("No installed themes found in the registry.");
		p.outro("");
		return;
	}

	const dl = p.spinner();
	dl.start(`Updating ${toUpdate.length} theme(es)...`);

	let successCount = 0;
	let failCount = 0;

	const dir = getThemesDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	for (const entry of toUpdate) {
		try {
			const data = await fetchThemeJson(entry.name);
			if (!validateTheme(data)) {
				failCount++;
				continue;
			}

			const slug = entry.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

			const moduleSource = generateModule(
				data as { name: string; sounds: Record<string, unknown> },
			);
			const target = join(dir, `${slug}.ts`);
			await writeFile(target, moduleSource, "utf-8");
			successCount++;
		} catch {
			failCount++;
		}
	}

	await regenerateIndex(dir);

	dl.stop(`Updated ${successCount} theme(es)`);

	if (failCount > 0) {
		p.log.warn(`Failed to update ${failCount} theme(es)`);
	}

	p.outro("Done!");
}
