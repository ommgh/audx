"use client";

import { memo } from "react";
import { MiniSoundEqualizer } from "@/components/mini-sound-equalizer";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration } from "@/lib/audio-catalog";

interface AudioCardProps {
  item: AudioCatalogItem;
  onSelect: (item: AudioCatalogItem) => void;
  onPreviewStart: (audioName: string) => void;
  onPreviewStop: () => void;
}

export const AudioCard = memo(function AudioCard({
  item,
  onSelect,
  onPreviewStart,
  onPreviewStop,
}: AudioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      onPointerEnter={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        onPreviewStart(item.name);
      }}
      onPointerLeave={onPreviewStop}
      onFocus={() => onPreviewStart(item.name)}
      onBlur={onPreviewStop}
      className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {/* Mini equalizer bars */}
      <MiniSoundEqualizer name={item.name} selected={false} />

      {/* Audio name */}
      <span className="line-clamp-1 text-center text-sm font-medium">
        {item.title}
      </span>

      {/* Duration */}
      <span className="text-muted-foreground text-xs">
        {formatDuration(item.meta.duration)}
      </span>
    </button>
  );
});
