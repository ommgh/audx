import { SoundSearch } from "@/components/sound-search";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

type GlobalFiltersProps = {
  items: AudioCatalogItem[];
  onApplySearch: () => void;
};

export function GlobalFilters({ items, onApplySearch }: GlobalFiltersProps) {
  const { query, setQuery } = useGlobalFilters({ items });

  return (
    <div
      className="stagger-fade-up bg-background/95 sticky top-0 z-40 border-b"
      style={{ animationDelay: "200ms" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-3">
        <SoundSearch
          value={query}
          onChange={setQuery}
          onEnterGrid={onApplySearch}
        />
      </div>
    </div>
  );
}
