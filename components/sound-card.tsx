"use client";

import { Check } from "lucide-react";
import { memo } from "react";
import { MiniSoundEqualizer } from "@/components/mini-sound-equalizer";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration } from "@/lib/audio-catalog";
import { cn } from "@/lib/utils";

interface AudioCardProps {
  item: AudioCatalogItem;
  selected?: boolean;
  selectMode?: boolean;
  onSelect: (item: AudioCatalogItem) => void;
  onBatchSelect?: (audioName: string) => void;
  onPreviewStart: (audioName: string) => void;
  onPreviewStop: () => void;
}

export const AudioCard = memo(function AudioCard({
  item,
  selected = false,
  selectMode = false,
  onSelect,
  onBatchSelect,
  onPreviewStart,
  onPreviewStop,
}: AudioCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      e.preventDefault();
      onBatchSelect?.(item.name);
      return;
    }
    if (selectMode) {
      onBatchSelect?.(item.name);
      return;
    }
    onSelect(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerEnter={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        onPreviewStart(item.name);
      }}
      onPointerLeave={onPreviewStop}
      onFocus={() => onPreviewStart(item.name)}
      onBlur={onPreviewStop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border p-4 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/[0.06] ring-1 ring-primary/30 scale-[0.97] transition-[border-color,box-shadow,transform] duration-200"
          : "border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] hover:scale-[1.03] active:scale-[0.97] transition-[border-color,box-shadow,transform] duration-200",
      )}
    >
      {/* Selection indicator */}
      {selectMode || selected ? (
        <span
          className={cn(
            "absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full border-2 transition-[transform,opacity,color,background-color,border-color] duration-150",
            selected
              ? "border-primary bg-primary text-primary-foreground scale-100"
              : "border-muted-foreground/30 bg-card/80 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100",
          )}
        >
          {selected ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
      ) : null}

      {/* Mini equalizer bars */}
      <MiniSoundEqualizer name={item.name} selected={selected} />

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
