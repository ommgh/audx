export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = [
	"npm",
	"pnpm",
	"yarn",
	"bun",
];

const PM_PREFIX: Record<PackageManager, string> = {
	npm: "npx",
	pnpm: "pnpm dlx",
	yarn: "yarn dlx",
	bun: "bunx",
};

export const DEFAULT_PM: PackageManager = "npm";

/** Returns the package-manager runner prefix (e.g. "npx", "pnpm dlx"). */
export function getRunnerPrefix(pm: PackageManager): string {
	return PM_PREFIX[pm];
}

/** Returns the full install prefix for audx CLI commands (e.g. "npx audx"). */
export function getInstallPrefix(pm: PackageManager): string {
	return `${PM_PREFIX[pm]} audx`;
}
