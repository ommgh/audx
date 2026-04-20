import { SoundSearch } from "@/components/sound-search";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

type GlobalFiltersProps = {
  items: AudioCatalogItem[];
};

export function GlobalFilters({ items }: GlobalFiltersProps) {
  const { query, setQuery } = useGlobalFilters({ items });

  return (
    <div className="bg-background/95 sticky top-0 z-40 border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-3">
        <SoundSearch value={query} onChange={setQuery} />
      </div>
    </div>
  );
}
