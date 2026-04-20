import { getInstallPrefix, type PackageManager } from "@/lib/package-manager";
import type { InstallMethod } from "@/lib/install-method";

export function buildInstallCommand(
  audioNames: string[],
  pm: PackageManager,
  method: InstallMethod = "shadcn",
): string {
  if (audioNames.length === 0) return "";
  if (method === "manual") return "";

  const framework = method === "shadcn-vue" ? "vue" : "react";
  const names = audioNames.map((name) =>
    method === "shadcn-vue"
      ? `https://audx.dev/r/${name}.json`
      : `@audx/${name}`,
  );
  return `${getInstallPrefix(pm, framework)} add ${names.join(" ")}`;
}
