"use client";

import { defineSound, type SoundDefinition } from "@litlab/audx";
import {
  RiCheckLine,
  RiDownloadCloud2Line,
  RiPlayFill,
  RiResetLeftLine,
  RiStopFill,
} from "@remixicon/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fader } from "@/components/audio/fader";
import { Knob } from "@/components/audio/knob";
import { Waveform as AudioWaveform } from "@/components/audio/waveform";
import { XYPad } from "@/components/audio/xypad";
import { Button } from "@/components/ui/button";
import { audio, CATEGORIES } from "@/lib/audio-taxonomy";

const SOUND_NAMES = [...audio];
const WAVEFORMS = ["sine", "triangle", "square", "sawtooth"] as const;

type Waveform = (typeof WAVEFORMS)[number];

type ThemeGeneratorProps = {
  isLoggedIn?: boolean;
};

type ThemeControls = {
  character: number;
  brightness: number;
  motion: number;
  duration: number;
  gain: number;
  waveform: Waveform;
};

type PresetTheme = {
  name: string;
  description: string;
  controls: ThemeControls;
};

const DEFAULT_CONTROLS: ThemeControls = {
  character: 0,
  brightness: 0,
  motion: 0.35,
  duration: 1,
  gain: 0.55,
  waveform: "sine",
};

const PRESETS: Record<string, PresetTheme> = {
  minimal: {
    name: "Minimal",
    description: "Short, clean, understated UI feedback.",
    controls: {
      character: -0.45,
      brightness: 0.15,
      motion: 0.15,
      duration: 0.75,
      gain: 0.45,
      waveform: "sine",
    },
  },
  playful: {
    name: "Playful",
    description: "Bouncy, melodic cues with a little extra movement.",
    controls: {
      character: 0.55,
      brightness: 0.4,
      motion: 0.8,
      duration: 1.25,
      gain: 0.7,
      waveform: "triangle",
    },
  },
  digital: {
    name: "Digital",
    description: "Crisp synthetic ticks for product interfaces.",
    controls: {
      character: 0.15,
      brightness: 0.75,
      motion: 0.45,
      duration: 0.9,
      gain: 0.6,
      waveform: "square",
    },
  },
};

const CATEGORY_TUNING: Record<
  string,
  { frequency: number; gain: number; length: number }
> = {
  feedback: { frequency: 760, gain: 1, length: 1.15 },
  notification: { frequency: 920, gain: 0.9, length: 1.25 },
  interaction: { frequency: 1180, gain: 0.75, length: 0.55 },
  navigation: { frequency: 780, gain: 0.8, length: 0.9 },
  destructive: { frequency: 430, gain: 1, length: 1.2 },
  clipboard: { frequency: 1320, gain: 0.7, length: 0.65 },
  progress: { frequency: 650, gain: 0.75, length: 1.35 },
  transition: { frequency: 700, gain: 0.65, length: 1.1 },
  state: { frequency: 560, gain: 0.8, length: 0.9 },
  media: { frequency: 500, gain: 0.9, length: 1.15 },
};

const categories = Array.from(
  new Set(SOUND_NAMES.map((name) => CATEGORIES[name])),
);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function soundOffset(name: string) {
  return [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 11;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function createSoundDefinition(
  soundName: string,
  controls: ThemeControls,
): SoundDefinition {
  const category = CATEGORIES[soundName] ?? "interaction";
  const tuning = CATEGORY_TUNING[category] ?? CATEGORY_TUNING.interaction;
  const offset = soundOffset(soundName) - 5;
  const brightnessMultiplier = 1 + controls.brightness * 0.65;
  const characterMultiplier = 1 + controls.character * 0.22;
  const baseFrequency = clamp(
    (tuning.frequency + offset * 24) *
      brightnessMultiplier *
      characterMultiplier,
    120,
    2200,
  );
  const movement = controls.motion * (category === "interaction" ? 0.45 : 0.7);
  const direction =
    category === "destructive" || soundName === "back" || soundName === "close"
      ? -1
      : 1;
  const decay = clamp(
    0.035 * tuning.length * controls.duration + movement * 0.08,
    0.01,
    0.42,
  );
  const release = clamp(decay * 0.35, 0.004, 0.18);
  const gain = clamp(0.12 * tuning.gain * controls.gain, 0.015, 0.28);

  return {
    source: {
      type: controls.waveform,
      frequency:
        movement > 0.08
          ? {
              start: Math.round(
                baseFrequency * (1 - direction * movement * 0.2),
              ),
              end: Math.round(
                baseFrequency * (1 + direction * movement * 0.28),
              ),
            }
          : Math.round(baseFrequency),
    },
    envelope: {
      attack: controls.motion > 0.65 ? 0.003 : 0,
      decay,
      sustain: controls.motion > 0.55 ? 0.03 : 0,
      release,
    },
    gain,
  };
}

function buildTheme(controls: ThemeControls) {
  return Object.fromEntries(
    SOUND_NAMES.map((soundName) => [
      soundName,
      createSoundDefinition(soundName, controls),
    ]),
  ) as Record<string, SoundDefinition>;
}

function waveformData(waveform: Waveform, seed = 0, length = 64) {
  return Array.from({ length }, (_, index) => {
    const phase = (index + seed) / length;
    const wobble = Math.sin((index + seed) * 1.7) * 0.08;

    if (waveform === "sine") {
      return clamp(
        0.45 + Math.sin(phase * Math.PI * 2) * 0.38 + wobble,
        0.1,
        1,
      );
    }

    if (waveform === "triangle") {
      return clamp(
        0.18 + (1 - Math.abs(((phase * 2) % 2) - 1)) * 0.75 + wobble,
        0.1,
        1,
      );
    }

    if (waveform === "square") {
      return clamp((phase % 0.25 < 0.125 ? 0.9 : 0.28) + wobble, 0.1, 1);
    }

    return clamp(0.18 + (phase % 0.25) * 3.1 + wobble, 0.1, 1);
  });
}

function MiniWaveform({
  waveform,
  seed = 0,
}: {
  waveform: Waveform;
  seed?: number;
}) {
  return (
    <AudioWaveform
      aria-hidden="true"
      barGap={2}
      barHeight={3}
      barRadius={0}
      barWidth={3}
      className="w-full text-current"
      data={waveformData(waveform, seed)}
      fadeEdges={false}
      height={44}
    />
  );
}

export function ThemeGenerator({
  isLoggedIn: initialIsLoggedIn = false,
}: ThemeGeneratorProps) {
  const [controls, setControls] = useState<ThemeControls>(DEFAULT_CONTROLS);
  const [selectedSound, setSelectedSound] =
    useState<(typeof audio)[number]>("click");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("interaction");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  const voiceRef = useRef<ReturnType<ReturnType<typeof defineSound>> | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const theme = useMemo(() => buildTheme(controls), [controls]);
  const visibleSounds = useMemo(
    () =>
      SOUND_NAMES.filter(
        (soundName) => CATEGORIES[soundName] === selectedCategory,
      ),
    [selectedCategory],
  );

  useEffect(() => {
    setIsLoggedIn(initialIsLoggedIn);
  }, [initialIsLoggedIn]);

  const stopPreview = useCallback(() => {
    voiceRef.current?.stop();
    voiceRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
  }, []);

  useEffect(() => stopPreview, [stopPreview]);

  const updateControls = (next: Partial<ThemeControls>) => {
    stopPreview();
    setControls((current) => ({ ...current, ...next }));
  };

  const applyPreset = useCallback(
    (presetKey: string) => {
      stopPreview();
      const preset = PRESETS[presetKey];
      if (!preset) return;
      setControls(preset.controls);
      setThemeName(preset.name);
      setThemeDescription(preset.description);
    },
    [stopPreview],
  );

  const playPreview = useCallback(
    (soundName = selectedSound) => {
      if (isPlaying) {
        stopPreview();
        return;
      }

      const play = defineSound(theme[soundName]);
      voiceRef.current = play();
      setIsPlaying(true);
      timerRef.current = setTimeout(
        () => setIsPlaying(false),
        Math.max(250, 900 * controls.duration),
      );
    },
    [controls.duration, isPlaying, selectedSound, stopPreview, theme],
  );

  const saveTheme = useCallback(async () => {
    setSaveError(null);
    setSavedMessage(null);

    if (!themeName.trim()) {
      setSaveError("Theme name is required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/audio/user-themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: themeName.trim(),
          description: themeDescription.trim() || undefined,
          sounds: theme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save theme");
      }

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to save theme");
      }

      setSavedMessage(
        `Theme "${data.name}" saved with ${SOUND_NAMES.length} fixed sounds.`,
      );

      if (savedMessageTimerRef.current) {
        clearTimeout(savedMessageTimerRef.current);
      }
      savedMessageTimerRef.current = setTimeout(() => {
        setSavedMessage(null);
      }, 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save theme",
      );
    } finally {
      setIsSaving(false);
    }
  }, [theme, themeName, themeDescription]);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Theme Builder
            <span className="text-sm text-muted-foreground"> [ beta ]</span>
          </h2>

          <p className="text-xs text-muted-foreground">
            Design a coherent theme according to your mood and product style
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            stopPreview();
            setControls(DEFAULT_CONTROLS);
            setThemeName("");
            setThemeDescription("");
            setSaveError(null);
            setSavedMessage(null);
          }}
        >
          <RiResetLeftLine />
          Reset
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 rounded-3xl border bg-gradient-to-br from-card via-card to-secondary/40 p-4 shadow-sm lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <div className="flex w-full min-w-0 flex-col rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-sm">Theme palette</span>
            <span className="font-mono text-muted-foreground text-xs">
              Soft/bold · warm/bright
            </span>
          </div>
          <div className="w-full flex-1 py-4">
            <XYPad
              aria-label="Theme character and brightness"
              className="w-full"
              maxX={1}
              maxY={1}
              minX={-1}
              minY={-1}
              onValueChange={(value) =>
                updateControls({ character: value.x, brightness: value.y })
              }
              stepX={0.05}
              stepY={0.05}
              value={{ x: controls.character, y: controls.brightness }}
              formatValue={(value) =>
                `${value.x < 0 ? "soft" : "bold"} · ${value.y < 0 ? "warm" : "bright"}`
              }
              size="xl"
            />
          </div>
          <p className="mt-auto text-muted-foreground text-xs">
            Drag across the pad to move between soft/bold and warm/bright.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-semibold text-sm">Dynamics</span>
              <span className="font-mono text-muted-foreground text-xs">
                Shape
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Length
                </span>
                <Knob
                  aria-label="Theme length"
                  defaultValue={DEFAULT_CONTROLS.duration}
                  max={2}
                  min={0.45}
                  onValueChange={(duration) => updateControls({ duration })}
                  size="lg"
                  step={0.05}
                  value={controls.duration}
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {controls.duration.toFixed(2)}x
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Volume
                </span>
                <Knob
                  aria-label="Theme volume"
                  defaultValue={DEFAULT_CONTROLS.gain}
                  max={1}
                  min={0.15}
                  onValueChange={(gain) => updateControls({ gain })}
                  size="lg"
                  step={0.05}
                  value={controls.gain}
                />
                <span className="font-mono text-muted-foreground text-xs">
                  {formatPercent(controls.gain)}
                </span>
              </div>
            </div>
            <p className="absolute bottom-0 text-muted-foreground text-xs">
              Double-click knobs to return to their default values
            </p>
          </div>

          <div className="relative min-w-0 border border-border/60 bg-background/70 p-4 pb-9 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-semibold text-sm">Motion</span>
              <span className="font-mono text-muted-foreground text-xs">
                {formatPercent(controls.motion)}
              </span>
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>Sweep</span>
                <span>Static · Lively</span>
              </div>
              <Fader
                aria-label="Theme motion"
                className="w-full min-w-0"
                max={1}
                min={0}
                onValueChange={(motion) => updateControls({ motion })}
                orientation="horizontal"
                size="lg"
                step={0.05}
                value={controls.motion}
              />
            </div>
            <p className="absolute bottom-4 left-4 right-4 text-muted-foreground text-xs">
              Higher motion adds pitch sweeps and livelier
            </p>
          </div>
        </div>

        <div className="border border-border/50 bg-background/60 p-3 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Waveform color</p>
              <p className="text-muted-foreground text-xs">
                Pick the oscillator family used across the generated theme.
              </p>
            </div>
            <span className="bg-primary/10 px-2.5 py-1 font-mono text-primary text-xs">
              {controls.waveform}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WAVEFORMS.map((waveform) => {
              const selected = controls.waveform === waveform;
              return (
                <button
                  aria-pressed={selected}
                  className={`border px-3 py-2 text-left transition-colors ${
                    selected
                      ? "border-primary"
                      : "border-border/60 bg-card hover:border-primary/50 hover:bg-accent"
                  }`}
                  key={waveform}
                  onClick={() => updateControls({ waveform })}
                  type="button"
                >
                  <MiniWaveform waveform={waveform} />
                  <span className="mt-2 block font-medium text-xs capitalize">
                    {waveform}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Fixed sound library</h3>
            <p className="text-muted-foreground text-xs">
              Browse and preview the canonical sounds. No sounds are added or
              removed.
            </p>
          </div>
          <Button type="button" onClick={() => playPreview()}>
            {isPlaying ? <RiStopFill /> : <RiPlayFill />}
            {isPlaying ? "Stop" : `Preview ${selectedSound}`}
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              className={`shrink-0 border px-3 py-1.5 text-xs transition-colors ${
                selectedCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card hover:bg-accent"
              }`}
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                const firstSound = SOUND_NAMES.find(
                  (soundName) => CATEGORIES[soundName] === category,
                );
                if (firstSound) setSelectedSound(firstSound);
              }}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSounds.map((soundName) => {
            const selected = selectedSound === soundName;
            return (
              <button
                aria-pressed={selected}
                className={`border p-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-accent"
                }`}
                key={soundName}
                onClick={() => {
                  stopPreview();
                  setSelectedSound(soundName);
                }}
                type="button"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{soundName}</span>
                  {selected ? (
                    <RiCheckLine className="size-4 text-primary" />
                  ) : null}
                </span>
                <div className="mt-2 text-primary/70">
                  <MiniWaveform
                    waveform={controls.waveform}
                    seed={soundOffset(soundName)}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 border bg-card p-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h3 className="text-sm font-medium">Generated theme package</h3>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            Your saved theme includes the same fixed sound names as Minimal and
            Playful, generated from the controls above.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="border bg-secondary/30 p-3">
              <div className="font-mono text-lg">{SOUND_NAMES.length}</div>
              <div className="text-muted-foreground text-[11px]">sounds</div>
            </div>
            <div className="border bg-secondary/30 p-3">
              <div className="font-mono text-lg">{categories.length}</div>
              <div className="text-muted-foreground text-[11px]">groups</div>
            </div>
            <div className="border bg-secondary/30 p-3">
              <div className="font-mono text-lg">JSON</div>
              <div className="text-muted-foreground text-[11px]">hidden</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Button
                className="text-xs"
                key={key}
                onClick={() => applyPreset(key)}
                type="button"
                variant="outline"
              >
                Start from {preset.name}
              </Button>
            ))}
          </div>

          {isLoggedIn ? (
            <div className="space-y-3">
              <div>
                <label
                  className="mb-1.5 block font-medium text-xs"
                  htmlFor="theme-name"
                >
                  Theme Name *
                </label>
                <input
                  className="h-9 w-full border border-input bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  id="theme-name"
                  onChange={(event) => setThemeName(event.target.value)}
                  placeholder="e.g. Glassmorphism"
                  type="text"
                  value={themeName}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block font-medium text-xs"
                  htmlFor="theme-description"
                >
                  Description optional
                </label>
                <textarea
                  className="h-20 w-full resize-none border border-input bg-background px-3 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  id="theme-description"
                  onChange={(event) => setThemeDescription(event.target.value)}
                  placeholder="Describe the feel of this theme..."
                  value={themeDescription}
                />
              </div>

              {saveError ? (
                <div className="border border-destructive/50 bg-destructive/10 p-3 text-destructive text-xs">
                  {saveError}
                </div>
              ) : null}

              {savedMessage ? (
                <div className="border border-green-500/50 bg-green-500/10 p-3 text-green-700 text-xs dark:text-green-400">
                  {savedMessage}
                </div>
              ) : null}

              <Button
                className="w-full"
                disabled={isSaving || !themeName.trim()}
                onClick={saveTheme}
                type="button"
              >
                <RiDownloadCloud2Line />
                {isSaving
                  ? "Saving..."
                  : `Save complete ${SOUND_NAMES.length}-sound theme`}
              </Button>
            </div>
          ) : (
            <div className="border border-primary/20 bg-primary/5 p-4 text-muted-foreground text-sm">
              Sign in to save this generated theme to your library.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
