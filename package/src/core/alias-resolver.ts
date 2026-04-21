import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { AliasMap } from "../types.js";

/**
 * Read `tsconfig.json` from the given project root and extract
 * `compilerOptions.paths` into an AliasMap.
 */
export function loadFromTsConfig(projectRoot: string): AliasMap {
  let raw: string;
  try {
    raw = readFileSync(join(projectRoot, "tsconfig.json"), "utf-8");
  } catch {
    return { hasAliases: false, patterns: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { hasAliases: false, patterns: [] };
  }

  const paths =
    (parsed as Record<string, unknown>)?.compilerOptions != null
      ? ((parsed as Record<string, Record<string, unknown>>).compilerOptions
          .paths as Record<string, string[]> | undefined)
      : undefined;

  if (!paths || Object.keys(paths).length === 0) {
    return { hasAliases: false, patterns: [] };
  }

  const patterns = Object.entries(paths).map(([alias, targets]) => ({
    alias,
    paths: targets,
  }));

  return { hasAliases: true, patterns };
}

/**
 * Resolve a target module path to an aliased import path if a matching alias
 * exists, otherwise fall back to a relative import path.
 *
 * @param aliasMap     - The alias map loaded from tsconfig
 * @param sourceFilePath   - Absolute or project-relative path of the importing file
 * @param targetModulePath - Absolute or project-relative path of the target module
 * @returns The import specifier to use (aliased or relative, without extension)
 */
export function resolveImport(
  aliasMap: AliasMap,
  sourceFilePath: string,
  targetModulePath: string,
): string {
  if (aliasMap.hasAliases) {
    for (const pattern of aliasMap.patterns) {
      const { alias, paths: aliasPaths } = pattern;

      // Only handle wildcard aliases like `@/*` → [`./*`]
      if (!alias.endsWith("/*") || aliasPaths.length === 0) {
        continue;
      }

      const aliasPrefix = alias.slice(0, -1); // "@/*" → "@/"
      const pathPrefix = aliasPaths[0].slice(0, -1); // "./*" → "./"

      // Normalise separators to forward slashes for comparison
      const normTarget = targetModulePath.replace(/\\/g, "/");

      if (normTarget.startsWith(pathPrefix)) {
        const remainder = normTarget.slice(pathPrefix.length);
        return stripExtension(aliasPrefix + remainder);
      }
    }
  }

  return computeRelativePath(sourceFilePath, targetModulePath);
}

/**
 * Compute a relative import path from `sourceFilePath` to `targetModulePath`,
 * stripping the file extension from the result.
 *
 * Both paths should be project-relative (e.g. `src/sounds/click.ts`).
 */
export function computeRelativePath(
  sourceFilePath: string,
  targetModulePath: string,
): string {
  const sourceDir = dirname(sourceFilePath);
  let rel = relative(sourceDir, targetModulePath);

  // Normalise Windows backslashes to forward slashes
  rel = rel.replace(/\\/g, "/");

  // Ensure the path starts with "./" when it doesn't already start with "."
  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }

  return stripExtension(rel);
}

/**
 * Strip known TypeScript / JavaScript extensions from an import path.
 */
function stripExtension(importPath: string): string {
  return importPath.replace(/\.(tsx?|jsx?|mjs|cjs)$/, "");
}
