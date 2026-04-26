import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { AliasMap, AudxConfig, RegistryFile } from "../types.js";
import { resolveImport } from "./alias-resolver.js";
import { buildSoundFilePath } from "./naming.js";

/**
 * Determine the target directory for a registry file based on its type and
 * path, write the file with rewritten imports, and return the written path.
 *
 * Returns `null` when the file already exists (idempotent skip for deps).
 */
export function writeRegistryFile(
	file: RegistryFile,
	targetDir: string,
	aliasMap: AliasMap,
	config: AudxConfig,
): string | null {
	const targetPath = resolveTargetPath(file, targetDir, config);

	// Skip dependency files that already exist (idempotent)
	if (isDependencyFile(file) && existsSync(targetPath)) {
		return null;
	}

	const rewritten = rewriteImports(file.content, targetPath, aliasMap, config);

	mkdirSync(dirname(targetPath), { recursive: true });
	writeFileSync(targetPath, rewritten, "utf-8");

	return targetPath;
}

/**
 * Rewrite `@/lib/` and `@/hooks/` import patterns in registry file content
 * so they resolve correctly in the user's project.
 */
export function rewriteImports(
	content: string,
	sourceFilePath: string,
	aliasMap: AliasMap,
	config: AudxConfig,
): string {
	// Match import/export statements with @/lib/ or @/hooks/ paths
	const importPattern = /(from\s+["'])@\/(lib|hooks)\/([^"']+)(["'])/g;

	return content.replace(
		importPattern,
		(
			_match,
			prefix: string,
			category: string,
			moduleName: string,
			suffix: string,
		) => {
			const targetModulePath = resolveModuleTargetPath(
				category,
				moduleName,
				config,
			);

			const resolved = resolveImport(
				aliasMap,
				sourceFilePath,
				targetModulePath,
			);

			return `${prefix}${resolved}${suffix}`;
		},
	);
}

/**
 * Resolve the filesystem target path for a registry file based on its type
 * and the original registry path.
 */
function resolveTargetPath(
	file: RegistryFile,
	targetDir: string,
	config: AudxConfig,
): string {
	const fileName = basename(file.path);

	if (file.type === "registry:hook") {
		// Hooks go to a `hooks` directory sibling to libDir
		const hooksDir = join(dirname(config.libDir), "hooks");
		return join(hooksDir, fileName);
	}

	if (file.type === "registry:lib") {
		// Distinguish sound files from actual lib files by path pattern
		if (isSoundFilePath(file.path)) {
			const semanticName = basename(fileName, ".ts");
			return buildSoundFilePath(targetDir, semanticName);
		}
		// Lib dependency files go to libDir
		return join(config.libDir, fileName);
	}

	// Fallback: write to soundDir using buildSoundFilePath
	const semanticName = basename(fileName, ".ts");
	return buildSoundFilePath(targetDir, semanticName);
}

/**
 * Check whether a registry file path points to a sound module
 * (e.g. `registry/audx/audio/minimal/click/click.ts`).
 */
function isSoundFilePath(registryPath: string): boolean {
	const normalised = registryPath.replace(/\\/g, "/");
	return normalised.startsWith("audio/") || normalised.includes("/audio/");
}

/**
 * Check whether a file is a shared dependency (lib or hook) rather than
 * the primary sound module.
 */
function isDependencyFile(file: RegistryFile): boolean {
	if (file.type === "registry:hook") {
		return true;
	}
	if (file.type === "registry:lib" && !isSoundFilePath(file.path)) {
		return true;
	}
	return false;
}

/**
 * Compute the project-relative target path for a module referenced by an
 * `@/lib/...` or `@/hooks/...` import, so the alias resolver can produce
 * the correct import specifier.
 */
function resolveModuleTargetPath(
	category: string,
	moduleName: string,
	config: AudxConfig,
): string {
	if (category === "hooks") {
		const hooksDir = join(dirname(config.libDir), "hooks");
		return join(hooksDir, `${moduleName}.ts`);
	}
	// category === "lib"
	return join(config.libDir, `${moduleName}.ts`);
}
