"use client";

import type { SoundPatch } from "@litlab/audx";
import { RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ShowcaseCell } from "./cell";
import {
	ChatDemo,
	ChecklistDemo,
	DialogDemo,
	SettingsDemo,
	ToastDemo,
	UploadDemo,
} from "./demos-app";
import {
	AccordionDemo,
	CarouselDemo,
	FormDemo,
	InstallDemo,
	MenuDemo,
	NotificationsDemo,
	PinDemo,
	ReactionsDemo,
	ReorderDemo,
	TabsDemo,
	VolumeDemo,
} from "./demos-controls";
import { ShowcaseSoundProvider, useShowcase } from "./sound-context";

type Demo = {
	id: string;
	title: string;
	sounds: string[];
	code: string;
	className?: string;
	Component: () => React.ReactNode;
};

const DEMOS: Demo[] = [
	{
		id: "settings",
		title: "Settings",
		sounds: ["enable", "disable"],
		Component: SettingsDemo,
		code: `import { enable, disable } from "@/sounds";

<Switch
  checked={on}
  onCheckedChange={(next) => {
    next ? enable() : disable();
    setOn(next);
  }}
/>`,
	},
	{
		id: "chat",
		title: "Chat",
		sounds: ["type", "send", "receive", "deny"],
		className: "lg:row-span-2",
		Component: ChatDemo,
		code: `import { type, send, receive } from "@/sounds";

<input
  onKeyDown={() =>
    // jitter keeps fast typing from sounding robotic
    type({ jitter: { detune: 120, volume: 0.15 } })
  }
/>

function onSubmit() {
  send();
  postMessage(draft);
}

socket.on("message", () => receive());`,
	},
	{
		id: "checklist",
		title: "Tasks",
		sounds: ["select", "deselect", "complete", "pop", "delete", "undo"],
		className: "lg:row-span-2",
		Component: ChecklistDemo,
		code: `import {
  select, deselect, complete, deleteSound, undo,
} from "@/sounds";

function toggle(task, done) {
  const next = update(task, done);
  if (done && next.every((t) => t.done)) complete();
  else done ? select() : deselect();
}

function remove(task) {
  deleteSound();
  toast("Task deleted", {
    action: { label: "Undo", onClick: () => { undo(); restore(task); } },
  });
}`,
	},
	{
		id: "toasts",
		title: "Toasts",
		sounds: ["success", "warning", "error", "info", "close"],
		Component: ToastDemo,
		code: `import { success, error } from "@/sounds";

async function save() {
  try {
    await api.save(doc);
    success();
    toast.success("Changes saved");
  } catch {
    error();
    toast.error("Couldn't reach server");
  }
}`,
	},
	{
		id: "dialog",
		title: "Confirm dialog",
		sounds: ["open", "close", "deny", "delete", "undo"],
		Component: DialogDemo,
		code: `import { open, close, deny, deleteSound } from "@/sounds";

<Dialog
  onOpenChange={(isOpen) => (isOpen ? open() : close())}
>
  <Button
    onClick={() => {
      if (input !== project.name) return deny();
      deleteSound();
      destroy(project);
    }}
  >
    Delete
  </Button>
</Dialog>`,
	},
	{
		id: "upload",
		title: "Upload",
		sounds: ["loading", "complete", "clear"],
		Component: UploadDemo,
		code: `import { loading, complete } from "@/sounds";

async function upload(file: File) {
  loading();
  await storage.put(file, { onProgress });
  complete();
}`,
	},
	{
		id: "pin",
		title: "Passcode",
		sounds: ["tap", "back", "error", "unlock", "lock"],
		className: "lg:row-span-2",
		Component: PinDemo,
		code: `import { tap, error, unlock } from "@/sounds";

function onDigit(d: string) {
  const code = entry + d;
  if (code.length < 4) return tap();
  verify(code) ? unlock() : error();
}`,
	},
	{
		id: "reorder",
		title: "Reorder",
		sounds: ["drag", "drop"],
		Component: ReorderDemo,
		code: `import { drag, drop } from "@/sounds";

<Reorder.Item
  value={item}
  onDragStart={() => drag()}
  onDragEnd={() => drop()}
/>`,
	},
	{
		id: "volume",
		title: "Slider & stepper",
		sounds: ["tick", "tap", "deny"],
		Component: VolumeDemo,
		code: `import { tick, deny } from "@/sounds";

<Slider
  step={5}
  onValueChange={([v]) => tick({ volume: 0.4 + v / 160 })}
/>

<Stepper
  onChange={(n) => (n > max ? deny() : setSeats(n))}
/>`,
	},
	{
		id: "tabs",
		title: "Tabs",
		sounds: ["tab"],
		Component: TabsDemo,
		code: `import { tab } from "@/sounds";

<Tabs onValueChange={() => tab()}>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="activity">Activity</TabsTrigger>
</Tabs>`,
	},
	{
		id: "accordion",
		title: "Accordion",
		sounds: ["expand", "collapse"],
		Component: AccordionDemo,
		code: `import { expand, collapse } from "@/sounds";

<Accordion
  onValueChange={(open) => (open ? expand() : collapse())}
/>`,
	},
	{
		id: "reactions",
		title: "Reactions",
		sounds: ["pop", "select", "deselect", "copy"],
		Component: ReactionsDemo,
		code: `import { pop, deselect, copy } from "@/sounds";

<LikeButton
  onToggle={(liked) => (liked ? pop() : deselect())}
/>

<ShareButton
  onCopy={() => copy()}
/>`,
	},
	{
		id: "form",
		title: "Form",
		sounds: ["focus", "blur", "deny", "success"],
		Component: FormDemo,
		code: `import { deny, success } from "@/sounds";

function onSubmit(values) {
  const result = schema.safeParse(values);
  if (!result.success) return deny();
  success();
  join(result.data);
}`,
	},
	{
		id: "notifications",
		title: "Notifications",
		sounds: ["notify", "open", "close", "clear"],
		Component: NotificationsDemo,
		code: `import { notify, clear } from "@/sounds";

useEffect(
  () => inbox.subscribe(() => notify()),
  [],
);

<Button onClick={() => { clear(); markAllRead(); }}>
  Clear all
</Button>`,
	},
	{
		id: "menu",
		title: "Menu",
		sounds: ["hover", "click"],
		Component: MenuDemo,
		code: `import { hover, click } from "@/sounds";

<DropdownMenuItem
  onPointerEnter={() => hover()}
  onSelect={() => click()}
/>`,
	},
	{
		id: "carousel",
		title: "Carousel",
		sounds: ["back", "forward", "scroll", "deny"],
		className: "lg:col-span-2",
		Component: CarouselDemo,
		code: `import { back, forward, scroll } from "@/sounds";

<Carousel
  onPrev={() => back()}
  onNext={() => forward()}
  onSnap={() => scroll()}
/>`,
	},
	{
		id: "install",
		title: "Copy command",
		sounds: ["tab", "copy"],
		Component: InstallDemo,
		className: "md:col-span-2 lg:col-span-1",
		code: `import { copy } from "@/sounds";

async function onCopy() {
  await navigator.clipboard.writeText(command);
  copy();
}`,
	},
];

export function Showcase({ themes }: { themes: Record<string, SoundPatch> }) {
	return (
		<ShowcaseSoundProvider themes={themes}>
			<ShowcaseHeader themes={themes} />
			<div className="mx-auto w-full max-w-6xl border-x">
				<div className="grid grid-flow-dense grid-cols-1 gap-px border-y bg-border md:grid-cols-2 lg:grid-cols-3">
					{DEMOS.map(({ Component, ...demo }) => (
						<ShowcaseCell key={demo.id} {...demo}>
							<Component />
						</ShowcaseCell>
					))}
				</div>
				<footer className="flex flex-col items-start justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
					<p>
						Every sound above is a few hundred bytes of JSON, not an audio file.
					</p>
					<code className="font-mono text-xs text-foreground">
						npx @litlab/audx init
					</code>
				</footer>
			</div>
		</ShowcaseSoundProvider>
	);
}

function ShowcaseHeader({ themes }: { themes: Record<string, SoundPatch> }) {
	const {
		themes: names,
		theme,
		setTheme,
		muted,
		setMuted,
		play,
		last,
	} = useShowcase();

	return (
		<div className="mx-auto w-full max-w-6xl border-x">
			<div className="px-6 pt-12 pb-8 sm:pt-16">
				<p className="font-mono text-xs text-muted-foreground">Showcase</p>
				<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
					Hear it in context.
				</h1>
				<p className="mt-3 max-w-xl text-sm text-muted-foreground">
					Real components wired to audx. Switch themes to hear the same
					interface with a different personality, then flip any card to see the
					code.
				</p>
			</div>

			<div className="sticky top-14 z-30 flex flex-wrap items-center gap-3 border-t bg-background/95 px-6 py-3 backdrop-blur-sm">
				<div className="flex border" role="radiogroup" aria-label="Sound theme">
					{names.map((name) => (
						// biome-ignore lint/a11y/useSemanticElements: styled segmented control with full radio semantics
						<button
							key={name}
							type="button"
							role="radio"
							aria-checked={name === theme}
							title={themes[name].description}
							onClick={() => {
								if (name === theme) return;
								setTheme(name);
								// let the new theme introduce itself
								setTimeout(() => play("select"), 0);
							}}
							className={cn(
								"relative px-3 py-1.5 text-xs capitalize transition-colors",
								name === theme
									? "text-primary-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{name === theme && (
								<motion.span
									layoutId="showcase-theme"
									className="absolute inset-0 bg-primary"
									transition={{ type: "spring", stiffness: 600, damping: 40 }}
								/>
							)}
							<span className="relative">{name}</span>
						</button>
					))}
				</div>

				<button
					type="button"
					onClick={() => setMuted(!muted)}
					aria-pressed={muted}
					aria-label={muted ? "Unmute" : "Mute"}
					className="flex size-8 items-center justify-center border text-muted-foreground transition-colors hover:text-foreground"
				>
					{muted ? (
						<RiVolumeMuteLine size={15} />
					) : (
						<RiVolumeUpLine size={15} />
					)}
				</button>

				<p className="hidden truncate text-xs text-muted-foreground md:block">
					{themes[theme]?.description}
				</p>

				<div
					className="ml-auto flex h-5 items-center gap-2 font-mono text-xs"
					aria-live="polite"
				>
					<span
						className={cn(
							"size-1.5 transition-colors",
							last && !muted ? "bg-primary" : "bg-border",
						)}
					/>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={last?.id ?? "idle"}
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.15 }}
							className={last ? "text-foreground" : "text-muted-foreground"}
						>
							{last ? `${theme}/${last.sound}` : "interact with anything"}
						</motion.span>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
