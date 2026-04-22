import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { CATEGORIES } from "@/lib/theme-data";

const WHITESPACE_RE = /\s+/;

export function filterAudio(
	items: AudioCatalogItem[],
	query: string,
	theme?: string,
	category?: string,
): AudioCatalogItem[] {
	let filtered = items;

	if (theme) {
		filtered = filtered.filter((item) => item.meta.theme === theme);
	}

	if (category) {
		filtered = filtered.filter((item) => {
			const semanticName = item.meta.semanticName;
			if (!semanticName) return false;
			const derived = CATEGORIES[semanticName] ?? "interaction";
			return derived === category;
		});
	}

	const normalized = query.trim().toLowerCase();
	if (!normalized) return filtered;

	return filtered.filter((item) => {
		const searchableText = [
			item.name,
			item.title,
			item.description,
			item.meta.tags.join(" "),
			item.meta.keywords.join(" "),
		]
			.join(" ")
			.toLowerCase();

		const terms = normalized.split(WHITESPACE_RE).filter(Boolean);
		return terms.every((term) => searchableText.includes(term));
	});
}
