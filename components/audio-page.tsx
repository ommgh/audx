"use client";

import { SoundsCountTitle } from "@/components/audio-count-title";
import { SoundGrid } from "@/components/audio-grid";
import { GlobalFilters } from "@/components/global-fiters";
import { Hero } from "@/components/hero";
import { useGlobalFilters } from "@/hooks/use-global-filters";
import { useHoverPreview } from "@/hooks/use-hover-preview";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { cn } from "@/lib/utils";

interface AudioPageProps {
	items: AudioCatalogItem[];
}

export function AudioPage({ items }: AudioPageProps) {
	const { deferredItems, isPending } = useGlobalFilters({
		items,
	});

	const { onPreviewStart, onPreviewStop } = useHoverPreview();

	return (
		<>
			<Hero items={items} />
			<GlobalFilters items={items} />

			{/* ── Content ── */}
			<main
				id="main-content"
				className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 border-x"
			>
				<div className="flex items-center justify-between">
					<SoundsCountTitle count={deferredItems.length} />
				</div>

				<div
					className={cn(
						"transition-opacity duration-150",
						isPending ? "opacity-50" : "opacity-100",
					)}
				>
					<SoundGrid
						items={deferredItems}
						onPreviewStart={onPreviewStart}
						onPreviewStop={onPreviewStop}
					/>
				</div>
			</main>
		</>
	);
}
