export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = [
	"npm",
	"pnpm",
	"yarn",
	"bun",
];

const PM_PREFIX: Record<PackageManager, string> = {
	npm: "npx shadcn@latest",
	pnpm: "pnpm dlx shadcn@latest",
	yarn: "yarn dlx shadcn@latest",
	bun: "bunx --bun shadcn@latest",
};

const PM_PREFIX_VUE: Record<PackageManager, string> = {
	npm: "npx shadcn-vue@latest",
	pnpm: "pnpm dlx shadcn-vue@latest",
	yarn: "npx shadcn-vue@latest",
	bun: "bunx --bun shadcn-vue@latest",
};

export const DEFAULT_PM: PackageManager = "npm";

export function getInstallPrefix(
	pm: PackageManager,
	framework: "react" | "vue" = "react",
): string {
	return framework === "vue" ? PM_PREFIX_VUE[pm] : PM_PREFIX[pm];
}
