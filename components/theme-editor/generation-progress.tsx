"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeneratedSound } from "@/hooks/use-theme-editor";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
	sounds: Map<string, GeneratedSound>;
	progress: { total: number; completed: number; failed: number };
	startTime: number | null;
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

function formatTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}
	return `${seconds}s`;
}

export function GenerationProgress({
	sounds,
	progress,
	startTime,
}: GenerationProgressProps) {
	const grouped = groupByCategory(sounds);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		() => new Set(grouped.map(([cat]) => cat)),
	);
	const [elapsedMs, setElapsedMs] = useState<number>(0);

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

	useEffect(() => {
		if (startTime === null) {
			setElapsedMs(0);
			return;
		}
		setElapsedMs(Date.now() - startTime);
		const interval = setInterval(() => {
			setElapsedMs(Date.now() - startTime);
		}, 1000);
		return () => clearInterval(interval);
	}, [startTime]);

	const done = progress.completed + progress.failed;
	const percentage =
		progress.total > 0 ? Math.round((done / progress.total) * 100) : 0;

	const estimatedRemaining =
		done >= 2 && elapsedMs > 0
			? (progress.total - done) * (elapsedMs / done)
			: null;

	return (
		<div className="flex flex-col gap-4">
			{/* Overall progress */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Generating sounds…</span>
					<span className="font-medium tabular-nums">
						{done}/{progress.total} — {percentage}%
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
					<div
						className="h-full rounded-full bg-primary transition-all duration-300"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>

			{/* Time info */}
			<div className="flex flex-col gap-1 text-sm">
				<p className="text-muted-foreground">This may take a few minutes</p>
				<div className="flex items-center gap-4 text-muted-foreground tabular-nums">
					{startTime !== null && <span>Elapsed: {formatTime(elapsedMs)}</span>}
					{startTime !== null && (
						<span>
							{estimatedRemaining !== null
								? `Remaining: ${formatTime(estimatedRemaining)}`
								: "Estimating…"}
						</span>
					)}
				</div>
			</div>

			{/* Category sections */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
				{grouped.map(([category, categorySounds]) => {
					const isExpanded = expandedCategories.has(category);
					return (
						<div
							key={category}
							className="rounded-lg border border-border/50 self-start"
						>
							<button
								type="button"
								onClick={() => toggleCategory(category)}
								className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-secondary/30 transition-colors"
								aria-expanded={isExpanded}
							>
								<span className="capitalize">{category}</span>
								<span className="text-xs text-muted-foreground">
									{categorySounds.length} sounds
									<span className="ml-2">{isExpanded ? "▾" : "▸"}</span>
								</span>
							</button>
							{isExpanded && (
								<div className="border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1">
									{categorySounds.map((sound) => (
										<SoundStatusRow key={sound.semanticName} sound={sound} />
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function SoundStatusRow({ sound }: { sound: GeneratedSound }) {
	return (
		<div className="flex items-center justify-between px-4 py-2.5 text-sm">
			<div className="flex items-center gap-3">
				<span
					className={cn(
						"inline-block h-2 w-2 rounded-full",
						sound.status === "pending" && "bg-muted-foreground/30",
						sound.status === "generating" && "bg-yellow-500 animate-pulse",
						sound.status === "completed" && "bg-green-500",
						sound.status === "failed" && "bg-red-500",
					)}
					aria-hidden="true"
				/>
				<span
					className={cn(sound.status === "pending" && "text-muted-foreground")}
				>
					{sound.semanticName}
				</span>
			</div>
			{sound.status === "failed" && sound.error && (
				<span className="text-xs text-red-500 truncate max-w-48">
					{sound.error}
				</span>
			)}
		</div>
	);
}
