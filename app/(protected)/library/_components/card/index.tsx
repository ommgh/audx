"use client";

import { loadPatch } from "@litlab/audx";
import { RiPauseFill, RiPlayFill } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisualizer } from "@/components/controls/visualizer";
import type { ThemeWithStats } from "@/lib/data/themes";

function generateColorFromName(name: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash >> 8) % 20);
  const lightness = 45 + (Math.abs(hash >> 16) % 15);
  return {
    "--color-primary": `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    "--color-primary-light": `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`,
    "--color-primary-dark": `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`,
  } as CSSProperties;
}

interface CardProps {
  theme: ThemeWithStats;
  isActive: boolean;
  registerStop: (themeId: number, stop: () => void) => () => void;
  requestPlay: (themeId: number) => void;
  clearActive: (themeId: number) => void;
}

export function Card({
  theme,
  isActive,
  registerStop,
  requestPlay,
  clearActive,
}: CardProps) {
  const [playing, setPlaying] = useState(false);
  const themeRef = useRef<Awaited<ReturnType<typeof loadPatch>> | null>(null);
  const voiceRef = useRef<{ stop: (t?: number) => void } | null>(null);
  const playRequestRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { start: startVis, stop: stopVis } = useVisualizer(canvasRef);

  const stopPlayback = useCallback(() => {
    playRequestRef.current += 1;
    if (voiceRef.current) {
      voiceRef.current.stop();
      voiceRef.current = null;
    }
    stopVis();
    setPlaying(false);
  }, [stopVis]);

  useEffect(
    () => registerStop(theme.id, stopPlayback),
    [theme.id, registerStop, stopPlayback],
  );

  useEffect(() => {
    if (!isActive && playing) stopPlayback();
  }, [isActive, playing, stopPlayback]);

  const handlePlay = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isActive && voiceRef.current) {
        stopPlayback();
        clearActive(theme.id);
        return;
      }

      requestPlay(theme.id);
      playRequestRef.current += 1;
      const requestId = playRequestRef.current;

      try {
        if (!themeRef.current) {
          themeRef.current = await loadPatch(`/api/audio/theme/${theme.name}`);
        }
        if (requestId !== playRequestRef.current) return;

        const p = themeRef.current;
        const sounds = p.sounds;
        if (sounds.length === 0) return;

        startVis();
        const sound = sounds[Math.floor(Math.random() * sounds.length)];
        const voice = p.play(sound);
        voiceRef.current = voice;
        setPlaying(true);

        setTimeout(() => {
          if (requestId !== playRequestRef.current) return;
          if (voiceRef.current === voice) {
            stopPlayback();
            clearActive(theme.id);
          }
        }, 400);
      } catch {
        if (requestId !== playRequestRef.current) return;
        stopPlayback();
        clearActive(theme.id);
        setPlaying(false);
      }
    },
    [
      isActive,
      stopPlayback,
      clearActive,
      theme.id,
      requestPlay,
      theme.name,
      startVis,
    ],
  );

  const colorVars = useMemo(
    () => generateColorFromName(theme.name),
    [theme.name],
  );

  const MotionPause = motion(RiPauseFill);
  const MotionPlay = motion(RiPlayFill);

  const iconProps = {
    size: 18,
    initial: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
  };

  return (
    <div className="flex flex-col gap-2" style={colorVars}>
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center w-full py-12 overflow-hidden transition-colors duration-200"
        style={{
          background: playing
            ? "color-mix(in srgb, var(--color-primary) 14%, transparent)"
            : "color-mix(in srgb, var(--color-primary) 8%, transparent)",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={
            {
              "--vis-color-low": "var(--color-primary-light)",
              "--vis-color-mid": "var(--color-primary)",
              "--vis-color-high": "var(--color-primary-dark)",
            } as CSSProperties
          }
        />
        <motion.button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-full text-white cursor-pointer border-none transition-all duration-150 active:scale-95 hover:scale-[1.08]"
          style={{
            background: playing
              ? "color-mix(in srgb, var(--color-primary) 65%, transparent)"
              : "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            backdropFilter: "blur(8px)",
          }}
          onClick={handlePlay}
          aria-label={playing ? "Stop preview" : "Preview sound"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {playing ? (
              <MotionPause {...iconProps} />
            ) : (
              <MotionPlay {...iconProps} />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Footer */}
      <div className="flex gap-3 items-center justify-between">
        <Link
          href={`/library/${theme.name}`}
          className="flex flex-col gap-0.5 no-underline"
        >
          <span className="text-xs font-semibold text-foreground capitalize">
            {theme.name}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {theme.author}
          </span>
        </Link>
        <Link
          href={`/library/${theme.name}`}
          className="shrink-0 px-3 py-1 text-sm font-semibold text-foreground border border-border hover:opacity-85 transition-all duration-200 active:translate-y-px no-underline"
        >
          View
        </Link>
      </div>
    </div>
  );
}
