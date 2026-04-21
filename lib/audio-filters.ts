import type { AudioCatalogItem } from "@/lib/audio-catalog";

const WHITESPACE_RE = /\s+/;

export function filterAudio(
	items: AudioCatalogItem[],
	query: string,
): AudioCatalogItem[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return items;

	return items.filter((item) => {
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
