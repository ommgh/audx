import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { type AudxConfig, audxConfigSchema } from "../types.js";

const CONFIG_FILE_NAME = "audx.config.json";

/**
 * Resolve the full path to the config file given a project root.
 */
function configPath(projectRoot: string): string {
  return join(projectRoot, CONFIG_FILE_NAME);
}

/**
 * Check whether `audx.config.json` exists in the given project root.
 */
export function exists(projectRoot: string): boolean {
  return existsSync(configPath(projectRoot));
}

/**
 * Validate an unknown value against the AudxConfig Zod schema.
 * Returns the parsed config on success; throws a ZodError on failure.
 */
export function validate(raw: unknown): AudxConfig {
  return audxConfigSchema.parse(raw);
}

/**
 * Read and validate `audx.config.json` from the given project root.
 * Throws if the file doesn't exist, contains invalid JSON, or fails validation.
 */
export function read(projectRoot: string): AudxConfig {
  const filePath = configPath(projectRoot);
  const content = readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(content);
  return validate(parsed);
}

/**
 * Serialize and write an AudxConfig to `audx.config.json` in the given project root.
 * Uses 2-space indentation for readability.
 */
export function write(projectRoot: string, config: AudxConfig): void {
  const filePath = configPath(projectRoot);
  const json = JSON.stringify(config, null, 2);
  writeFileSync(filePath, json + "\n", "utf-8");
}
