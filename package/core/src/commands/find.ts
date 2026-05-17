import * as p from "@clack/prompts";
import { fetchThemeIndex } from "./utils.js";

export async function find(args: string[]) {
	const query = args.join(" ").toLowerCase();

	p.intro("@litlab/audx find");

	const s = p.spinner();
	s.start("Fetching registry...");

	let index: Awaited<ReturnType<typeof fetchThemeIndex>>;
	try {
		index = await fetchThemeIndex();
		s.stop(`Found ${index.length} theme(es) in registry`);
	} catch (err) {
		s.stop("Failed to fetch registry.");
		p.log.error(String(err));
		process.exit(1);
	}

	if (index.length === 0) {
		p.log.warn("No themes available in the registry.");
		p.outro("");
		return;
	}

	const matches = query
		? index.filter((entry) => {
				const haystack =
					`${entry.name} ${entry.description} ${(entry.tags ?? []).join(" ")}`.toLowerCase();
				return haystack.includes(query);
			})
		: index;

	if (matches.length === 0) {
		p.log.warn(`No themes found for "${query}"`);
		p.outro("");
		return;
	}

	p.log.info("Install with npx @litlab/audx add --theme <name>");

	for (const entry of matches) {
		const tags =
			entry.tags && entry.tags.length > 0 ? `  ${entry.tags.join(", ")}` : "";
		const desc = entry.description ? `\n  ${entry.description}` : "";
		p.log.step(`${entry.name}${tags}${desc}`);
	}

	p.outro(`${matches.length} result(s)`);
}
