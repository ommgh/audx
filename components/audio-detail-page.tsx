"use client";

import { usePatch } from "@litlab/audx/react";
import { RiArrowLeftSLine } from "@remixicon/react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { SoundInstallInstructions } from "@/components/audio-install-instructions";
import { PlayerStrip } from "@/components/player/audio-player";
import { trackEvent } from "@/lib/analytics";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { generateAudioWaves } from "@/lib/audio-data";
import { AudioEditor } from "./editor/audio-editor";

type PlayState = "idle" | "loading" | "playing";
/* ── Main page component ── */

interface AudioDetailPageProps {
	audio: AudioCatalogItem;
	otherThemes: { theme: string; href: string; description?: string }[];
}

export function SoundDetailPage({ audio, otherThemes }: AudioDetailPageProps) {
	const patch = usePatch(`/api/audio/theme/${audio.meta.theme}`);
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
		trackEvent("play_sound", {
			sound: audio.meta.semanticName,
			theme: audio.meta.theme,
			location: "sound_page",
		});
		setPlayState("playing");

		// auto-reset after the sound's natural duration
		const durationMs = audio.meta.duration * 1000 + 100;
		timerRef.current = setTimeout(() => setPlayState("idle"), durationMs);
	}, [
		patch,
		playState,
		audio.meta.semanticName,
		audio.meta.theme,
		audio.meta.duration,
	]);

	return (
		<div className="flex min-h-dvh flex-col">
			{/* ── Back navigation ── */}
			<nav className="mx-auto w-full max-w-6xl py-2 px-6 border-x">
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground bg-secondary/30 transition-colors duration-150 hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
					aria-label="Back to library"
				>
					<RiArrowLeftSLine size={16} />
				</Link>
			</nav>

			<main
				id="main-content"
				className="mx-auto w-full max-w-6xl border-x flex-1 px-6 pb-16"
			>
				{/* ── Top section: visualization square (left) + info (right) ── */}
				<section className="flex flex-col sm:flex-row items-start gap-6 pt-4 pb-6">
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

						<SoundInstallInstructions
							soundName={audio.meta.semanticName}
							theme={audio.meta.theme}
						/>
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
				<section className="py-4">
					<AudioEditor
						definition={audio.definition}
						soundName={audio.meta.semanticName}
						theme={audio.meta.theme}
					/>
				</section>

				<UsageSection soundName={audio.meta.semanticName} />

				{otherThemes.length > 0 ? (
					<section
						aria-labelledby="other-themes-heading"
						className="border-t -mx-6 px-6 py-6"
					>
						<h2
							id="other-themes-heading"
							className="text-sm font-medium text-foreground"
						>
							{audio.title} in other themes
						</h2>
						<ul className="mt-3 grid gap-2 sm:grid-cols-3">
							{otherThemes.map((t) => (
								<li key={t.theme}>
									<Link
										href={t.href}
										className="flex h-full flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2.5 transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										<span className="text-sm font-medium capitalize">
											{t.theme} {audio.meta.semanticName} sound
										</span>
										{t.description ? (
											<span className="text-muted-foreground line-clamp-2 text-xs">
												{t.description}
											</span>
										) : null}
									</Link>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</main>
		</div>
	);
}

/* ── Usage snippet ── */

function UsageSection({ soundName }: { soundName: string }) {
	// `delete` is a reserved word, so the generated export is `deleteSound`.
	const fn = soundName === "delete" ? "deleteSound" : soundName;
	return (
		<section
			aria-labelledby="usage-heading"
			className="border-t -mx-6 px-6 py-6"
		>
			<h2 id="usage-heading" className="text-sm font-medium text-foreground">
				Use it in your code
			</h2>
			<p className="text-muted-foreground mt-1 text-xs">
				The CLI writes the sound to{" "}
				<code className="font-mono">src/sounds/</code> as TypeScript you own.
				Call it from any event handler, or wrap it in{" "}
				<code className="font-mono">useSound</code> in React to respect mute,
				volume and reduced motion.
			</p>
			<pre className="mt-3 overflow-x-auto rounded-lg border border-border/50 bg-secondary/30 px-4 py-3 font-mono text-xs leading-relaxed">
				<code>{`import { useSound } from "@litlab/audx/react";
import { ${fn} } from "@/sounds";

${fn}(); // plain call, works in any framework

function Button() {
  const play = useSound(${fn});
  return <button onClick={play}>Go</button>;
}`}</code>
			</pre>
		</section>
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
					className="flex-1 max-w-2 rounded-full bg-muted-foreground/30"
					style={{ height: `${bar.height}%` }}
				/>
			))}
		</div>
	);
}
