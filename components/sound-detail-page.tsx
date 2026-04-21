"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SoundInstallInstructions } from "@/components/sound-install-instructions";
import { PlayerStrip } from "@/components/sound-player";
import { useAudioPlayback } from "@/hooks/use-sound-playback";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { generateAudioWaves } from "@/lib/audio-data";

/* ── Main page component ── */

interface AudioDetailPageProps {
  audio: AudioCatalogItem;
}

export function SoundDetailPage({ audio }: AudioDetailPageProps) {
  const { playState, toggle } = useAudioPlayback(audio.name);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium"
      >
        Skip to Content
      </a>

      {/* ── Back navigation ── */}
      <nav className="mx-auto w-full max-w-3xl px-6 pt-6 pb-2">
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
        className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16"
      >
        {/* ── Two-column: visualization (left) + name/description (right) ── */}
        <section className="flex flex-col sm:flex-row items-start gap-6 pt-4 pb-8">
          {/* Large sound visualization */}
          <div className="flex shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-secondary/30 w-full sm:w-40 h-32 sm:h-40">
            <LargeStaticBars name={audio.name} />
          </div>

          {/* Name and description */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold text-balance sm:text-4xl">
              {audio.title}
            </h1>
            {audio.description ? (
              <p className="mt-2 text-muted-foreground text-base leading-relaxed text-pretty max-w-xl">
                {audio.description}
              </p>
            ) : null}
          </div>
        </section>

        {/* ── Install command block ── */}
        <section className="pb-8">
          <SoundInstallInstructions soundName={audio.name} />
        </section>

        {/* ── Player strip at the bottom ── */}
        <section>
          <PlayerStrip
            name={audio.name}
            playState={playState}
            onToggle={toggle}
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
      className="flex items-end justify-center gap-[5px] h-20"
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <span
          key={`${name}-${i}-${bar.height}`}
          className="w-[6px] rounded-full bg-muted-foreground/25"
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  );
}
