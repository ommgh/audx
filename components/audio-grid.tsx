import { memo } from "react";
import { AudioCard } from "@/components/audio-card";
import { EmptyBars } from "@/components/empty-bars";
import { Button } from "@/components/ui/button";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

interface AudioGridProps {
	items: AudioCatalogItem[];
	onPreviewStart: (audioName: string) => void;
	onClearFilters: () => void;
}

export const SoundGrid = memo(function SoundGrid({
	items,
	onPreviewStart,
	onClearFilters,
}: AudioGridProps) {
	if (items.length === 0) {
		return (
			<div className="border-border/40 text-muted-foreground rounded-xl border border-dashed px-6 py-20 text-center">
				<EmptyBars />
				<p className="text-sm text-pretty">No audio matches your search.</p>
				<Button
					onClick={onClearFilters}
					className="mt-4 inline-flex items-center rounded-lg border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					Clear filters
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{items.map((item) => (
				<AudioCard
					key={item.name}
					item={item}
					onPreviewStart={onPreviewStart}
				/>
			))}
		</div>
	);
});
