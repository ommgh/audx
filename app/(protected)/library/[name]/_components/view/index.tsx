"use client";

import { usePatch } from "@litlab/audx/react";
import {
  RiArrowRightSLine,
  RiCalendarLine,
  RiCheckLine,
  RiDownloadLine,
  RiFileCopyLine,
  RiPlayListLine,
  RiUserLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ThemeSoundsByCategory, ThemeWithStats } from "@/lib/data/themes";

function generateColorFromName(name: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash >> 8) % 20);
  const lightness = 45 + (Math.abs(hash >> 16) % 15);
  return {
    "--color-primary": `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    "--color-primary-light": `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`,
    "--color-primary-dark": `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`,
  } as CSSProperties;
}

function formatLoads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ThemeDetailContextValue {
  theme: ThemeWithStats;
  sounds: ThemeSoundsByCategory[];
}

const ThemeDetailContext = createContext<ThemeDetailContextValue | null>(null);

function useThemeDetail(): ThemeDetailContextValue {
  const ctx = use(ThemeDetailContext);
  if (!ctx) {
    throw new Error("useThemeDetail must be used within ThemeDetail.Root");
  }
  return ctx;
}

function Root({
  theme,
  sounds,
  children,
}: {
  theme: ThemeWithStats;
  sounds: ThemeSoundsByCategory[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 items-start w-full px-6 pt-8 pb-12">
      <ThemeDetailContext value={{ theme, sounds }}>
        {children}
      </ThemeDetailContext>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 items-start w-full">{children}</div>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 items-start w-full">{children}</div>
  );
}

function Breadcrumb() {
  const { theme } = useThemeDetail();

  return (
    <nav className="flex gap-2 items-center text-xs text-muted-foreground">
      <Link
        href="/library"
        className="no-underline hover:text-foreground transition-colors duration-200"
      >
        Library
      </Link>
      <span className="text-muted-foreground/50 flex items-center">
        <RiArrowRightSLine size={12} />
      </span>
      <span className="text-foreground font-semibold capitalize">
        {theme.name}
      </span>
    </nav>
  );
}

function Description() {
  const { theme } = useThemeDetail();
  if (!theme.description) return null;
  return <p className="text-sm text-muted-foreground">{theme.description}</p>;
}

function Header() {
  const { theme } = useThemeDetail();

  return (
    <div className="flex flex-col mt-8">
      <span className="flex gap-1 items-baseline mb-2">
        <h1 className="text-xl font-semibold text-foreground capitalize leading-none">
          {theme.name}
        </h1>
        <span className="text-xs font-semibold text-muted-foreground">
          v{theme.version}
        </span>
      </span>

      <p className="mb-3 text-sm text-muted-foreground">{theme.description}</p>

      <div className="flex flex-wrap gap-x-3 gap-y-2 items-center text-sm">
        <span className="flex gap-2 items-center text-muted-foreground">
          <RiUserLine size={16} />
          {theme.author}
        </span>
        <div className="w-px h-3.5 bg-border" />
        <span className="flex gap-2 items-center text-muted-foreground">
          <RiDownloadLine size={16} />
          {formatLoads(theme.loads)} Installs
        </span>
        <div className="w-px h-3.5 bg-border" />
        <span className="flex gap-2 items-center text-muted-foreground">
          <RiCalendarLine size={16} />
          {formatDate(theme.createdAt)}
        </span>
      </div>
    </div>
  );
}

function Install() {
  const { theme } = useThemeDetail();

  const snippet = `npx @litlab/audx add ommgh/audx --theme ${theme.name}`;

  const [copied, setCopied] = useState(false);

  const MotionCheck = motion(RiCheckLine);
  const MotionClone = motion(RiFileCopyLine);

  const props = {
    size: 14,
    initial: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
    transition: { duration: 0.18, ease: "easeInOut" },
    style: { display: "flex" },
  } as const;

  return (
    <code className="relative w-full flex items-center px-4 py-3 text-xs border border-border shadow-sm bg-muted/40">
      <span className="line">$ {snippet}</span>
      <button
        type="button"
        className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center p-1 ml-auto text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted transition-all duration-200"
        onClick={() => {
          navigator.clipboard.writeText(snippet);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <MotionCheck key="check" {...props} />
          ) : (
            <MotionClone key="clone" {...props} />
          )}
        </AnimatePresence>
      </button>
    </code>
  );
}

function Sounds() {
  const { theme: themeData, sounds } = useThemeDetail();

  const theme = usePatch(`/api/audio/theme/${themeData.name}`);

  const [playing, setPlaying] = useState<string | null>(null);

  const voiceRef = useRef<{ stop: (t?: number) => void } | null>(null);

  const playingRef = useRef<string | null>(null);

  const soundSet = useMemo(() => new Set(theme.sounds), [theme.sounds]);

  const allSounds = useMemo(
    () => sounds.flatMap((group) => group.sounds),
    [sounds],
  );

  const handlePlay = useCallback(
    (soundName: string) => {
      if (voiceRef.current) {
        voiceRef.current.stop();
        voiceRef.current = null;
      }

      if (playingRef.current === soundName) {
        playingRef.current = null;
        setPlaying(null);
        return;
      }

      if (!theme.ready) return;
      if (!soundSet.has(soundName)) return;

      const voice = theme.play(soundName);
      voiceRef.current = voice;
      playingRef.current = soundName;
      setPlaying(soundName);

      setTimeout(() => {
        if (playingRef.current === soundName) {
          playingRef.current = null;
          voiceRef.current = null;
        }
        setPlaying((current) => (current === soundName ? null : current));
      }, 3000);
    },
    [theme, soundSet],
  );

  useEffect(
    () => () => {
      if (voiceRef.current) voiceRef.current.stop();
    },
    [],
  );

  if (allSounds.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-3 bg-muted w-full">
      <h2 className="flex gap-2 items-center">
        <div className="flex items-center justify-center text-muted-foreground">
          <RiPlayListLine size={16} />
        </div>
        <span className="text-sm font-semibold text-foreground">
          Preview Sounds
        </span>
      </h2>
      <div className="flex flex-wrap gap-3">
        {allSounds.map((sound) => {
          const isAvailable = theme.ready && soundSet.has(sound.name);
          const isPlaying = playing === sound.name;
          return (
            <button
              key={sound.id}
              type="button"
              className={[
                "flex gap-3 items-center w-fit px-3 py-1 text-left text-sm capitalize cursor-pointer bg-background border border-border transition-all duration-200 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed",
                isPlaying
                  ? "text-(--color-primary) border-(--color-primary)"
                  : "text-foreground",
              ].join(" ")}
              style={generateColorFromName(sound.name)}
              data-playing={isPlaying}
              data-available={isAvailable}
              onClick={() => handlePlay(sound.name)}
              disabled={!theme.ready}
            >
              {sound.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Breadcrumb, Description, Header, Install, Layout, Main, Root, Sounds };
