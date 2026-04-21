import { RiLoader4Line, RiPlayFill, RiStopFill } from "@remixicon/react";
import type { PlayState } from "@/hooks/use-sound-playback";
import { cn } from "@/lib/utils";

export function SoundPlayControl({ state }: { state: PlayState }) {
  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  return (
    <span
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full transition-[color,background-color,box-shadow] duration-200",
        isPlaying
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
          : "bg-secondary text-muted-foreground group-hover/player:bg-primary/10 group-hover/player:text-primary",
      )}
    >
      {isLoading ? (
        <RiLoader4Line size={16} />
      ) : isPlaying ? (
        <RiStopFill className="relative" size={14} />
      ) : (
        <RiPlayFill className="relative ml-0.5" size={16} />
      )}
    </span>
  );
}
