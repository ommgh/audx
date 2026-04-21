import { getInstallPrefix, type PackageManager } from "@/lib/package-manager";

export function buildInstallCommand(
	audioNames: string[],
	pm: PackageManager,
): string {
	if (audioNames.length === 0) return "";

	const names = audioNames.map((name) => `@audx/${name}`);
	return `${getInstallPrefix(pm, "react")} add ${names.join(" ")}`;
}
