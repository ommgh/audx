import * as p from "@clack/prompts";
import { fetchThemeIndex, getInstalledThemes } from "./utils.js";

export async function check(_args: string[]) {
	p.intro("@litlab/audx check");

	const installed = await getInstalledThemes();

	if (installed.length === 0) {
		p.log.warn("No themes installed.");
		p.outro("Install themes with npx @litlab/audx add");
		return;
	}

	const s = p.spinner();
	s.start("Checking for updates...");

	let registry: Awaited<ReturnType<typeof fetchThemeIndex>>;
	try {
		registry = await fetchThemeIndex();
		s.stop(`Checked ${registry.length} registry theme(es)`);
	} catch (err) {
		s.stop("Failed to fetch registry.");
		p.log.error(String(err));
		process.exit(1);
	}

	const registryMap = new Map(registry.map((e) => [e.name.toLowerCase(), e]));

	const available: string[] = [];
	const notInRegistry: string[] = [];

	for (const entry of installed) {
		const regEntry = registryMap.get(entry.name.toLowerCase());
		if (regEntry) {
			available.push(entry.name);
		} else {
			notInRegistry.push(entry.name);
		}
	}

	if (available.length === 0) {
		p.log.warn("No installed themes found in the registry.");
		p.outro("");
		return;
	}

	p.note(
		available.map((name) => `  ↑ ${name}`).join("\n"),
		`${available.length} theme(es) available`,
	);

	if (notInRegistry.length > 0) {
		p.log.warn(
			[
				`${notInRegistry.length} theme(es) not found in registry:`,
				...notInRegistry.map((name) => `  • ${name}`),
			].join("\n"),
		);
	}

	p.outro("Run npx @litlab/audx update to re-download latest versions");
}
