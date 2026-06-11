"use client";

import { defineSound, type SoundDefinition } from "@litlab/audx";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiPlayFill,
  RiResetLeftLine,
  RiStopFill,
} from "@remixicon/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fader } from "@/components/audio/fader";
import { Knob } from "@/components/audio/knob";
import { Waveform as WaveformDisplay } from "@/components/audio/waveform";
import { XYPad } from "@/components/audio/xypad";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PM,
  getInstallPrefix,
  type PackageManager,
} from "@/lib/package-manager";
import {
  customizeSound,
  DEFAULT_CUSTOMIZATION,
  encodeSoundCustomization,
  type SoundCustomization,
  type Waveform,
} from "@/lib/sound-customization";

type AudioEditorProps = {
  definition: SoundDefinition;
  soundName: string;
  theme: string;
};

const waveforms: Array<Waveform | "original"> = [
  "original",
  "sine",
  "triangle",
  "square",
  "sawtooth",
];

function formatPitch(value: number) {
  return `${value > 0 ? "+" : ""}${value} st`;
}

function formatPan(value: number) {
  if (value === 0) return "center";
  return value < 0
    ? `${Math.round(Math.abs(value) * 100)}% L`
    : `${Math.round(value * 100)}% R`;
}

function waveformLabel(waveform: Waveform | "original") {
  return waveform === "original"
    ? "Original"
    : waveform.charAt(0).toUpperCase() + waveform.slice(1);
}

function waveformPreviewData(waveform: Waveform | "original") {
  return Array.from({ length: 72 }, (_, index) => {
    const progress = index / 71;
    const wave = Math.sin(progress * Math.PI * 8);

    if (waveform === "sine") return 0.18 + Math.abs(wave) * 0.72;
    if (waveform === "triangle") {
      const phase = (progress * 4) % 1;
      return 0.2 + (1 - Math.abs(phase * 2 - 1)) * 0.72;
    }
    if (waveform === "square") return index % 12 < 6 ? 0.86 : 0.28;
    if (waveform === "sawtooth") return 0.18 + ((progress * 6) % 1) * 0.72;

    return 0.22 + Math.abs(wave) * 0.42 + ((index * 17) % 11) / 45;
  });
}

export function AudioEditor({
  definition,
  soundName,
  theme,
}: AudioEditorProps) {
  const [settings, setSettings] = useState<SoundCustomization>(
    DEFAULT_CUSTOMIZATION,
  );
  const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const voiceRef = useRef<ReturnType<ReturnType<typeof defineSound>> | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const customizedDefinition = useMemo(
    () => customizeSound(definition, settings),
    [definition, settings],
  );
  const tuning = useMemo(() => encodeSoundCustomization(settings), [settings]);
  const command = `${getInstallPrefix(pm)} add ${soundName} --theme ${theme} --tune ${tuning} -y`;

  const stopPreview = useCallback(() => {
    voiceRef.current?.stop();
    voiceRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
  }, []);

  useEffect(() => stopPreview, [stopPreview]);

  const update = <K extends keyof SoundCustomization>(
    key: K,
    value: SoundCustomization[K],
  ) => {
    stopPreview();
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateTonePad = (value: { x: number; y: number }) => {
    stopPreview();
    setSettings((current) => ({
      ...current,
      pan: value.x,
      pitch: value.y,
    }));
  };

  const playPreview = useCallback(() => {
    if (isPlaying) {
      stopPreview();
      return;
    }

    const play = defineSound(customizedDefinition);
    voiceRef.current = play();
    setIsPlaying(true);
    timerRef.current = setTimeout(
      () => setIsPlaying(false),
      Math.max(250, 2500 * settings.duration),
    );
  }, [customizedDefinition, isPlaying, settings.duration, stopPreview]);

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access can be unavailable outside a secure context. */
    }
  }, [command]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Sound editor
            <span className="text-sm text-muted-foreground"> [ beta ]</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Preview changes, then install this exact definition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              stopPreview();
              setSettings(DEFAULT_CUSTOMIZATION);
            }}
          >
            <RiResetLeftLine />
            Reset
          </Button>
          <Button type="button" onClick={playPreview}>
            {isPlaying ? <RiStopFill /> : <RiPlayFill />}
            {isPlaying ? "Stop" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border bg-gradient-to-br from-card via-card to-secondary/40 p-4 shadow-sm lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex w-full flex-col rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-sm">Tone pad</span>
            <span className="font-mono text-muted-foreground text-xs">
              X pan · Y pitch
            </span>
          </div>
          <div className="w-full flex-1 py-4">
            <XYPad
              aria-label="Pitch and pan"
              className="w-full"
              maxX={1}
              maxY={12}
              minX={-1}
              minY={-12}
              onValueChange={updateTonePad}
              stepX={0.05}
              stepY={1}
              value={{ x: settings.pan, y: settings.pitch }}
              formatValue={(value) =>
                `${formatPan(value.x)} · ${formatPitch(value.y)}`
              }
              size="xl"
            />
          </div>
          <p className="mt-auto text-muted-foreground text-xs">
            Drag the cursor to place the sound in stereo space and retune it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="relative rounded-2xl border border-border/60 bg-background/70 p-4 pb-9 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="font-semibold text-sm">Shape</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Length
                </span>
                <Knob
                  aria-label="Length"
                  defaultValue={DEFAULT_CUSTOMIZATION.duration}
                  max={3}
                  min={0.25}
                  onValueChange={(value) => update("duration", value)}
                  size="lg"
                  step={0.05}
                  value={settings.duration}
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {settings.duration.toFixed(2)}x
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Volume
                </span>
                <Knob
                  aria-label="Volume"
                  defaultValue={DEFAULT_CUSTOMIZATION.gain}
                  max={2}
                  min={0}
                  onValueChange={(value) => update("gain", value)}
                  size="lg"
                  step={0.05}
                  value={settings.gain}
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {Math.round(settings.gain * 100)}%
                </span>
              </div>
            </div>
            <p className="absolute bottom-4 text-muted-foreground text-xs">
              Double-click knobs to return to their default values
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-semibold text-sm">Fine tune</span>
              <span className="font-mono text-muted-foreground text-xs">
                {formatPitch(settings.pitch)}
              </span>
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Pitch</span>
                <span>-12 st · +12 st</span>
              </div>
              <Fader
                aria-label="Pitch"
                className="w-full min-w-0"
                max={12}
                min={-12}
                onValueChange={(value) => update("pitch", value)}
                orientation="horizontal"
                size="lg"
                step={1}
                value={settings.pitch}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-background/60 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Waveform</p>
              <p className="text-muted-foreground text-xs">
                Swap the oscillator shape without changing the install flow.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-primary text-xs">
              {waveformLabel(settings.waveform)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {waveforms.map((waveform) => {
              const selected = settings.waveform === waveform;

              return (
                <button
                  type="button"
                  key={waveform}
                  onClick={() => update("waveform", waveform)}
                  className={`group border px-3 py-2 text-left transition-colors ${
                    selected
                      ? "border-primary"
                      : "border-border/60 bg-card hover:border-primary/50 hover:bg-card/80"
                  }`}
                  aria-pressed={selected}
                >
                  <WaveformDisplay
                    aria-hidden="true"
                    className="mb-2 overflow-hidden rounded-lg"
                    data={waveformPreviewData(waveform)}
                    barWidth={3}
                    barGap={2}
                    barRadius={3}
                    fadeEdges={false}
                    height={34}
                  />
                  <span className="font-medium text-xs">
                    {waveformLabel(waveform)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <PackageManagerSwitcher value={pm} onChange={setPm} />
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30">
          <code className="block overflow-x-auto whitespace-nowrap px-4 py-3 pr-12 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {command}
          </code>
          <button
            type="button"
            aria-label="Copy customized install command"
            onClick={copyCommand}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {copied ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
