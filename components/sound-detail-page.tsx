"use client";

import { ArrowLeft, Clock, HardDrive, Scale, Tag } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { MetaPill } from "@/components/metal-pill";
import { MiniSoundEqualizer } from "@/components/mini-sound-equalizer";
import { SoundDownloadButton } from "@/components/sound-download-button";
import { SoundInstallInstructions } from "@/components/sound-install-instructions";
import { PlayerStrip } from "@/components/sound-player";
import { useHoverPreview } from "@/hooks/use-hover-preview";
import { useAudioPlayback } from "@/hooks/use-sound-playback";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import { formatDuration, formatSizeKb } from "@/lib/audio-catalog";

/* ── Main page component ── */

interface AudioDetailPageProps {
  audio: AudioCatalogItem;
  relatedAudio: AudioCatalogItem[];
}

export function SoundDetailPage({ audio, relatedAudio }: AudioDetailPageProps) {
  const { playState, toggle } = useAudioPlayback(audio.name);

  const { onPreviewStart, onPreviewStop } = useHoverPreview();

  const tags = audio.meta.tags;

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
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Library
        </Link>
      </nav>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16"
      >
        {/* ── Identity ── */}
        <header className="pt-4 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  UI Audio
                </span>
                <span className="text-muted-foreground text-xs">
                  by {audio.author}
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-balance sm:text-4xl">
                {audio.title}
              </h1>
              {audio.description ? (
                <p className="mt-2 text-muted-foreground text-base leading-relaxed text-pretty max-w-xl">
                  {audio.description}
                </p>
              ) : null}
            </div>

            <SoundDownloadButton name={audio.name} />
          </div>
        </header>

        {/* ── Player ── */}
        <div>
          <PlayerStrip
            name={audio.name}
            playState={playState}
            onToggle={toggle}
          />
        </div>

        {/* ── Metadata ── */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <MetaPill icon={Clock}>
            {formatDuration(audio.meta.duration)}
          </MetaPill>
          <MetaPill icon={HardDrive}>
            {formatSizeKb(audio.meta.sizeKb)}
          </MetaPill>
          <MetaPill icon={Scale}>{audio.meta.license}</MetaPill>
          {tags.length > 0 ? (
            <MetaPill icon={Tag}>
              {tags.slice(0, 4).join(", ")}
              {tags.length > 4 ? ` +${tags.length - 4}` : null}
            </MetaPill>
          ) : null}
        </div>

        {/* ── Integration code ── */}
        <div className="mt-8">
          <SoundInstallInstructions soundName={audio.name} />
        </div>

        {/* ── Related audio ── */}
        {relatedAudio.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-balance">
                More UI Audio
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {relatedAudio.map((s) => (
                <RelatedAudioCard
                  key={s.name}
                  item={s}
                  onPreviewStart={onPreviewStart}
                  onPreviewStop={onPreviewStop}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

const RelatedAudioCard = memo(function RelatedAudioCard({
  item,
  onPreviewStart,
  onPreviewStop,
}: {
  item: AudioCatalogItem;
  onPreviewStart: (name: string) => void;
  onPreviewStop: () => void;
}) {
  return (
    <Link
      href={`/sound/${item.name}`}
      onPointerEnter={() => onPreviewStart(item.name)}
      onPointerLeave={onPreviewStop}
      onFocus={() => onPreviewStart(item.name)}
      onBlur={onPreviewStop}
      className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.08] transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <MiniSoundEqualizer selected={false} name={item.name} />

      <span className="line-clamp-1 text-center text-sm font-medium">
        {item.title}
      </span>

      <span className="text-muted-foreground text-xs">
        {formatDuration(item.meta.duration)}
      </span>
    </Link>
  );
});
