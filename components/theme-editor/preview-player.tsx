"use client";

import { RiPlayLine, RiRefreshLine } from "@remixicon/react";
import { useCallback, useRef, useState } from "react";
import type { GeneratedSound } from "@/hooks/use-theme-editor";
import type { CostEstimate } from "@/lib/credit-cost";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/audx/ui/button";

interface PreviewPlayerProps {
	previewSounds: Map<string, GeneratedSound>;
	fullCost: CostEstimate;
	onApprove: () => void;
	onReject: () => void;
	onRetrySound: (semanticName: string) => void;
}

function groupByCategory(
	sounds: Map<string, GeneratedSound>,
): [string, GeneratedSound[]][] {
	const map = new Map<string, GeneratedSound[]>();
	for (const sound of sounds.values()) {
		const list = map.get(sound.category) ?? [];
		list.push(sound);
		map.set(sound.category, list);
	}
	return Array.from(map.entries());
}

export function PreviewPlayer({
	previewSounds,
	fullCost,
	onApprove,
	onReject,
	onRetrySound,
}: PreviewPlayerProps) {
	const grouped = groupByCategory(previewSounds);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		() => new Set(grouped.map(([cat]) => cat)),
	);
	const [playingSound, setPlayingSound] = useState<string | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);

	const toggleCategory = useCallback((category: string) => {
		setExpandedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(category)) {
				next.delete(category);
			} else {
				next.add(category);
			}
			return next;
		});
	}, []);

	const playSound = useCallback(async (sound: GeneratedSound) => {
		if (!sound.audioUrl || typeof window === "undefined") return;
		try {
			if (!audioCtxRef.current) {
				audioCtxRef.current = new AudioContext();
			}
			const ctx = audioCtxRef.current;
			const response = await fetch(sound.audioUrl);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = await ctx.decodeAudioData(arrayBuffer);
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start();

			setPlayingSound(sound.semanticName);
			source.onended = () => setPlayingSound(null);
		} catch {
			setPlayingSound(null);
		}
	}, []);

	const costLabel = `~${fullCost.totalCredits} credits (~$${fullCost.approximateDollars.toFixed(2)})`;

	return (
		<div className="flex flex-col gap-6">
			{/* Category sections */}
			<div className="flex flex-col gap-3">
				{grouped.map(([category, categorySounds]) => {
					const isExpanded = expandedCategories.has(category);
					return (
						<div key={category} className="rounded-lg border border-border/50">
							<button
								type="button"
								onClick={() => toggleCategory(category)}
								className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-secondary/30 transition-colors"
								aria-expanded={isExpanded}
							>
								<span className="capitalize">{category}</span>
								<span className="text-xs text-muted-foreground">
									{categorySounds.length}{" "}
									{categorySounds.length === 1 ? "sound" : "sounds"}
									<span className="ml-2">{isExpanded ? "▾" : "▸"}</span>
								</span>
							</button>
							{isExpanded && (
								<div className="border-t border-border/50">
									{categorySounds.map((sound) => (
										<PreviewSoundRow
											key={sound.semanticName}
											sound={sound}
											isPlaying={playingSound === sound.semanticName}
											onPlay={() => playSound(sound)}
											onRetry={() => onRetrySound(sound.semanticName)}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Cost estimate */}
			<p className="text-muted-foreground text-sm">
				Full generation cost: {costLabel}
			</p>

			{/* Action buttons */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<Button type="button" variant="secondary" onClick={onReject}>
					Try Again
				</Button>
				<Button type="button" onClick={onApprove}>
					Approve &amp; Generate Full Theme
				</Button>
			</div>
		</div>
	);
}

function PreviewSoundRow({
	sound,
	isPlaying,
	onPlay,
	onRetry,
}: {
	sound: GeneratedSound;
	isPlaying: boolean;
	onPlay: () => void;
	onRetry: () => void;
}) {
	const isCompleted = sound.status === "completed";
	const isFailed = sound.status === "failed";

	return (
		<div
			className={cn(
				"flex items-center justify-between px-4 py-2.5 text-sm",
				isPlaying && "bg-primary/5",
			)}
		>
			<div className="flex items-center gap-3">
				<span
					className={cn(
						"inline-block h-2 w-2 rounded-full",
						isPlaying && "bg-primary animate-pulse",
						!isPlaying && isCompleted && "bg-green-500",
						isFailed && "bg-red-500",
						sound.status === "pending" && "bg-muted-foreground/30",
						sound.status === "generating" && "bg-yellow-500 animate-pulse",
					)}
					aria-hidden="true"
				/>
				<span>{sound.semanticName}</span>
			</div>
			<div className="flex items-center gap-2">
				{isCompleted && (
					<button
						type="button"
						onClick={onPlay}
						className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
						aria-label={`Play ${sound.semanticName}`}
					>
						<RiPlayLine size={16} />
					</button>
				)}
				{isFailed && (
					<button
						type="button"
						onClick={onRetry}
						className="rounded-md p-1.5 text-red-500 hover:text-red-400 hover:bg-secondary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
						aria-label={`Retry ${sound.semanticName}`}
					>
						<RiRefreshLine size={16} />
					</button>
				)}
			</div>
		</div>
	);
}
