import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import { trackEvent } from "@/lib/analytics";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { filterAudio } from "@/lib/audio-filters";

export const useGlobalFilters = ({ items }: { items: AudioCatalogItem[] }) => {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: true, throttleMs: 300 }),
  );

  const handleClearFilters = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed) {
      trackEvent("search_used", { query: trimmed });
    }
  }, [query]);

  const filteredItems = useMemo(
    () => filterAudio(items, query),
    [items, query],
  );

  // Keep old cards visible while React prepares new ones
  const deferredItems = useDeferredValue(filteredItems);
  const isPending = deferredItems !== filteredItems;

  return {
    query,
    setQuery,
    filteredItems,
    deferredItems,
    isPending,
    handleClearFilters,
  };
};
