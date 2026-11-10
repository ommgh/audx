"use client";

import {
	RiAddLine,
	RiArrowDownSLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiBellLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiCheckLine,
	RiDeleteBack2Line,
	RiDraggable,
	RiFileCopyLine,
	RiHeart3Fill,
	RiHeart3Line,
	RiLockLine,
	RiLockUnlockLine,
	RiShareLine,
	RiSubtractLine,
	RiVolumeUpLine,
} from "@remixicon/react";
import { AnimatePresence, motion, Reorder, useAnimate } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Frame, shake } from "./primitives";
import { useCellSound } from "./sound-context";

// ─── PIN pad: tap / back / error / unlock / lock ─────────────────────────────

const CODE = "2580";

export function PinDemo() {
	const play = useCellSound();
	const [entry, setEntry] = useState("");
	const [unlocked, setUnlocked] = useState(false);
	const [scope, animate] = useAnimate();

	function press(digit: string) {
		if (unlocked) return;
		const next = (entry + digit).slice(0, 4);
		setEntry(next);
		if (next.length < 4) {
			play("tap");
			return;
		}
		if (next === CODE) {
			play("unlock");
			setUnlocked(true);
		} else {
			play("error");
			animate(scope.current, shake.x, shake.transition);
		}
		setTimeout(() => setEntry(""), 350);
	}

	return (
		<Frame className="flex flex-col items-center gap-5 px-6 py-6">
			<div className="flex flex-col items-center gap-2">
				<motion.div
					key={String(unlocked)}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					className={cn(
						"flex size-9 items-center justify-center border",
						unlocked && "border-primary text-primary",
					)}
				>
					{unlocked ? <RiLockUnlockLine size={16} /> : <RiLockLine size={16} />}
				</motion.div>
				<p className="text-xs text-muted-foreground">
					{unlocked ? (
						"Vault unlocked"
					) : (
						<>
							Enter passcode <span className="font-mono">({CODE})</span>
						</>
					)}
				</p>
			</div>
			<div ref={scope} className="flex gap-3">
				{[0, 1, 2, 3].map((i) => (
					<motion.span
						key={i}
						animate={{ scale: i < entry.length ? 1.15 : 1 }}
						className={cn(
							"size-2.5 border",
							i < entry.length || unlocked
								? "border-primary bg-primary"
								: "border-border",
						)}
					/>
				))}
			</div>
			{unlocked ? (
				<button
					type="button"
					onClick={() => {
						play("lock");
						setUnlocked(false);
					}}
					className="flex h-[188px] items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<RiLockLine size={14} /> Lock again
				</button>
			) : (
				<div className="grid grid-cols-3 gap-1.5">
					{["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
						(key) =>
							key === "" ? (
								<span key="blank" />
							) : (
								<button
									key={key}
									type="button"
									aria-label={key === "⌫" ? "Delete digit" : key}
									onClick={() => {
										if (key === "⌫") {
											play(entry ? "back" : "deny");
											setEntry((e) => e.slice(0, -1));
										} else press(key);
									}}
									className="flex size-11 items-center justify-center bg-muted font-mono text-sm transition-colors hover:bg-accent active:scale-95"
								>
									{key === "⌫" ? <RiDeleteBack2Line size={14} /> : key}
								</button>
							),
					)}
				</div>
			)}
		</Frame>
	);
}

// ─── Reorder: drag / drop ────────────────────────────────────────────────────

export function ReorderDemo() {
	const play = useCellSound();
	const [items, setItems] = useState([
		"Design review",
		"Write changelog",
		"Record demo",
		"Publish to npm",
	]);

	return (
		<Reorder.Group
			axis="y"
			values={items}
			onReorder={setItems}
			className="flex w-full max-w-xs flex-col gap-1.5"
		>
			{items.map((item, i) => (
				<Reorder.Item
					key={item}
					value={item}
					onDragStart={() => play("drag")}
					onDragEnd={() => play("drop")}
					whileDrag={{
						scale: 1.02,
						boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.25)",
					}}
					className="flex cursor-grab items-center gap-3 border bg-card px-3 py-2.5 text-sm active:cursor-grabbing"
				>
					<span className="font-mono text-xs text-muted-foreground">
						{i + 1}
					</span>
					<span className="flex-1">{item}</span>
					<RiDraggable size={14} className="text-muted-foreground" />
				</Reorder.Item>
			))}
		</Reorder.Group>
	);
}

// ─── Volume: tick / tap / deny ───────────────────────────────────────────────

export function VolumeDemo() {
	const play = useCellSound();
	const [volume, setVolume] = useState(60);
	const [qty, setQty] = useState(2);
	const lastStep = useRef(Math.round(60 / 5));

	function step(delta: number) {
		const next = qty + delta;
		if (next < 1 || next > 9) {
			play("deny");
			return;
		}
		play("tap");
		setQty(next);
	}

	return (
		<Frame className="flex flex-col gap-5 p-4">
			<div>
				<div className="mb-2 flex items-center justify-between text-xs">
					<span className="flex items-center gap-1.5 text-muted-foreground">
						<RiVolumeUpLine size={14} /> Volume
					</span>
					<span className="font-mono">{volume}</span>
				</div>
				<input
					type="range"
					min={0}
					max={100}
					value={volume}
					aria-label="Volume"
					onChange={(e) => {
						const v = Number(e.target.value);
						const s = Math.round(v / 5);
						if (s !== lastStep.current) {
							lastStep.current = s;
							play("tick", { volume: 0.4 + (v / 100) * 0.6 });
						}
						setVolume(v);
					}}
					className="h-1 w-full cursor-pointer appearance-none bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary"
					style={{
						background: `linear-gradient(to right, var(--primary) ${volume}%, var(--muted) ${volume}%)`,
					}}
				/>
			</div>
			<div className="flex items-center justify-between">
				<span className="text-xs text-muted-foreground">Seats</span>
				<div className="flex items-center border">
					<button
						type="button"
						aria-label="Decrease"
						onClick={() => step(-1)}
						className="flex size-8 items-center justify-center hover:bg-muted"
					>
						<RiSubtractLine size={14} />
					</button>
					<motion.span
						key={qty}
						initial={{ y: -6, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						className="w-8 text-center font-mono text-sm"
					>
						{qty}
					</motion.span>
					<button
						type="button"
						aria-label="Increase"
						onClick={() => step(1)}
						className="flex size-8 items-center justify-center hover:bg-muted"
					>
						<RiAddLine size={14} />
					</button>
				</div>
			</div>
		</Frame>
	);
}

// ─── Accordion: expand / collapse ────────────────────────────────────────────

const FAQ = [
	{
		q: "Do sounds add to my bundle?",
		a: "Each sound is a few hundred bytes of JSON. No audio files are shipped.",
	},
	{
		q: "Can I change the theme later?",
		a: "Run `audx theme playful` and every installed sound is regenerated.",
	},
	{
		q: "What about reduced motion?",
		a: "useSound stays silent when the user prefers reduced motion.",
	},
];

export function AccordionDemo() {
	const play = useCellSound();
	const [open, setOpen] = useState<number | null>(0);

	return (
		<Frame className="divide-y">
			{FAQ.map((item, i) => {
				const isOpen = open === i;
				return (
					<div key={item.q}>
						<button
							type="button"
							aria-expanded={isOpen}
							onClick={() => {
								play(isOpen ? "collapse" : "expand");
								setOpen(isOpen ? null : i);
							}}
							className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted/40"
						>
							{item.q}
							<motion.span
								animate={{ rotate: isOpen ? 180 : 0 }}
								className="text-muted-foreground"
							>
								<RiArrowDownSLine size={16} />
							</motion.span>
						</button>
						<AnimatePresence initial={false}>
							{isOpen && (
								<motion.p
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
									className="overflow-hidden px-4 text-xs leading-relaxed text-muted-foreground"
								>
									<span className="block pb-3">{item.a}</span>
								</motion.p>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</Frame>
	);
}

// ─── Tabs: tab ───────────────────────────────────────────────────────────────

const TABS = ["Overview", "Activity", "Settings"];

export function TabsDemo() {
	const play = useCellSound();
	const [active, setActive] = useState(TABS[0]);
	return (
		<Frame>
			<div className="flex border-b" role="tablist">
				{TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						role="tab"
						aria-selected={tab === active}
						onClick={() => {
							if (tab === active) return;
							play("tab");
							setActive(tab);
						}}
						className={cn(
							"relative flex-1 py-2.5 text-xs transition-colors",
							tab === active
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{tab}
						{tab === active && (
							<motion.span
								layoutId="showcase-tab"
								className="absolute inset-x-0 -bottom-px h-px bg-foreground"
								transition={{ type: "spring", stiffness: 600, damping: 40 }}
							/>
						)}
					</button>
				))}
			</div>
			<AnimatePresence mode="wait">
				<motion.div
					key={active}
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -4 }}
					transition={{ duration: 0.12 }}
					className="flex flex-col gap-2 p-4"
				>
					{[0.9, 0.6, 0.75].map((w) => (
						<span
							key={w}
							className="h-2 bg-muted"
							style={{
								width: `${((w * (TABS.indexOf(active) + 2) * 37) % 60) + 40}%`,
							}}
						/>
					))}
				</motion.div>
			</AnimatePresence>
		</Frame>
	);
}

// ─── Reactions: pop / select / deselect / copy ───────────────────────────────

export function ReactionsDemo() {
	const play = useCellSound();
	const [liked, setLiked] = useState(false);
	const [saved, setSaved] = useState(false);
	const [copied, setCopied] = useState(false);
	const likes = 128 + (liked ? 1 : 0);

	return (
		<Frame className="p-4">
			<p className="text-sm">
				Sound is the most underrated part of interface design.
			</p>
			<p className="mt-1 text-xs text-muted-foreground">@designengineer · 2h</p>
			<div className="mt-4 flex items-center gap-1 border-t pt-3">
				<button
					type="button"
					aria-pressed={liked}
					onClick={() => {
						play(liked ? "deselect" : "pop");
						setLiked(!liked);
					}}
					className={cn(
						"flex items-center gap-1.5 px-2 py-1 text-xs hover:bg-muted",
						liked && "text-rose-500",
					)}
				>
					<motion.span
						key={String(liked)}
						initial={{ scale: liked ? 0.4 : 1 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 500, damping: 12 }}
					>
						{liked ? <RiHeart3Fill size={14} /> : <RiHeart3Line size={14} />}
					</motion.span>
					<span className="font-mono">{likes}</span>
				</button>
				<button
					type="button"
					aria-pressed={saved}
					aria-label="Bookmark"
					onClick={() => {
						play(saved ? "deselect" : "select");
						setSaved(!saved);
					}}
					className={cn("px-2 py-1 hover:bg-muted", saved && "text-primary")}
				>
					{saved ? <RiBookmarkFill size={14} /> : <RiBookmarkLine size={14} />}
				</button>
				<button
					type="button"
					onClick={() => {
						play("copy");
						setCopied(true);
						setTimeout(() => setCopied(false), 1400);
					}}
					className="ml-auto flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					{copied ? <RiCheckLine size={14} /> : <RiShareLine size={14} />}
					{copied ? "Link copied" : "Share"}
				</button>
			</div>
		</Frame>
	);
}

// ─── Carousel: back / forward / scroll ───────────────────────────────────────

const SLIDES = ["Minimal", "Playful", "Mechanical", "Retro", "Yours"];

export function CarouselDemo() {
	const play = useCellSound();
	const ref = useRef<HTMLDivElement>(null);
	const [index, setIndex] = useState(0);

	function go(delta: number) {
		const next = index + delta;
		if (next < 0 || next >= SLIDES.length) {
			play("deny");
			return;
		}
		play(delta > 0 ? "forward" : "back");
		const el = ref.current;
		el?.scrollTo({
			left: (el.scrollWidth / SLIDES.length) * next,
			behavior: "smooth",
		});
	}

	return (
		<div className="flex w-full max-w-md flex-col gap-3">
			<div
				ref={ref}
				onScroll={(e) => {
					const el = e.currentTarget;
					const i = Math.round(
						el.scrollLeft / (el.scrollWidth / SLIDES.length),
					);
					if (i !== index) {
						setIndex(i);
						play("scroll");
					}
				}}
				className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide"
			>
				{SLIDES.map((slide, i) => (
					<div
						key={slide}
						className={cn(
							"flex h-32 w-[70%] shrink-0 snap-start flex-col justify-between border p-4 transition-colors",
							i === index ? "bg-card" : "bg-muted/40",
						)}
					>
						<span className="font-mono text-xs text-muted-foreground">
							0{i + 1}
						</span>
						<span className="text-lg font-medium">{slide}</span>
					</div>
				))}
			</div>
			<div className="flex items-center justify-between">
				<div className="flex gap-1">
					{SLIDES.map((s, i) => (
						<span
							key={s}
							className={cn(
								"h-0.5 w-4 transition-colors",
								i === index ? "bg-foreground" : "bg-border",
							)}
						/>
					))}
				</div>
				<div className="flex border">
					<button
						type="button"
						aria-label="Previous"
						onClick={() => go(-1)}
						className="flex size-8 items-center justify-center border-r hover:bg-muted"
					>
						<RiArrowLeftSLine size={16} />
					</button>
					<button
						type="button"
						aria-label="Next"
						onClick={() => go(1)}
						className="flex size-8 items-center justify-center hover:bg-muted"
					>
						<RiArrowRightSLine size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}

// ─── Form: focus / blur / deny / success ─────────────────────────────────────

export function FormDemo() {
	const play = useCellSound();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "invalid" | "done">("idle");
	const [scope, animate] = useAnimate();

	return (
		<Frame className="p-4">
			<AnimatePresence mode="wait">
				{status === "done" ? (
					<motion.div
						key="done"
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center gap-2 py-4 text-center"
					>
						<span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
							<RiCheckLine size={16} />
						</span>
						<p className="text-sm">You're on the list</p>
						<button
							type="button"
							className="text-xs text-muted-foreground hover:text-foreground"
							onClick={() => {
								play("back");
								setStatus("idle");
								setEmail("");
							}}
						>
							Start over
						</button>
					</motion.div>
				) : (
					<motion.form
						key="form"
						ref={scope}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onSubmit={(e) => {
							e.preventDefault();
							if (!/^\S+@\S+\.\S+$/.test(email)) {
								play("deny");
								setStatus("invalid");
								animate(scope.current, shake.x, shake.transition);
								return;
							}
							play("success");
							setStatus("done");
						}}
					>
						<p className="text-sm font-medium">Join the beta</p>
						<label
							htmlFor="showcase-email"
							className="mt-3 block text-xs text-muted-foreground"
						>
							Email
						</label>
						<input
							id="showcase-email"
							value={email}
							onFocus={() => play("focus")}
							onBlur={() => play("blur")}
							onChange={(e) => {
								setEmail(e.target.value);
								if (status === "invalid") setStatus("idle");
							}}
							placeholder="you@company.com"
							aria-invalid={status === "invalid"}
							className="mt-1 h-9 w-full border bg-background px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring aria-invalid:border-destructive"
						/>
						<p
							className={cn(
								"mt-1 h-4 text-xs text-destructive transition-opacity",
								status === "invalid" ? "opacity-100" : "opacity-0",
							)}
						>
							Enter a valid email address.
						</p>
						<button
							type="submit"
							className="mt-1 h-9 w-full bg-primary text-sm text-primary-foreground hover:opacity-90"
						>
							Request access
						</button>
					</motion.form>
				)}
			</AnimatePresence>
		</Frame>
	);
}

// ─── Notifications: notify / open / close / clear ────────────────────────────

const INCOMING = [
	"Alex mentioned you in #design",
	"Your deploy finished in 42s",
	"Sam requested your review",
	"New comment on “Pricing v2”",
];

export function NotificationsDemo() {
	const play = useCellSound();
	const [items, setItems] = useState<{ id: number; text: string }[]>([]);
	const [open, setOpen] = useState(false);
	const n = useRef(0);

	return (
		<div className="relative flex h-60 w-full max-w-xs flex-col items-center">
			<div className="flex w-full items-center justify-between border bg-card px-3 py-2">
				<button
					type="button"
					onClick={() => {
						play("notify");
						setItems((it) =>
							[
								{
									id: n.current,
									text: INCOMING[n.current++ % INCOMING.length],
								},
								...it,
							].slice(0, 4),
						);
					}}
					className="text-xs text-muted-foreground hover:text-foreground"
				>
					Simulate notification
				</button>
				<button
					type="button"
					aria-label="Notifications"
					aria-expanded={open}
					onClick={() => {
						play(open ? "close" : "open");
						setOpen(!open);
					}}
					className={cn(
						"relative flex size-8 items-center justify-center hover:bg-muted",
						open && "bg-muted",
					)}
				>
					<motion.span
						key={items.length}
						animate={items.length ? { rotate: [0, -14, 12, -8, 0] } : {}}
						transition={{ duration: 0.45 }}
					>
						<RiBellLine size={16} />
					</motion.span>
					<AnimatePresence>
						{items.length > 0 && (
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0 }}
								className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center bg-primary px-0.5 font-mono text-[9px] text-primary-foreground"
							>
								{items.length}
							</motion.span>
						)}
					</AnimatePresence>
				</button>
			</div>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.14 }}
						style={{ transformOrigin: "top right" }}
						className="mt-1.5 w-full border bg-card shadow-lg"
					>
						<div className="flex items-center justify-between border-b px-3 py-2">
							<span className="text-xs font-medium">Inbox</span>
							<button
								type="button"
								disabled={!items.length}
								onClick={() => {
									play("clear");
									setItems([]);
								}}
								className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
							>
								Clear all
							</button>
						</div>
						<ul className="max-h-36 overflow-y-auto scrollbar-thin">
							{items.length === 0 ? (
								<li className="px-3 py-4 text-center text-xs text-muted-foreground">
									You're all caught up
								</li>
							) : (
								items.map((it) => (
									<li
										key={it.id}
										className="border-b px-3 py-2 text-xs last:border-b-0"
									>
										{it.text}
									</li>
								))
							)}
						</ul>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Menu: hover / click ─────────────────────────────────────────────────────

const MENU = ["Rename", "Duplicate", "Move to…", "Archive"];

export function MenuDemo() {
	const play = useCellSound();
	const [picked, setPicked] = useState<string | null>(null);
	return (
		<div className="flex w-full max-w-[220px] flex-col gap-2">
			<div className="border bg-card p-1" role="menu" aria-label="File actions">
				{MENU.map((item) => (
					<button
						key={item}
						type="button"
						role="menuitem"
						onPointerEnter={() => play("hover")}
						onClick={() => {
							play("click");
							setPicked(item);
						}}
						className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-sm hover:bg-muted"
					>
						{item}
						{picked === item && (
							<RiCheckLine size={14} className="text-primary" />
						)}
					</button>
				))}
			</div>
			<p className="text-center text-xs text-muted-foreground">
				Move the pointer over the items
			</p>
		</div>
	);
}

// ─── Install: tab / copy ─────────────────────────────────────────────────────

const PMS = {
	npm: "npx",
	pnpm: "pnpm dlx",
	yarn: "yarn dlx",
	bun: "bunx",
} as const;

export function InstallDemo() {
	const play = useCellSound();
	const [pm, setPm] = useState<keyof typeof PMS>("npm");
	const [copied, setCopied] = useState(false);
	const command = `${PMS[pm]} @litlab/audx add click success`;

	return (
		<div className="w-full max-w-md">
			<div className="flex w-fit border border-b-0">
				{(Object.keys(PMS) as (keyof typeof PMS)[]).map((key) => (
					<button
						key={key}
						type="button"
						onClick={() => {
							if (key === pm) return;
							play("tab");
							setPm(key);
						}}
						className={cn(
							"px-2.5 py-1 font-mono text-xs transition-colors",
							key === pm
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{key}
					</button>
				))}
			</div>
			<div className="flex items-center gap-2 border bg-card px-3 py-3">
				<code className="flex-1 truncate font-mono text-sm">
					<span className="text-muted-foreground">{PMS[pm]} @litlab/audx</span>{" "}
					add <span className="text-primary">click success</span>
				</code>
				<button
					type="button"
					aria-label="Copy command"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(command);
							play("copy");
							setCopied(true);
							setTimeout(() => setCopied(false), 1500);
						} catch {
							play("error");
						}
					}}
					className="p-1 text-muted-foreground hover:text-foreground"
				>
					{copied ? (
						<RiCheckLine size={15} className="text-primary" />
					) : (
						<RiFileCopyLine size={15} />
					)}
				</button>
			</div>
		</div>
	);
}
