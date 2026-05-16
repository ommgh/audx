"use client";

import { useMemo, useState } from "react";
import { SoundCopyBlock } from "@/components/audio-copy-block";
import { CopyButton } from "@/components/copy-button";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";

import { DEFAULT_PM, type PackageManager } from "@/lib/package-manager";

interface SoundInstallInstructionsProps {
  soundName: string;
}

export function SoundInstallInstructions({
  soundName,
}: SoundInstallInstructionsProps) {
  const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);

  return (
    <div className="flex flex-col gap-5">
      {/* Install command */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
            Install
          </span>
          <CopyButton successText="Copied!" />
        </div>
        <div className="rounded-lg border border-border/40 bg-secondary/30">
          <div className="border-b border-border/40 px-3 py-1.5">
            <PackageManagerSwitcher value={pm} onChange={setPm} />
          </div>
          <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed [scrollbar-width:none]"></pre>
        </div>
      </div>

      {/* Usage code */}
    </div>
  );
}
