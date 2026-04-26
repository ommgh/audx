import { readFileSync, writeFileSync } from "node:fs";

const registry = JSON.parse(readFileSync("registry.json", "utf-8"));

// Known themes from the directory structure
const KNOWN_THEMES = ["minimal", "playful"];

// Non-themed legacy items to remove entirely
const LEGACY_NON_THEMED = ["back-001", "click-001", "scroll-001"];

// Non-audio items to leave unchanged
const NON_AUDIO_TYPES = ["registry:lib", "registry:hook", "registry:ui"];

const transformedItems = [];

for (const item of registry.items) {
	// Leave non-audio items (hooks, libs, UI) unchanged
	if (NON_AUDIO_TYPES.includes(item.type)) {
		transformedItems.push(item);
		continue;
	}

	// Remove legacy non-themed items
	if (LEGACY_NON_THEMED.includes(item.name)) {
		console.log(`Removing legacy non-themed item: ${item.name}`);
		continue;
	}

	// Check if this is a themed audio item (pattern: {semantic}-{theme}-001)
	let theme = null;
	let semanticName = null;

	for (const t of KNOWN_THEMES) {
		const suffix = `-${t}-001`;
		if (item.name.endsWith(suffix)) {
			theme = t;
			semanticName = item.name.slice(0, -suffix.length);
			break;
		}
	}

	if (!theme || !semanticName) {
		// If it doesn't match any known theme pattern, check if it already has the new format
		if (item.name.startsWith("audio/")) {
			transformedItems.push(item);
			continue;
		}
		// Unknown item - skip with warning
		console.warn(`WARNING: Unknown item format, removing: ${item.name}`);
		continue;
	}

	// Capitalize first letter of semantic name for title
	const titleSemantic =
		semanticName.charAt(0).toUpperCase() + semanticName.slice(1);
	const titleTheme = theme.charAt(0).toUpperCase() + theme.slice(1);

	// Build new item
	const newItem = {
		name: `audio/${theme}/${semanticName}`,
		type: item.type,
		title: `${titleSemantic} (${titleTheme})`,
		description: item.description,
		files: [
			{
				path: `registry/audx/audio/${theme}/${semanticName}/${semanticName}.ts`,
				type: "registry:lib",
			},
			{
				path: "registry/audx/lib/audio-types.ts",
				type: "registry:lib",
			},
			{
				path: "registry/audx/lib/audio-engine.ts",
				type: "registry:lib",
			},
		],
		author: item.author,
		meta: {
			...(item.meta || {}),
			theme,
			semanticName,
		},
	};

	// Remove registryDependencies if present (should not exist on themed items)
	// (We simply don't copy it to the new item)

	transformedItems.push(newItem);
}

registry.items = transformedItems;

// Write back with tab indentation to match existing style
writeFileSync(
	"registry.json",
	JSON.stringify(registry, null, "\t") + "\n",
	"utf-8",
);

console.log(`\nTransformation complete:`);
console.log(`  Total items: ${transformedItems.length}`);
console.log(
	`  Non-audio items: ${transformedItems.filter((i) => NON_AUDIO_TYPES.includes(i.type)).length}`,
);
console.log(
	`  Audio items: ${transformedItems.filter((i) => !NON_AUDIO_TYPES.includes(i.type)).length}`,
);
