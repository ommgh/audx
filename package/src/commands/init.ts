import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { detectPackageManager } from "../core/package-manager.js";
import type { AudxConfig } from "../types.js";

const AVAILABLE_THEMES = ["minimal", "playful"] as const;

/**
 * Prompt the user with a yes/no question via stdin/stdout.
 * Returns `true` when the user answers y/yes (case-insensitive).
 */
function confirm(question: string): Promise<boolean> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(/^y(es)?$/i.test(answer.trim()));
		});
	});
}

/**
 * Prompt the user to select a theme from the available themes list.
 * Displays a numbered list and returns the selected theme name.
 */
function selectTheme(): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		console.log("\nAvailable themes:");
		for (let i = 0; i < AVAILABLE_THEMES.length; i++) {
			console.log(`  ${i + 1}. ${AVAILABLE_THEMES[i]}`);
		}
		rl.question("\nSelect a theme (number): ", (answer) => {
			rl.close();
			const index = Number.parseInt(answer.trim(), 10) - 1;
			if (index >= 0 && index < AVAILABLE_THEMES.length) {
				resolve(AVAILABLE_THEMES[index]);
			} else {
				// Default to first theme on invalid input
				resolve(AVAILABLE_THEMES[0]);
			}
		});
	});
}

/**
 * Build default alias values from the detected alias map.
 * If the tsconfig defines a wildcard alias like `@/*`, use `@/lib`, `@/hooks`, `@/sounds`.
 * Otherwise fall back to relative directory paths.
 */
function resolveAliases(aliasMap: ReturnType<typeof loadFromTsConfig>): {
	lib: string;
	hooks: string;
	sounds: string;
} {
	if (aliasMap.hasAliases) {
		for (const pattern of aliasMap.patterns) {
			if (pattern.alias.endsWith("/*") && pattern.paths.length > 0) {
				const prefix = pattern.alias.slice(0, -1); // "@/*" → "@/"
				return {
					lib: `${prefix}lib`,
					hooks: `${prefix}hooks`,
					sounds: `${prefix}sounds`,
				};
			}
		}
	}

	return {
		lib: "src/lib",
		hooks: "src/hooks",
		sounds: "src/sounds",
	};
}

export async function initCommand(projectRoot: string): Promise<void> {
	// Requirement 4.7 — must be inside a Node.js project
	if (!existsSync(join(projectRoot, "package.json"))) {
		console.error(
			"No package.json found. Run 'audx init' inside a Node.js project.",
		);
		process.exit(1);
	}

	// Requirement 4.4, 4.5 — prompt before overwriting existing config
	if (ConfigManager.exists(projectRoot)) {
		const overwrite = await confirm(
			"audx.config.json already exists. Overwrite? (y/N) ",
		);
		if (!overwrite) {
			console.log("Init cancelled.");
			return;
		}
	}

	// Requirement 4.1 — prompt for theme selection
	const theme = await selectTheme();

	// Requirement 4.6 — detect package manager
	const packageManager = detectPackageManager(projectRoot);

	// Read tsconfig aliases
	const aliasMap = loadFromTsConfig(projectRoot);
	const aliases = resolveAliases(aliasMap);

	// Requirement 4.2, 4.3 — build config with theme and new defaults
	const config: AudxConfig = {
		$schema: "https://audx.site/schema/config.json",
		soundDir: "assets/audio",
		libDir: "src/lib",
		registryUrl: "https://audx.site",
		packageManager,
		theme,
		aliases,
		installedSounds: [],
	};

	// Write config
	ConfigManager.write(projectRoot, config);

	console.log("✔ Created audx.config.json");
	console.log(`  Theme: ${theme}`);
	console.log(`  Package manager: ${packageManager}`);
	console.log(
		`  Aliases: ${aliasMap.hasAliases ? "detected from tsconfig" : "using default paths"}`,
	);
}
