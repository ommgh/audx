"use client";

import { usePatch } from "@litlab/audx/react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import {
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiBellLine,
  RiAlarmWarningLine,
  RiClipboardLine,
  RiFileCopyLine,
  RiScissorsCutLine,
  RiArrowLeftSLine,
  RiAddBoxLine,
  RiSubtractLine,
  RiLoader4Line,
  RiUploadCloud2Line,
  RiDownloadCloud2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckboxBlankCircleLine,
  RiDeleteBin6Line,
  RiDeleteBinLine,
  RiDeleteBin5Line,
  RiLockLine,
  RiLockUnlockLine,
  RiCheckDoubleLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiMicLine,
  RiMicOffLine,
  RiCameraLine,
} from "@remixicon/react";

interface AudioBentoProps {
  items: AudioCatalogItem[];
}

export function AudioBento({ items }: AudioBentoProps) {
  const patch = usePatch(`/api/audio/theme/minimal`);

  const playSound = useCallback(
    (soundName: string) => {
      patch.play(soundName);
    },
    [patch],
  );

  return (
    <main className="mx-auto w-full max-w-6xl border-x">
      <div className="px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Sound Showcase</h1>
          <p className="mt-2 text-muted-foreground">
            Experience our curated collection of semantic sounds
          </p>
        </div>

        {/* Bento Grid - Organized Layout */}
        <div
          className="grid gap-0 md:grid-cols-6"
          style={{ gridAutoRows: "minmax(180px, auto)" }}
        >
          {/* Row 1: Feedback (tall, left) + Notifications (wide, middle-right) */}
          <BentoFeedback playSound={playSound} />
          <BentoNotification playSound={playSound} />

          {/* Row 2: Interactions (wide) spanning from left */}
          <BentoInteraction playSound={playSound} />

          {/* Row 3: Small cards (Clipboard, Progress, Media) */}
          <BentoClipboard playSound={playSound} />
          <BentoProgress playSound={playSound} />
          <BentoMedia playSound={playSound} />

          {/* Row 4: Destructive (wide) */}
          <BentoDestructive playSound={playSound} />

          {/* Row 5: Navigation (wide) */}
          <BentoNavigation playSound={playSound} />

          {/* Row 6: Transitions (wide) */}
          <BentoTransition playSound={playSound} />

          {/* Row 7: State (wide) */}
          <BentoState playSound={playSound} />
        </div>
      </div>
    </main>
  );
}

// ─── Feedback (tall, 1 col x 2 row) ───
function BentoFeedback({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-1 row-span-2 border border-border/50">
      <BentoCard className="h-full">
        <div className="flex h-full flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Feedback</h3>
            <p className="text-xs text-muted-foreground">System responses</p>
          </div>
          <div className="space-y-2">
            <FeedbackButton
              label="Success"
              icon={RiCheckLine}
              onClick={() => playSound("success")}
              variant="success"
            />
            <FeedbackButton
              label="Error"
              icon={RiCloseLine}
              onClick={() => playSound("error")}
              variant="error"
            />
            <FeedbackButton
              label="Warning"
              icon={RiAlertLine}
              onClick={() => playSound("warning")}
              variant="warning"
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Notification (wide, 1 col x 1 row spanning 2 cols) ───
function BentoNotification({
  playSound,
}: {
  playSound: (name: string) => void;
}) {
  return (
    <div className="col-span-2 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">Alerts</p>
          </div>
          <div className="flex gap-2">
            <NotificationButton
              tooltip="Info"
              icon={RiInformationLine}
              onClick={() => playSound("info")}
            />
            <NotificationButton
              tooltip="Notify"
              icon={RiBellLine}
              onClick={() => playSound("notify")}
            />
            <NotificationButton
              tooltip="Alert"
              icon={RiAlarmWarningLine}
              onClick={() => playSound("alert")}
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Interaction (wide, spanning 3 cols) ───
function BentoInteraction({
  playSound,
}: {
  playSound: (name: string) => void;
}) {
  return (
    <div className="col-span-3 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Interactions</h3>
            <p className="text-xs text-muted-foreground">Actions</p>
          </div>
          <div className="flex gap-2">
            <InteractiveButton
              label="Click"
              onClick={() => playSound("click")}
            />
            <InteractiveButton
              label="Enter"
              onClick={() => playSound("enter")}
            />
            <InteractiveButton
              label="Hover"
              onClick={() => playSound("hover")}
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Clipboard (small, 1 col) ───
function BentoClipboard({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-1 border border-border/50">
      <BentoCard>
        <div className="flex h-full flex-col items-center justify-between">
          <div className="text-center">
            <h3 className="text-sm font-semibold">Clipboard</h3>
          </div>
          <div className="flex w-full gap-1">
            <ClipboardButton
              icon={RiFileCopyLine}
              onClick={() => playSound("copy")}
              action="copy"
            />
            <ClipboardButton
              icon={RiClipboardLine}
              onClick={() => playSound("paste")}
              action="paste"
            />
            <ClipboardButton
              icon={RiScissorsCutLine}
              onClick={() => playSound("cut")}
              action="cut"
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Progress (small, 1 col) ───
function BentoProgress({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-1 border border-border/50">
      <BentoCard>
        <div className="flex h-full flex-col items-center justify-between">
          <div className="text-center">
            <h3 className="text-sm font-semibold">Progress</h3>
          </div>
          <div className="flex w-full gap-1">
            <ProgressButton
              icon={RiLoader4Line}
              onClick={() => playSound("loading")}
              action="loading"
            />
            <ProgressButton
              icon={RiUploadCloud2Line}
              onClick={() => playSound("upload")}
              action="upload"
            />
            <ProgressButton
              icon={RiDownloadCloud2Line}
              onClick={() => playSound("download")}
              action="download"
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Media (small, 1 col) ───
function BentoMedia({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-1 border border-border/50">
      <BentoCard>
        <div className="flex h-full flex-col items-center justify-between">
          <div className="text-center">
            <h3 className="text-sm font-semibold">Media</h3>
          </div>
          <div className="flex w-full gap-1">
            <MediaButton
              icon={RiVolumeMuteLine}
              activeIcon={RiVolumeUpLine}
              onClick={() => playSound("mute")}
              action="mute"
            />
            <MediaButton
              icon={RiMicOffLine}
              activeIcon={RiMicLine}
              onClick={() => playSound("record")}
              action="record"
            />
            <MediaButton
              icon={RiCameraLine}
              activeIcon={RiCameraLine}
              onClick={() => playSound("capture")}
              action="capture"
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Destructive (wide, spanning 3 cols) ───
function BentoDestructive({
  playSound,
}: {
  playSound: (name: string) => void;
}) {
  return (
    <div className="col-span-3 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-destructive">
              Destructive
            </h3>
            <p className="text-xs text-destructive/70">Delete</p>
          </div>
          <div className="flex gap-2">
            <DestructiveButton
              tooltip="Delete"
              icon={RiDeleteBin6Line}
              onClick={() => playSound("delete")}
              action="delete"
            />
            <DestructiveButton
              tooltip="Clear"
              icon={RiDeleteBinLine}
              onClick={() => playSound("clear")}
              action="clear"
            />
            <DestructiveButton
              tooltip="Trash"
              icon={RiDeleteBin5Line}
              onClick={() => playSound("trash")}
              action="trash"
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Navigation (wide, spanning 3 cols) ───
function BentoNavigation({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-3 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Navigation</h3>
            <p className="text-xs text-muted-foreground">Movement</p>
          </div>
          <div className="flex gap-2">
            <NavButton
              icon={RiArrowLeftSLine}
              onClick={() => playSound("back")}
            />
            <NavButton icon={RiAddBoxLine} onClick={() => playSound("open")} />
            <NavButton
              icon={RiSubtractLine}
              onClick={() => playSound("close")}
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Transition (wide, spanning 3 cols) ───
function BentoTransition({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-3 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Transitions</h3>
            <p className="text-xs text-muted-foreground">Animations</p>
          </div>
          <div className="flex gap-2">
            <TransitionButton
              icon={RiEyeLine}
              onClick={() => playSound("show")}
            />
            <TransitionButton
              icon={RiEyeOffLine}
              onClick={() => playSound("hide")}
            />
            <TransitionButton
              icon={RiCheckboxBlankCircleLine}
              onClick={() => playSound("pop")}
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── State (wide, spanning 3 cols) ───
function BentoState({ playSound }: { playSound: (name: string) => void }) {
  return (
    <div className="col-span-3 border border-border/50">
      <BentoCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">State</h3>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
          <div className="flex gap-2">
            <StateToggle
              icons={[RiLockLine, RiLockUnlockLine]}
              onClick={() => playSound("lock")}
            />
            <StateToggle
              icons={[RiLockUnlockLine, RiLockLine]}
              onClick={() => playSound("unlock")}
            />
            <StateToggle
              icons={[RiCheckDoubleLine, RiCheckLine]}
              onClick={() => playSound("enable")}
            />
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

// ─── Shared Components ───

function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded border border-border/50 bg-card p-3",
        "hover:shadow-md hover:shadow-primary/8",
        "transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Feedback Button - Shows feedback with color
function FeedbackButton({
  label,
  icon: Icon,
  onClick,
  variant,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant: "success" | "error" | "warning";
}) {
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    setPlaying(true);
    onClick();
    setTimeout(() => setPlaying(false), 500);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-chart-1 text-primary-foreground hover:bg-chart-1/90";
      case "error":
        return "bg-destructive text-primary-foreground hover:bg-destructive/90";
      case "warning":
        return "bg-chart-2 text-primary-foreground hover:bg-chart-2/90";
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded px-3 py-2 text-sm font-medium",
        "transition-all duration-200",
        "flex items-center justify-center gap-2",
        getVariantClasses(),
        playing ? "scale-95 opacity-75" : "",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

// Notification Button - Animated on click
function NotificationButton({
  tooltip,
  icon: Icon,
  onClick,
}: {
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded",
        "transition-all duration-200",
        "border border-border/50",
        active
          ? "bg-primary text-primary-foreground scale-110"
          : "hover:bg-muted",
      )}
      title={tooltip}
    >
      <Icon className="size-4" />
    </button>
  );
}

// Interactive Button - Changes on interaction
function InteractiveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded border border-border/50 px-2 py-1 text-xs font-medium",
        "transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground scale-105"
          : "bg-muted hover:bg-accent",
      )}
    >
      {label}
    </button>
  );
}

// Clipboard Button - Toggles state on action
function ClipboardButton({
  icon: Icon,
  onClick,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  action: "copy" | "paste" | "cut";
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    onClick();
    setTimeout(() => setActive(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex-1 rounded border border-border/30 px-2 py-1 text-xs",
        "hover:bg-accent transition-all duration-200",
        "flex items-center justify-center",
        active && "scale-95 bg-primary text-primary-foreground",
      )}
      title={action}
    >
      <Icon className="size-4" />
    </button>
  );
}

// Progress Button - Shows spinning animation
function ProgressButton({
  icon: Icon,
  onClick,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  action: "loading" | "upload" | "download";
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    onClick();
    setTimeout(() => setActive(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex-1 rounded border border-border/30 px-2 py-1 text-xs",
        "hover:bg-accent transition-all duration-200",
        "flex items-center justify-center",
        active && "bg-primary text-primary-foreground",
      )}
      title={action}
    >
      <Icon className={cn("size-4", active && "animate-spin")} />
    </button>
  );
}

// Media Button - Toggles between two states (mute/unmute, etc)
function MediaButton({
  icon: Icon,
  activeIcon: ActiveIcon,
  onClick,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  action: "mute" | "record" | "capture";
}) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onClick();
  };

  const CurrentIcon = isActive ? ActiveIcon : Icon;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex-1 rounded border border-border/30 px-2 py-1 text-xs",
        "transition-all duration-200",
        "flex items-center justify-center",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-accent",
      )}
      title={action}
    >
      <CurrentIcon className="size-4" />
    </button>
  );
}

// Destructive Button - Shows warning state
function DestructiveButton({
  tooltip,
  icon: Icon,
  onClick,
  action,
}: {
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  action: "delete" | "clear" | "trash";
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    onClick();
    setTimeout(() => setActive(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded",
        "transition-all duration-200",
        "border border-border/50",
        active
          ? "bg-destructive text-primary-foreground scale-90"
          : "hover:bg-muted",
      )}
      title={tooltip}
    >
      <Icon className="size-4" />
    </button>
  );
}

// Nav Button - Interactive navigation
function NavButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(true);
    onClick();
    setTimeout(() => setActive(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded",
        "border border-border/50 bg-muted hover:bg-accent",
        "transition-all duration-200",
        active && "scale-90 bg-primary text-primary-foreground",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// Transition Button - Smooth transitions
function TransitionButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded border border-border/50 bg-accent hover:bg-accent/80",
        "transition-all duration-200",
        "flex items-center justify-center h-8 w-8",
        active && "scale-95 opacity-60",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// State Toggle - Toggles between locked/unlocked, etc
function StateToggle({
  icons: [Icon1, Icon2],
  onClick,
}: {
  icons: [
    React.ComponentType<{ className?: string }>,
    React.ComponentType<{ className?: string }>,
  ];
  onClick: () => void;
}) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onClick();
  };

  const CurrentIcon = isActive ? Icon2 : Icon1;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded border border-border/50 bg-accent hover:bg-accent/80",
        "transition-all duration-200 h-8 w-8",
        isActive && "scale-95",
      )}
    >
      <CurrentIcon className="size-4" />
    </button>
  );
}
