"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration } from "@/lib/audio-catalog";
import { generateAudioWaves } from "@/lib/audio-data";

interface AudioCardProps {
	item: AudioCatalogItem;
	onPreviewStart: (audioName: string) => void;
	onPreviewStop: () => void;
}

export const AudioCard = memo(function AudioCard({
	item,
	onPreviewStart,
	onPreviewStop,
}: AudioCardProps) {
	return (
		<Link
			href={`/audio/${item.name}`}
			onPointerEnter={(e) => {
				e.currentTarget.focus({ preventScroll: true });
				onPreviewStart(item.name);
			}}
			onPointerLeave={onPreviewStop}
			onFocus={() => onPreviewStart(item.name)}
			onBlur={onPreviewStop}
			className="group relative flex cursor-pointer flex-col items-center gap-3 border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			{/* Static equalizer bars */}
			<StaticBars name={item.name} />

			{/* Audio name */}
			<span className="line-clamp-1 text-center text-sm font-medium">
				{item.title}
			</span>

			{/* Duration */}
			<span className="text-muted-foreground text-xs">
				{formatDuration(item.meta.duration)}
			</span>
		</Link>
	);
});

function StaticBars({ name }: { name: string }) {
	const bars = useMemo(() => generateAudioWaves(name), [name]);

	return (
		<div
			className="flex items-end justify-center gap-[3px] h-10"
			aria-hidden="true"
		>
			{bars.map((bar, i) => (
				<span
					key={`${name}-${i}-${bar.height}`}
					className="w-[3.5px] bg-muted-foreground/20 group-hover:bg-primary/70 transition-colors"
					style={{ height: `${bar.height}%` }}
				/>
			))}
		</div>
	);
}
