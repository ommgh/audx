"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { InstallMethodSwitcher } from "@/components/install-method-switcher";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import { SoundCopyBlock } from "@/components/sound-copy-block";
import { trackEvent } from "@/lib/analytics";
import { getAudioSnippets, type SetupStep } from "@/lib/audio-snippets";
import { DEFAULT_IM, type InstallMethod } from "@/lib/install-method";
import { DEFAULT_PM, type PackageManager } from "@/lib/package-manager";

interface SoundInstallInstructionsProps {
  soundName: string;
}

function useAudioFileContent(audioName: string, enabled: boolean) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setContent(null);
      return;
    }

    let cancelled = false;

    fetch(`/r/${audioName}.json`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const audioFile = data.files?.find((f: { path: string }) =>
          f.path.includes(`/sounds/${audioName}/`),
        );
        if (audioFile?.content) {
          setContent(audioFile.content);
        }
      })
      .catch(() => {
        // Silently fail
      });

    return () => {
      cancelled = true;
    };
  }, [audioName, enabled]);

  return content;
}

function ManualStepBlock({ step }: { step: SetupStep }) {
  if (!step.code) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase">
            {step.label}
          </span>
        </div>
        <div className="rounded-lg border border-border/40 bg-secondary/30 p-3">
          <span className="text-xs text-muted-foreground/70">
            Loading\u2026
          </span>
        </div>
      </div>
    );
  }

  return <SoundCopyBlock label={step.label} text={step.code} />;
}

export function SoundInstallInstructions({
  soundName,
}: SoundInstallInstructionsProps) {
  const [method, setMethod] = useState<InstallMethod>(DEFAULT_IM);
  const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);

  const snippets = useMemo(
    () => getAudioSnippets(soundName, pm, method),
    [soundName, pm, method],
  );

  const isManual = method === "manual";
  const audioFileContent = useAudioFileContent(soundName, isManual);

  const resolvedSteps = useMemo(() => {
    if (!snippets.setupSteps) return null;
    return snippets.setupSteps.map((step) =>
      step.code === "" && audioFileContent
        ? { ...step, code: audioFileContent }
        : step,
    );
  }, [snippets.setupSteps, audioFileContent]);

  return (
    <div className="flex flex-col gap-5">
      {/* Method selector */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
          Install
        </span>
        <InstallMethodSwitcher value={method} onChange={setMethod} />
      </div>

      {/* Install command (CLI methods only) */}
      {snippets.installCmd !== null ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
              Command
            </span>
            <CopyButton
              value={snippets.installCmd}
              successText="Copied!"
              onCopy={() =>
                trackEvent("audio_install_copied", {
                  audioName: soundName,
                  packageManager: pm,
                  installMethod: method,
                })
              }
            />
          </div>
          <div className="rounded-lg border border-border/40 bg-secondary/30">
            <div className="border-b border-border/40 px-3 py-1.5">
              <PackageManagerSwitcher value={pm} onChange={setPm} />
            </div>
            <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed [scrollbar-width:none]">
              <code className="font-mono">{snippets.installCmd}</code>
            </pre>
          </div>
        </div>
      ) : null}

      {/* Manual setup steps */}
      {resolvedSteps !== null ? (
        <div className="flex flex-col gap-4">
          {resolvedSteps.map((step) => (
            <ManualStepBlock key={step.label} step={step} />
          ))}
        </div>
      ) : null}

      {/* Usage code */}
      <SoundCopyBlock label="Usage" text={snippets.usageCode} />
    </div>
  );
}
