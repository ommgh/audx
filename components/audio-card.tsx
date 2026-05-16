"use client";

import Link from "next/link";
import { memo, useCallback, useRef } from "react";
import { useVisualizer } from "@/components/controls/visualizer";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration } from "@/lib/audio-catalog";

interface AudioCardProps {
	item: AudioCatalogItem;
	onPreviewStart: (audioName: string) => void;
}

export const AudioCard = memo(function AudioCard({
	item,
	onPreviewStart,
}: AudioCardProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const visualizer = useVisualizer(canvasRef);

	const startPreview = useCallback(() => {
		visualizer.start();
		onPreviewStart(item.meta.semanticName);
	}, [item.meta.semanticName, onPreviewStart, visualizer]);

	const stopPreview = useCallback(() => {
		visualizer.stop();
	}, [visualizer]);

	return (
		<Link
			href={`/audio/${item.meta.theme}/${item.meta.semanticName}`}
			onPointerEnter={(e) => {
				e.currentTarget.focus({ preventScroll: true });
				startPreview();
			}}
			onPointerLeave={stopPreview}
			onFocus={startPreview}
			onBlur={stopPreview}
			className="group relative flex cursor-pointer flex-col items-center gap-3 border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<canvas
				ref={canvasRef}
				className="mx-auto h-12 w-28 self-center [--vis-color:var(--primary)]"
			/>

			<span className="line-clamp-1 text-center text-sm font-medium">
				{item.meta.semanticName}
			</span>

			<span className="text-muted-foreground text-xs">
				{formatDuration(item.meta.duration)}
			</span>
		</Link>
	);
});
