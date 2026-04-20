"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import { DEFAULT_PM, type PackageManager } from "@/lib/package-manager";

export function SoundInstallBlock({ text }: { text: string }) {
  const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase">
          Install
        </span>
        <CopyButton value={text} successText="Install command copied!" />
      </div>
      <div className="rounded-lg border border-border/40 bg-secondary/30">
        <div className="border-b border-border/40 px-3 py-1.5">
          <PackageManagerSwitcher value={pm} onChange={setPm} />
        </div>
        <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed [scrollbar-width:none]">
          <code className="font-mono">{text}</code>
        </pre>
      </div>
    </div>
  );
}
