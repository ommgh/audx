import { existsSync } from "node:fs";
import { join } from "node:path";
import type { PackageManager } from "../types.js";

const LOCK_FILE_PRECEDENCE: Array<{ file: string; manager: PackageManager }> = [
  { file: "bun.lock", manager: "bun" },
  { file: "pnpm-lock.yaml", manager: "pnpm" },
  { file: "yarn.lock", manager: "yarn" },
  { file: "package-lock.json", manager: "npm" },
];

export function detectPackageManager(projectRoot: string): PackageManager {
  for (const { file, manager } of LOCK_FILE_PRECEDENCE) {
    if (existsSync(join(projectRoot, file))) {
      return manager;
    }
  }
  return "npm";
}
