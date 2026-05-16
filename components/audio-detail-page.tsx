"use client";

import { usePatch } from "@litlab/audx/react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { SoundInstallInstructions } from "@/components/audio-install-instructions";
import { PlayerStrip } from "@/components/player/audio-player";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { generateAudioWaves } from "@/lib/audio-data";

type PlayState = "idle" | "loading" | "playing";
/* ── Main page component ── */

interface AudioDetailPageProps {
	audio: AudioCatalogItem;
}

export function SoundDetailPage({ audio }: AudioDetailPageProps) {
	const patch = usePatch(`/themes/${audio.meta.theme}.json`);
	const [playState, setPlayState] = useState<PlayState>("idle");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleToggle = useCallback(() => {
		if (playState === "playing") {
			// no way to stop a patch sound early; just reset the state indicator
			if (timerRef.current) clearTimeout(timerRef.current);
			setPlayState("idle");
			return;
		}

		patch.play(audio.meta.semanticName);
		setPlayState("playing");

		// auto-reset after the sound's natural duration
		const durationMs = audio.meta.duration * 1000 + 100;
		timerRef.current = setTimeout(() => setPlayState("idle"), durationMs);
	}, [patch, playState, audio.meta.semanticName, audio.meta.duration]);

	return (
		<div className="flex min-h-dvh flex-col">
			{/* ── Back navigation ── */}
			<nav className="mx-auto w-full max-w-6xl px-6 pt-6 pb-2 border-x">
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
					aria-label="Back to library"
				>
					&lt;
				</Link>
			</nav>

			<main
				id="main-content"
				className="mx-auto w-full max-w-6xl border-x flex-1 px-6 pb-16"
			>
				{/* ── Top section: visualization square (left) + info (right) ── */}
				<section className="flex flex-col sm:flex-row items-start gap-6 pt-4 pb-8">
					{/* Square visualization */}
					<div className="shrink-0 flex items-center justify-center rounded-2xl border border-border/50 bg-secondary/30 size-40 overflow-hidden">
						<LargeStaticBars name={audio.name} />
					</div>

					{/* Title, description, install */}
					<div className="flex flex-col justify-start gap-3 min-w-0 flex-1 pt-1">
						<div>
							<h1 className="font-display text-3xl font-bold text-balance">
								{audio.title}
							</h1>
							{audio.description ? (
								<p className="mt-1.5 text-muted-foreground text-sm leading-relaxed text-pretty">
									{audio.description}
								</p>
							) : null}
						</div>

						<SoundInstallInstructions soundName={audio.meta.semanticName} />
					</div>
				</section>

				{/* ── Player strip ── */}
				<section className="border-y py-4 -mx-6 px-6">
					<PlayerStrip
						name={audio.name}
						playState={playState}
						onToggle={handleToggle}
					/>
				</section>
			</main>
		</div>
	);
}

/* ── Large static bars visualization ── */

function LargeStaticBars({ name }: { name: string }) {
	const bars = useMemo(() => generateAudioWaves(name), [name]);

	return (
		<div
			className="flex items-end justify-center gap-[5px] w-full px-6"
			style={{ height: "60%" }}
			aria-hidden="true"
		>
			{bars.map((bar, i) => (
				<span
					key={`${name}-${i}-${bar.height}`}
					className="flex-1 max-w-[8px] rounded-full bg-muted-foreground/30"
					style={{ height: `${bar.height}%` }}
				/>
			))}
		</div>
	);
}
