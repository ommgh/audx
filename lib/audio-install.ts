import type { PackageManager } from "@/lib/package-manager";

export function buildInstallCommand(
	audioNames: string[],
	_pm: PackageManager,
): string {
	if (audioNames.length === 0) return "";

	const names = audioNames.join(" ");
	return `npx audx add ${names}`;
}
