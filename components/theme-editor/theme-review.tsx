"use client";

import { RiPlayLine, RiRefreshLine, RiSaveLine } from "@remixicon/react";
import { useCallback, useRef, useState } from "react";
import type { GeneratedSound } from "@/hooks/use-theme-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/audx/ui/button";

interface ThemeReviewProps {
	previewSounds: Map<string, GeneratedSound>;
	sounds: Map<string, GeneratedSound>;
	progress: { total: number; completed: number; failed: number };
	elapsedMs: number | null;
	onSave: () => void;
	onRetrySound: (semanticName: string) => void;
	isSaving: boolean;
}

function mergeAndGroupByCategory(
	previewSounds: Map<string, GeneratedSound>,
	sounds: Map<string, GeneratedSound>,
): [string, GeneratedSound[]][] {
	const combined = new Map<string, GeneratedSound>();
	for (const [key, value] of previewSounds) {
		combined.set(key, value);
	}
	for (const [key, value] of sounds) {
		combined.set(key, value);
	}

	const grouped = new Map<string, GeneratedSound[]>();
	for (const sound of combined.values()) {
		const list = grouped.get(sound.category) ?? [];
		list.push(sound);
		grouped.set(sound.category, list);
	}
	return Array.from(grouped.entries());
}

function formatDuration(seconds: number): string {
	return `${seconds.toFixed(2)}s`;
}

function estimateFileSize(audioBase64: string | null): string {
	if (!audioBase64) return "—";
	const bytes = audioBase64.length * 0.75;
	const kb = bytes / 1024;
	return `~${Math.round(kb)} KB`;
}

function formatElapsed(ms: number | null): string {
	if (ms === null) return "—";
	const seconds = ms / 1000;
	if (seconds < 60) return `${seconds.toFixed(1)}s`;
	const minutes = Math.floor(seconds / 60);
	const remaining = Math.round(seconds % 60);
	return `${minutes}m ${remaining}s`;
}

export function ThemeReview({
	previewSounds,
	sounds,
	progress,
	elapsedMs,
	onSave,
	onRetrySound,
	isSaving,
}: ThemeReviewProps) {
	const grouped = mergeAndGroupByCategory(previewSounds, sounds);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		() => new Set(grouped.map(([cat]) => cat)),
	);
	const [playingSound, setPlayingSound] = useState<string | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);

	const totalCompleted = progress.completed;
	const totalFailed = progress.failed;
	const canSave = totalCompleted >= 60 && !isSaving;

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

	return (
		<div className="flex flex-col gap-6">
			{/* Summary stats */}
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
				<span>
					<span className="font-medium text-foreground">{totalCompleted}</span>{" "}
					sounds generated
				</span>
				{totalFailed > 0 && (
					<span>
						<span className="font-medium text-red-500">{totalFailed}</span>{" "}
						failed
					</span>
				)}
				<span>{formatElapsed(elapsedMs)} generation time</span>
			</div>

			{/* Category sections */}
			<div className="flex flex-col gap-3">
				{grouped.map(([category, categorySounds]) => {
					const isExpanded = expandedCategories.has(category);
					const completedInCategory = categorySounds.filter(
						(s) => s.status === "completed",
					).length;
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
									{completedInCategory}/{categorySounds.length} completed
									<span className="ml-2">{isExpanded ? "▾" : "▸"}</span>
								</span>
							</button>
							{isExpanded && (
								<div className="border-t border-border/50">
									{categorySounds.map((sound) => (
										<ReviewSoundRow
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

			{/* Save button */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					onClick={onSave}
					disabled={!canSave}
					className="gap-2"
				>
					<RiSaveLine size={16} />
					{isSaving ? "Saving…" : "Save Theme"}
				</Button>
			</div>
		</div>
	);
}

function ReviewSoundRow({
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
			<div className="flex items-center gap-3 min-w-0">
				<span
					className={cn(
						"inline-block h-2 w-2 shrink-0 rounded-full",
						isPlaying && "bg-primary animate-pulse",
						!isPlaying && isCompleted && "bg-green-500",
						isFailed && "bg-red-500",
						sound.status === "pending" && "bg-muted-foreground/30",
						sound.status === "generating" && "bg-yellow-500 animate-pulse",
					)}
					aria-hidden="true"
				/>
				<span className="truncate">{sound.semanticName}</span>
				{isCompleted && (
					<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
						{formatDuration(sound.duration)}
					</span>
				)}
				{isCompleted && (
					<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
						{estimateFileSize(sound.audioBase64)}
					</span>
				)}
			</div>
			<div className="flex items-center gap-2 shrink-0">
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
