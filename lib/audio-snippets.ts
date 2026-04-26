import type { PackageManager } from "@/lib/package-manager";

function toCamelCase(name: string): string {
	return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export interface AudioSnippets {
	exportName: string;
	installCmd: string;
	usageCode: string;
}

export function getAudioSnippets(
	semanticName: string,
	_pm: PackageManager,
): AudioSnippets {
	const exportName = `${toCamelCase(semanticName)}Audio`;
	const installCmd = `npx audx add ${semanticName}`;
	const usageCode = `import { useAudio } from "@/hooks/use-audio";
import { ${exportName} } from "@/assets/audio/${semanticName}";

const [play] = useAudio(${exportName});`;
	return { exportName, installCmd, usageCode };
}
