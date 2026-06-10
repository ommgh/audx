"use client";

import { defineSound, type Layer, type SoundDefinition } from "@litlab/audx";
import {
  RiCheckLine,
  RiDownloadCloud2Line,
  RiPlayFill,
  RiResetLeftLine,
  RiStopFill,
} from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeGeneratorProps = {
  isLoggedIn?: boolean;
  onThemeSaved?: (themeId: number, name: string) => void;
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
};

type PresetTheme = {
  name: string;
  description: string;
  sounds: Record<string, SoundDefinition>;
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: SliderProps) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-muted-foreground">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

function createBeepSound(
  frequency: number,
  envelopeLength: number,
  gain: number,
): SoundDefinition {
  const envelopeTime = Math.max(0.05, envelopeLength * 0.25);
  return {
    source: {
      type: "sine" as const,
      frequency,
    },
    envelope: {
      attack: 0.01,
      decay: envelopeTime * 0.5,
      sustain: 0.7,
      release: envelopeTime * 0.2,
    },
    gain,
  } as SoundDefinition;
}

const PRESETS: Record<string, PresetTheme> = {
  minimal: {
    name: "Minimal",
    description: "Clean, simple beeps for basic interaction sounds",
    sounds: {
      click: createBeepSound(800, 0.1, 0.3),
      success: createBeepSound(1200, 0.2, 0.4),
      error: createBeepSound(400, 0.3, 0.35),
    },
  },
  digital: {
    name: "Digital",
    description: "Tech-inspired sounds with varied frequencies",
    sounds: {
      click: createBeepSound(900, 0.12, 0.3),
      hover: createBeepSound(600, 0.08, 0.2),
      success: createBeepSound(1400, 0.25, 0.4),
      error: createBeepSound(300, 0.35, 0.35),
      warning: createBeepSound(1000, 0.2, 0.3),
    },
  },
  ambient: {
    name: "Ambient",
    description: "Mellow, atmospheric tones",
    sounds: {
      click: createBeepSound(400, 0.15, 0.25),
      success: createBeepSound(600, 0.3, 0.3),
      error: createBeepSound(200, 0.4, 0.25),
      notification: createBeepSound(500, 0.2, 0.3),
    },
  },
};

export function ThemeGenerator({
  isLoggedIn: initialIsLoggedIn = false,
  onThemeSaved,
}: ThemeGeneratorProps) {
  const [theme, setTheme] = useState<Record<string, SoundDefinition>>({});
  const [pitch, setPitch] = useState(0);
  const [duration, setDuration] = useState(1);
  const [gain, setGain] = useState(0.5);
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

  // Update isLoggedIn when prop changes
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

  const applyPreset = useCallback(
    (presetKey: string) => {
      stopPreview();
      const preset = PRESETS[presetKey];
      if (preset) {
        setTheme(preset.sounds);
        setThemeName(preset.name);
        setThemeDescription(preset.description);
      }
    },
    [stopPreview],
  );

  const addSound = useCallback(
    (soundName: string) => {
      stopPreview();
      const newSound = createBeepSound(800 + pitch * 50, duration, gain);
      setTheme((current) => ({ ...current, [soundName]: newSound }));
    },
    [pitch, duration, gain, stopPreview],
  );

  const removeSound = useCallback(
    (soundName: string) => {
      stopPreview();
      setTheme((current) => {
        const updated = { ...current };
        delete updated[soundName];
        return updated;
      });
    },
    [stopPreview],
  );

  const playPreview = useCallback(() => {
    if (isPlaying) {
      stopPreview();
      return;
    }

    if (Object.keys(theme).length === 0) {
      return;
    }

    // Play first sound in theme
    const firstSound = Object.values(theme)[0];
    if (firstSound) {
      const play = defineSound(firstSound);
      voiceRef.current = play();
      setIsPlaying(true);

      timerRef.current = setTimeout(
        () => setIsPlaying(false),
        Math.max(250, 2500 * duration),
      );
    }
  }, [theme, isPlaying, duration, stopPreview]);

  const saveTheme = useCallback(async () => {
    setSaveError(null);
    setSavedMessage(null);

    if (!themeName.trim()) {
      setSaveError("Theme name is required");
      return;
    }

    if (Object.keys(theme).length === 0) {
      setSaveError("Theme must have at least one sound");
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

      setSavedMessage(`Theme "${data.name}" saved successfully!`);

      // Auto-dismiss success message after 3 seconds
      if (savedMessageTimerRef.current) {
        clearTimeout(savedMessageTimerRef.current);
      }
      savedMessageTimerRef.current = setTimeout(() => {
        setSavedMessage(null);
      }, 3000);

      // Call callback if provided
      if (onThemeSaved) {
        onThemeSaved(data.id, data.name);
      }

      // Reset form
      setThemeName("");
      setThemeDescription("");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save theme",
      );
    } finally {
      setIsSaving(false);
    }
  }, [theme, themeName, themeDescription, onThemeSaved]);

  const themeHasSounds = Object.keys(theme).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Theme Builder
          </h2>
          <p className="text-xs text-muted-foreground">
            Create a custom sound theme or choose from presets.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            stopPreview();
            setTheme({});
            setThemeName("");
            setThemeDescription("");
            setSaveError(null);
            setSavedMessage(null);
          }}
        >
          <RiResetLeftLine />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Presets</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              onClick={() => applyPreset(key)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Slider
          label="Pitch"
          value={pitch}
          min={-12}
          max={12}
          step={1}
          display={`${pitch > 0 ? "+" : ""}${pitch} st`}
          onChange={setPitch}
        />
        <Slider
          label="Duration"
          value={duration}
          min={0.25}
          max={3}
          step={0.05}
          display={`${duration.toFixed(2)}x`}
          onChange={setDuration}
        />
        <Slider
          label="Gain"
          value={gain}
          min={0}
          max={2}
          step={0.05}
          display={`${Math.round(gain * 100)}%`}
          onChange={setGain}
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Sounds</div>
        <div className="flex flex-wrap gap-2">
          {[
            "click",
            "hover",
            "success",
            "error",
            "warning",
            "notification",
          ].map((soundName) => (
            <Button
              key={soundName}
              type="button"
              variant={theme[soundName] ? "default" : "outline"}
              onClick={() => {
                if (theme[soundName]) {
                  removeSound(soundName);
                } else {
                  addSound(soundName);
                }
              }}
              className="text-xs"
            >
              {theme[soundName] ? <RiCheckLine /> : null}
              {soundName}
            </Button>
          ))}
        </div>
      </div>

      {themeHasSounds && (
        <>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={playPreview}
              disabled={Object.keys(theme).length === 0}
            >
              {isPlaying ? <RiStopFill /> : <RiPlayFill />}
              {isPlaying ? "Stop" : "Preview"}
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Theme JSON</h3>
              <div className="relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30">
                <code className="block overflow-x-auto whitespace-pre-wrap break-words px-4 py-3 text-xs font-mono text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {JSON.stringify(theme, null, 2)}
                </code>
              </div>
            </div>
          </div>

          {isLoggedIn && (
            <div className="rounded-lg border bg-card p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Save Theme</h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="theme-name"
                      className="block text-xs font-medium mb-1.5"
                    >
                      Theme Name *
                    </label>
                    <input
                      id="theme-name"
                      type="text"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="e.g., My Custom Theme"
                      className="w-full h-8 border border-input bg-background px-3 text-xs rounded-md outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="theme-description"
                      className="block text-xs font-medium mb-1.5"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="theme-description"
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder="Describe your theme..."
                      className="w-full h-20 border border-input bg-background px-3 py-2 text-xs rounded-md outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 resize-none"
                    />
                  </div>

                  {saveError && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                      {saveError}
                    </div>
                  )}

                  {savedMessage && (
                    <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-xs text-green-700 dark:text-green-400">
                      {savedMessage}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={saveTheme}
                    disabled={isSaving || !themeName.trim()}
                    className="w-full"
                  >
                    <RiDownloadCloud2Line />
                    {isSaving ? "Saving..." : "Save Theme"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
