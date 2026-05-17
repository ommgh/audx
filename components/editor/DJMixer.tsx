import { BarVisualizer } from "@/components/editor/bar-visualizer";
import { Matrix, wave, loader, pulse, vu } from "@/components/editor/matrix";
import { cn } from "@/lib/utils";
const DECK_A_STATE = "speaking" as const;
const DECK_B_STATE = "listening" as const;

function Knob({
  label,
  value,
  color = "primary",
}: {
  label: string;
  value: number; // 0–1
  color?: "primary" | "secondary" | "accent";
}) {
  const angle = -135 + value * 270;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative h-9 w-9 rounded-full border"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, hsl(var(--muted)), hsl(var(--background)))",
          borderColor: "hsl(var(--border))",
          boxShadow:
            "inset 0 1px 3px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.05)",
        }}
      >
        {/* tick */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div
            className="h-3.5 w-0.5 origin-bottom -translate-y-1.5 rounded-full"
            style={{
              background:
                color === "primary"
                  ? "hsl(var(--primary))"
                  : color === "secondary"
                    ? "hsl(var(--secondary-foreground))"
                    : "hsl(var(--muted-foreground))",
            }}
          />
        </div>
      </div>
      <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function Fader({
  label,
  value,
  vertical = false,
}: {
  label: string;
  value: number;
  vertical?: boolean;
}) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="bg-muted relative h-28 w-4 overflow-hidden rounded-full">
          <div
            className="bg-primary/20 absolute right-0 bottom-0 left-0 rounded-full transition-all"
            style={{ height: `${value * 100}%` }}
          />
          <div
            className="bg-primary absolute right-0 left-0 h-1.5 rounded-full"
            style={{ bottom: `calc(${value * 100}% - 3px)` }}
          />
        </div>
        <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
        {label}
      </span>
      <div className="bg-muted relative h-4 w-36 overflow-hidden rounded-full">
        <div
          className="bg-primary/20 absolute top-0 bottom-0 left-0 rounded-full"
          style={{ width: `${value * 100}%` }}
        />
        <div
          className="bg-primary absolute top-0 bottom-0 w-1.5 rounded-full"
          style={{ left: `calc(${value * 100}% - 3px)` }}
        />
      </div>
    </div>
  );
}

function DeckLabel({
  letter,
  bpm,
  track,
  active,
}: {
  letter: string;
  bpm: number;
  track: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded font-mono text-sm font-bold",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {letter}
        </div>
        <div>
          <p className="text-sm leading-none font-medium">{track}</p>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs">
            {bpm} BPM
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mt-0.5 h-2 w-2 rounded-full",
          active ? "bg-primary animate-pulse" : "bg-muted",
        )}
      />
    </div>
  );
}

function Deck({
  letter,
  track,
  bpm,
  active,
  matrixFrames,
  vuLevels,
}: {
  letter: string;
  track: string;
  bpm: number;
  active?: boolean;
  matrixFrames?: typeof wave;
  vuLevels?: number[];
}) {
  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4">
      <DeckLabel letter={letter} bpm={bpm} track={track} active={active} />

      {/* Visualizer */}
      <BarVisualizer
        state={active ? DECK_A_STATE : DECK_B_STATE}
        barCount={18}
        demo
        minHeight={8}
        maxHeight={100}
        centerAlign
        className="h-24 rounded-lg"
      />

      {/* Matrix display */}
      <div className="flex items-center justify-between gap-3">
        <div className="bg-muted/60 flex flex-1 items-center justify-center rounded-lg py-3">
          {vuLevels ? (
            <Matrix
              rows={7}
              cols={vuLevels.length}
              mode="vu"
              levels={vuLevels}
              size={8}
              gap={2}
              palette={{
                on: "hsl(var(--primary))",
                off: "hsl(var(--primary))",
              }}
            />
          ) : (
            <Matrix
              rows={7}
              cols={7}
              frames={matrixFrames}
              fps={12}
              size={8}
              gap={2}
              palette={{
                on: "hsl(var(--primary))",
                off: "hsl(var(--primary))",
              }}
            />
          )}
        </div>

        {/* Channel faders */}
        <div className="flex gap-2">
          <Fader label="HI" value={0.8} vertical />
          <Fader label="MID" value={0.6} vertical />
          <Fader label="LO" value={0.75} vertical />
        </div>
      </div>

      {/* EQ knobs */}
      <div className="flex items-center justify-around">
        <Knob label="Gain" value={0.72} color="primary" />
        <Knob label="Trim" value={0.55} color="secondary" />
        <Knob label="Cue" value={0.3} color="accent" />
        <Knob label="FX" value={0.45} color="accent" />
      </div>
    </div>
  );
}

function CrossFader() {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-5 rounded-xl border p-5">
      {/* Center matrix — loader animation */}
      <div className="bg-muted/60 rounded-lg p-3">
        <Matrix
          rows={7}
          cols={7}
          frames={pulse}
          fps={16}
          size={9}
          gap={2}
          palette={{
            on: "hsl(var(--primary))",
            off: "hsl(var(--primary))",
          }}
          brightness={1.1}
        />
      </div>

      {/* Crossfader */}
      <div className="w-full">
        <Fader label="Crossfader" value={0.42} />
      </div>

      {/* Master / Headphone knobs */}
      <div className="flex w-full items-center justify-around">
        <Knob label="Master" value={0.8} color="primary" />
        <Knob label="Monitor" value={0.6} color="secondary" />
        <Knob label="Booth" value={0.5} color="accent" />
      </div>

      {/* Beat / BPM matrix counter */}
      <div className="bg-muted/60 w-full rounded-lg p-3">
        <div className="flex items-center justify-center gap-1">
          <Matrix
            rows={7}
            cols={7}
            frames={wave}
            fps={24}
            size={7}
            gap={1.5}
            palette={{
              on: "hsl(var(--primary))",
              off: "hsl(var(--primary))",
            }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-center font-mono text-[10px] uppercase tracking-widest">
          Beat sync
        </p>
      </div>
    </div>
  );
}

export function DJMixer() {
  const vuA = [0.9, 0.75, 0.85, 0.6, 0.7, 0.55, 0.8, 0.65];
  const vuB = [0.5, 0.6, 0.45, 0.7, 0.55, 0.65, 0.4, 0.5];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full" />
        <h2 className="text-lg font-semibold tracking-tight">
          Mixer [ Preview ]
        </h2>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
          coming soon
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <Deck letter="A" track="Neon Drift" bpm={128} active vuLevels={vuA} />
        <CrossFader />
        <Deck
          letter="B"
          track="Orbital Haze"
          bpm={132}
          matrixFrames={loader}
          vuLevels={vuB}
        />
      </div>
    </div>
  );
}
