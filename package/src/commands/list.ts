import * as ConfigManager from "../core/config.js";
import { fetchCatalog } from "../core/registry.js";
import type { RegistryItem } from "../types.js";

/**
 * Filter catalog items by tag — include only items whose meta.tags contains the tag.
 */
export function filterByTag(
	items: RegistryItem[],
	tag: string,
): RegistryItem[] {
	return items.filter((item) =>
		item.meta?.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()),
	);
}

/**
 * Filter catalog items by search query — case-insensitive match on name, description, or tags.
 */
export function filterBySearch(
	items: RegistryItem[],
	query: string,
): RegistryItem[] {
	const q = query.toLowerCase();
	return items.filter((item) => {
		if (item.name.toLowerCase().includes(q)) return true;
		if (item.description.toLowerCase().includes(q)) return true;
		if (item.meta?.tags?.some((t) => t.toLowerCase().includes(q))) return true;
		return false;
	});
}

/**
 * Format and print a table of registry items to stdout.
 */
function printTable(items: RegistryItem[]): void {
	if (items.length === 0) {
		console.log("No sounds found.");
		return;
	}

	// Column headers
	const headers = [
		"Name",
		"Description",
		"Duration",
		"Format",
		"Size (KB)",
		"License",
		"Tags",
	];

	// Build rows
	const rows = items.map((item) => [
		item.name,
		item.description,
		item.meta?.duration != null ? `${item.meta.duration}s` : "-",
		item.meta?.format ?? "-",
		item.meta?.sizeKb != null ? String(item.meta.sizeKb) : "-",
		item.meta?.license ?? "-",
		item.meta?.tags?.join(", ") ?? "-",
	]);

	// Compute column widths
	const colWidths = headers.map((h, i) =>
		Math.max(h.length, ...rows.map((r) => r[i].length)),
	);

	// Print header
	const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join("  ");
	const separator = colWidths.map((w) => "-".repeat(w)).join("  ");
	console.log(headerLine);
	console.log(separator);

	// Print rows
	for (const row of rows) {
		console.log(row.map((cell, i) => cell.padEnd(colWidths[i])).join("  "));
	}
}

export async function listCommand(
	projectRoot: string,
	options: { tag?: string; search?: string },
): Promise<void> {
	// Read config to get registryUrl
	if (!ConfigManager.exists(projectRoot)) {
		console.error("Configuration not found. Run 'audx init' first.");
		process.exit(1);
	}

	const config = ConfigManager.read(projectRoot);

	let catalog;
	try {
		catalog = await fetchCatalog(config.registryUrl);
	} catch (error) {
		// Requirement 4.5 — handle fetch failures
		const message = error instanceof Error ? error.message : String(error);
		console.error(`✘ ${message}`);
		process.exit(2);
	}

	let items = catalog.items;

	// Requirement 4.3 — tag filter
	if (options.tag) {
		items = filterByTag(items, options.tag);
	}

	// Requirement 4.4 — search filter
	if (options.search) {
		items = filterBySearch(items, options.search);
	}

	// Requirement 4.2 — display formatted table
	printTable(items);
}
