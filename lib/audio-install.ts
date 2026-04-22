import { getInstallPrefix, type PackageManager } from "@/lib/package-manager";

export function buildInstallCommand(
	audioNames: string[],
	pm: PackageManager,
): string {
	if (audioNames.length === 0) return "";

	const names = audioNames.join(" ");
	return `${getInstallPrefix(pm)} add ${names}`;
}
