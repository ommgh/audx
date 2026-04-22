"use client";

import {
	RiCheckLine,
	RiLoader4Line,
	RiPlayFill,
	RiRefreshLine,
} from "@remixicon/react";
import type { GeneratedSound } from "@/hooks/use-theme-editor";
import { Button } from "@/registry/audx/ui/button";

interface PreviewPlayerProps {
	previewSounds: Map<string, GeneratedSound>;
	onApprove: () => void;
	onReject: () => void;
	onRetrySound: (semanticName: string) => void;
}

function CategoryCard({
	sound,
	onPlay,
	onRetry,
}: {
	sound: GeneratedSound;
	onPlay: () => void;
	onRetry: () => void;
}) {
	return (
		<div className="flex flex-col gap-2 rounded-lg border border-border/50 p-4">
			<span className="text-xs font-medium text-muted-foreground capitalize">
				{sound.category}
			</span>
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">{sound.semanticName}</span>
				{sound.status === "completed" && (
					<button
						type="button"
						onClick={onPlay}
						className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
						aria-label={`Play ${sound.semanticName}`}
					>
						<RiPlayFill size={16} />
					</button>
				)}
				{sound.status === "failed" && (
					<button
						type="button"
						onClick={onRetry}
						className="rounded-md p-1.5 text-red-500 hover:text-red-400 hover:bg-secondary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
						aria-label={`Retry ${sound.semanticName}`}
					>
						<RiRefreshLine size={16} />
					</button>
				)}
				{sound.status === "generating" && (
					<RiLoader4Line
						size={16}
						className="animate-spin text-muted-foreground"
					/>
				)}
				{sound.status === "pending" && (
					<RiCheckLine size={16} className="text-muted-foreground/30" />
				)}
			</div>
		</div>
	);
}

export function PreviewPlayer({
	previewSounds,
	onApprove,
	onReject,
	onRetrySound,
}: PreviewPlayerProps) {
	const sounds = Array.from(previewSounds.values());

	const playSound = (sound: GeneratedSound) => {
		if (sound.audioUrl) {
			new Audio(sound.audioUrl).play();
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{sounds.map((sound) => (
					<CategoryCard
						key={sound.semanticName}
						sound={sound}
						onPlay={() => playSound(sound)}
						onRetry={() => onRetrySound(sound.semanticName)}
					/>
				))}
			</div>

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
