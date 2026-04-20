import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { useHoverPreview } from "@/hooks/use-hover-preview";
import { trackEvent } from "@/lib/analytics";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

export const useAudioSelection = ({ items }: { items: AudioCatalogItem[] }) => {
  const { onPreviewStop } = useHoverPreview();

  const [audioParam, setAudioParam] = useQueryState(
    "sound",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );

  // Build a name→item lookup for deep linking
  const itemsByName = useMemo(() => {
    const map = new Map<string, AudioCatalogItem>();
    for (const s of items) {
      map.set(s.name, s);
    }
    return map;
  }, [items]);

  // Resolve the selected audio from URL param or null
  const selectedAudio = audioParam
    ? (itemsByName.get(audioParam) ?? null)
    : null;

  const handleSelect = (item: AudioCatalogItem) => {
    onPreviewStop();
    setAudioParam(item.name);
    trackEvent("audio_detail_opened", { audioName: item.name });
  };

  return {
    handleSelect,
    selectedAudio,
    setAudioParam,
  };
};
