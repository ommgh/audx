import { existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { loadFromTsConfig } from "../core/alias-resolver.js";
import * as ConfigManager from "../core/config.js";
import { detectPackageManager } from "../core/package-manager.js";
import type { AudxConfig } from "../types.js";

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
	// Requirement 2.6 — must be inside a Node.js project
	if (!existsSync(join(projectRoot, "package.json"))) {
		console.error(
			"No package.json found. Run 'audx init' inside a Node.js project.",
		);
		process.exit(1);
	}

	// Requirement 2.5 — prompt before overwriting existing config
	if (ConfigManager.exists(projectRoot)) {
		const overwrite = await confirm(
			"audx.config.json already exists. Overwrite? (y/N) ",
		);
		if (!overwrite) {
			console.log("Init cancelled.");
			return;
		}
	}

	// Requirement 2.2 — detect package manager
	const packageManager = detectPackageManager(projectRoot);

	// Requirement 2.3 — read tsconfig aliases
	const aliasMap = loadFromTsConfig(projectRoot);
	const aliases = resolveAliases(aliasMap);

	// Requirement 2.4 — build default config
	const config: AudxConfig = {
		$schema: "https://audx.site/schema/config.json",
		soundDir: "src/sounds",
		libDir: "src/lib",
		registryUrl: "https://audx.site",
		packageManager,
		aliases,
		installedSounds: {},
	};

	// Requirement 2.1 — write config
	ConfigManager.write(projectRoot, config);

	console.log("✔ Created audx.config.json");
	console.log(`  Package manager: ${packageManager}`);
	console.log(
		`  Aliases: ${aliasMap.hasAliases ? "detected from tsconfig" : "using default paths"}`,
	);
}
