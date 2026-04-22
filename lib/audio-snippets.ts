import { getInstallPrefix, type PackageManager } from "@/lib/package-manager";

function toCamelCase(name: string): string {
	return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export interface AudioSnippets {
	exportName: string;
	installCmd: string;
	usageCode: string;
}

export function getAudioSnippets(
	name: string,
	pm: PackageManager,
): AudioSnippets {
	const exportName = `${toCamelCase(name)}Audio`;
	const prefix = getInstallPrefix(pm);
	const installCmd = `${prefix} add use-audio ${name}`;
	const usageCode = `import { useAudio } from "@/hooks/use-audio";
import { ${exportName} } from "@/sounds/${name}";

const [play] = useAudio(${exportName});`;
	return { exportName, installCmd, usageCode };
}
