import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import { useHoverPreview } from "@/hooks/use-hover-preview";
import { trackEvent } from "@/lib/analytics";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

export const useAudioSelection = ({ items }: { items: AudioCatalogItem[] }) => {
  const { onPreviewStop } = useHoverPreview();
  const { query } = useGlobalFilters({ items });
  const prevFiltersRef = useRef({ query });

  const [audioParam, setAudioParam] = useQueryState(
    "sound",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );

  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    () => new Set(),
  );
  const selectMode = selectedNames.size > 0;

  const handleBatchSelect = (name: string) => {
    const wasSelected = selectedNames.has(name);
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
    trackEvent("batch_selection_changed", {
      action: wasSelected ? "remove" : "add",
      count: wasSelected ? selectedNames.size - 1 : selectedNames.size + 1,
    });
  };

  const handleClearSelection = () => setSelectedNames(new Set());

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

  useEffect(() => {
    if (prevFiltersRef.current.query !== query) {
      prevFiltersRef.current = { query };

      if (selectedNames.size > 0) {
        setSelectedNames(new Set());
      }
    }
  }, [query, selectedNames.size]);

  return {
    selectedNames,
    selectMode,
    handleSelect,
    handleBatchSelect,
    handleClearSelection,
    selectedAudio,
    setAudioParam,
  };
};
