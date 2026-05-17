"use client";

import Link from "next/link";
import { memo, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration } from "@/lib/audio-catalog";

const BAR_HEIGHTS = [28, 52, 72, 40, 88, 58, 68, 44];
const BAR_DURATIONS = ["0.65s", "0.80s", "0.70s", "0.90s"];

interface AudioCardProps {
  item: AudioCatalogItem;
  onPreviewStart: (audioName: string) => void;
}

export const AudioCard = memo(function AudioCard({
  item,
  onPreviewStart,
}: AudioCardProps) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setPlaying(true);
    onPreviewStart(item.meta.semanticName);

    const animMs = Math.max(400, item.meta.duration * 1000);
    timerRef.current = setTimeout(() => {
      setPlaying(false);
    }, animMs);
  }, [item.meta.semanticName, item.meta.duration, onPreviewStart]);

  const stopPreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
  }, []);

  return (
    <Link
      href={`/audio/${item.meta.theme}/${item.meta.semanticName}`}
      onPointerEnter={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        startPreview();
      }}
      onPointerLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center gap-3",
        "border border-border/50 bg-card p-4",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8",
        "transition-[border-color,box-shadow] duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
      )}
    >
      {/* Sound bars */}
      <div className="mx-auto flex h-12 w-28 items-end justify-center gap-[3px]">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 origin-bottom",
              "transition-colors duration-150",
              playing ? "bg-primary" : "bg-border/70",
              playing && "animate-[soundbar_1s_ease-in-out_infinite]",
            )}
            style={{
              height: `${h}%`,
              animationDuration: BAR_DURATIONS[i % BAR_DURATIONS.length],
              animationDelay: `${i * 45}ms`,
            }}
          />
        ))}
      </div>

      <span className="line-clamp-1 text-center text-sm font-medium">
        {item.meta.semanticName}
      </span>

      <span className="text-muted-foreground text-xs">
        {formatDuration(item.meta.duration)}
      </span>
    </Link>
  );
});
