"use client";

import { Download, Loader2, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/registry/audx/ui/button";
import { Label } from "@/registry/audx/ui/label";
import { Textarea } from "@/registry/audx/ui/textarea";
import { cn } from "@/lib/utils";
import { useSoundGenerator } from "@/hooks/use-sound-generator";

const SUGGESTION_CHIPS = [
  "Soft click",
  "Notification chime",
  "Subtle whoosh",
  "Error buzz",
  "Success ding",
  "Keyboard tap",
] as const;

const DURATION_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Auto", value: null },
  { label: "0.5s", value: 0.5 },
  { label: "1s", value: 1 },
  { label: "2s", value: 2 },
  { label: "3s", value: 3 },
  { label: "5s", value: 5 },
  { label: "8s", value: 8 },
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
  { label: "22s", value: 22 },
];

export function GenerateSound() {
  const {
    prompt,
    setPrompt,
    durationSeconds,
    setDurationSeconds,
    promptInfluence,
    setPromptInfluence,
    isGenerating,
    error,
    audioUrl,
    generate,
  } = useSoundGenerator();

  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Generate a Sound
        </h1>
        <p className="text-muted-foreground text-base text-pretty max-w-xl">
          Describe any UI sound and let AI create it for you. Try a suggestion
          or type your own prompt.
        </p>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setPrompt(chip)}
            disabled={isGenerating}
            className={cn(
              "rounded-full border border-border/50 bg-card px-3 py-1.5 text-sm font-medium transition-colors",
              "hover:border-primary/30 hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt-input">Prompt</Label>
        <Textarea
          id="prompt-input"
          placeholder="Describe a sound..."
          maxLength={500}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          className="min-h-24 resize-none"
        />
        <span className="text-muted-foreground text-xs text-right">
          {prompt.length}/500
        </span>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        {/* Duration Control */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="duration-select">Duration</Label>
          <select
            id="duration-select"
            value={durationSeconds === null ? "" : String(durationSeconds)}
            onChange={(e) => {
              const val = e.target.value;
              setDurationSeconds(val === "" ? null : Number(val));
            }}
            disabled={isGenerating}
            className={cn(
              "h-9 rounded-md border border-input bg-background px-3 text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {DURATION_OPTIONS.map((opt) => (
              <option
                key={opt.label}
                value={opt.value === null ? "" : String(opt.value)}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Influence Slider */}
        <div className="flex flex-col gap-2 flex-1 max-w-xs">
          <Label htmlFor="prompt-influence-slider">
            Prompt Influence:{" "}
            <span className="text-muted-foreground font-normal">
              {Math.round(promptInfluence * 100)}%
            </span>
          </Label>
          <input
            id="prompt-influence-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={promptInfluence}
            onChange={(e) => setPromptInfluence(Number(e.target.value))}
            disabled={isGenerating}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div>
        <Button
          onClick={generate}
          disabled={!prompt.trim() || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {/* Audio Result */}
      {audioUrl ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4">
          <audio ref={audioRef} controls src={audioUrl} className="w-full">
            <track kind="captions" />
          </audio>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <a href={audioUrl} download="generated-sound.mp3">
                <Download className="size-4" />
                Download
              </a>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
