"use client";

import {
	RiAlertLine,
	RiArrowUpLine,
	RiCheckLine,
	RiCloseLine,
	RiDeleteBinLine,
	RiErrorWarningLine,
	RiFileTextLine,
	RiInformationLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox, Frame, Switch, shake } from "./primitives";
import { useCellSound } from "./sound-context";

// ─── Settings: enable / disable ─────────────────────────────────────────────

export function SettingsDemo() {
	const play = useCellSound();
	const [values, setValues] = useState({
		notifications: true,
		sounds: true,
		digest: false,
	});
	const rows = [
		{
			key: "notifications",
			label: "Push notifications",
			hint: "Mentions and replies",
		},
		{
			key: "sounds",
			label: "Interface sounds",
			hint: "Feedback for every action",
		},
		{ key: "digest", label: "Weekly digest", hint: "Every Monday at 9am" },
	] as const;

	return (
		<Frame className="divide-y">
			{rows.map((row) => (
				<div
					key={row.key}
					className="flex items-center justify-between gap-4 px-4 py-3"
				>
					<div className="min-w-0">
						<p className="text-sm">{row.label}</p>
						<p className="text-xs text-muted-foreground">{row.hint}</p>
					</div>
					<Switch
						label={row.label}
						checked={values[row.key]}
						onChange={(on) => {
							play(on ? "enable" : "disable");
							setValues((v) => ({ ...v, [row.key]: on }));
						}}
					/>
				</div>
			))}
		</Frame>
	);
}

// ─── Checklist: select / deselect / delete / undo / complete ─────────────────

const TASKS = [
	{ id: 1, label: "Pick a theme" },
	{ id: 2, label: "Run npx @litlab/audx init" },
	{ id: 3, label: "Wire up click and success" },
	{ id: 4, label: "Add a mute setting" },
	{ id: 5, label: "Ship it" },
];

export function ChecklistDemo() {
	const play = useCellSound();
	const [tasks, setTasks] = useState(
		TASKS.map((t) => ({ ...t, done: t.id === 1 })),
	);
	const [removed, setRemoved] = useState<{
		task: (typeof tasks)[number];
		index: number;
	} | null>(null);
	const [draft, setDraft] = useState("");
	const nextId = useRef(100);
	const done = tasks.filter((t) => t.done).length;

	function addTask() {
		const label = draft.trim();
		if (!label) {
			play("deny");
			return;
		}
		play("pop");
		setTasks((t) => [...t, { id: nextId.current++, label, done: false }]);
		setDraft("");
	}

	function toggle(id: number, on: boolean) {
		const next = tasks.map((t) => (t.id === id ? { ...t, done: on } : t));
		setTasks(next);
		if (on && next.every((t) => t.done)) play("complete");
		else play(on ? "select" : "deselect");
	}

	function remove(index: number) {
		play("delete");
		setRemoved({ task: tasks[index], index });
		setTasks((t) => t.filter((_, i) => i !== index));
	}

	function undo() {
		if (!removed) return;
		play("undo");
		setTasks((t) => {
			const copy = [...t];
			copy.splice(removed.index, 0, removed.task);
			return copy;
		});
		setRemoved(null);
	}

	useEffect(() => {
		if (!removed) return;
		const id = setTimeout(() => setRemoved(null), 4000);
		return () => clearTimeout(id);
	}, [removed]);

	return (
		<Frame>
			<div className="flex items-center justify-between px-4 pt-3 pb-2">
				<p className="text-sm font-medium">Launch checklist</p>
				<p className="font-mono text-xs text-muted-foreground">
					{done}/{tasks.length}
				</p>
			</div>
			<div className="mx-4 mb-2 h-0.5 bg-muted">
				<motion.div
					className="h-full bg-primary"
					animate={{
						width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`,
					}}
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
				/>
			</div>
			<ul>
				<AnimatePresence initial={false}>
					{tasks.map((task, i) => (
						<motion.li
							key={task.id}
							layout
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.18 }}
							className="group/task flex items-center gap-3 overflow-hidden px-4 py-2"
						>
							<Checkbox
								label={task.label}
								checked={task.done}
								onChange={(on) => toggle(task.id, on)}
							/>
							<span
								className={cn(
									"flex-1 truncate text-sm transition-colors",
									task.done && "text-muted-foreground line-through",
								)}
							>
								{task.label}
							</span>
							<button
								type="button"
								onClick={() => remove(i)}
								aria-label={`Delete ${task.label}`}
								className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/task:opacity-100 focus-visible:opacity-100"
							>
								<RiDeleteBinLine size={14} />
							</button>
						</motion.li>
					))}
				</AnimatePresence>
			</ul>
			<form
				className="flex items-center gap-2 border-t px-4 py-2"
				onSubmit={(e) => {
					e.preventDefault();
					addTask();
				}}
			>
				<span className="text-muted-foreground">+</span>
				<input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key.length === 1)
							play("type", { jitter: { detune: 120, volume: 0.15 } });
					}}
					placeholder="Add a task and press Enter"
					aria-label="New task"
					className="h-7 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
				/>
			</form>
			<div className="h-10 border-t px-4">
				<AnimatePresence mode="wait">
					{removed ? (
						<motion.div
							key="undo"
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							className="flex h-full items-center justify-between text-xs"
						>
							<span className="text-muted-foreground">Task deleted</span>
							<button
								type="button"
								onClick={undo}
								className="font-medium text-primary"
							>
								Undo
							</button>
						</motion.div>
					) : (
						<motion.p
							key="hint"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex h-full items-center text-xs text-muted-foreground"
						>
							Check everything off for a little fanfare.
						</motion.p>
					)}
				</AnimatePresence>
			</div>
		</Frame>
	);
}

// ─── Chat: type / send / receive ─────────────────────────────────────────────

const REPLIES = [
	"Oh that sounds nice. Which theme?",
	"Mechanical is my favorite, very keyboard-y.",
	"Ship it 🚀",
	"Wait, I can swap all of them with one command?",
];

type Message = { id: number; from: "me" | "them"; text: string };

export function ChatDemo() {
	const play = useCellSound();
	const [messages, setMessages] = useState<Message[]>([
		{ id: 0, from: "them", text: "Did you add sounds to the app yet?" },
	]);
	const [draft, setDraft] = useState("");
	const [typing, setTyping] = useState(false);
	const replyIndex = useRef(0);
	const listRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new content
	useEffect(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, typing]);

	function send() {
		const text = draft.trim();
		if (!text) {
			play("deny");
			return;
		}
		play("send");
		setMessages((m) => [...m, { id: Date.now(), from: "me", text }]);
		setDraft("");
		setTimeout(() => setTyping(true), 400);
		setTimeout(() => {
			setTyping(false);
			play("receive");
			setMessages((m) => [
				...m,
				{
					id: Date.now() + 1,
					from: "them",
					text: REPLIES[replyIndex.current++ % REPLIES.length],
				},
			]);
		}, 1500);
	}

	return (
		<Frame className="flex h-[26rem] flex-col">
			<div className="flex items-center gap-2 border-b px-4 py-2.5">
				<span className="size-1.5 bg-emerald-500" />
				<p className="text-sm font-medium">Maya</p>
				<p className="ml-auto text-xs text-muted-foreground">online</p>
			</div>
			<div
				ref={listRef}
				className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 scrollbar-thin"
			>
				<AnimatePresence initial={false}>
					{messages.map((m) => (
						<motion.p
							key={m.id}
							initial={{ opacity: 0, y: 8, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ type: "spring", stiffness: 500, damping: 35 }}
							className={cn(
								"max-w-[80%] px-3 py-1.5 text-sm",
								m.from === "me"
									? "self-end bg-primary text-primary-foreground"
									: "self-start bg-muted",
							)}
						>
							{m.text}
						</motion.p>
					))}
					{typing && (
						<motion.div
							key="typing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex gap-1 self-start bg-muted px-3 py-2.5"
						>
							{[0, 1, 2].map((i) => (
								<motion.span
									key={i}
									className="size-1 bg-muted-foreground"
									animate={{ opacity: [0.3, 1, 0.3] }}
									transition={{
										duration: 0.9,
										repeat: Number.POSITIVE_INFINITY,
										delay: i * 0.15,
									}}
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<form
				className="flex items-center gap-2 border-t p-2"
				onSubmit={(e) => {
					e.preventDefault();
					send();
				}}
			>
				<input
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key.length === 1 || e.key === "Backspace") {
							play("type", { jitter: { detune: 120, volume: 0.15 } });
						}
					}}
					placeholder="Write a message…"
					aria-label="Message"
					className="h-8 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
				/>
				<button
					type="submit"
					aria-label="Send"
					className="flex size-8 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-90"
				>
					<RiArrowUpLine size={16} />
				</button>
			</form>
		</Frame>
	);
}

// ─── Dialog: open / close / deny / delete / undo ─────────────────────────────

export function DialogDemo() {
	const play = useCellSound();
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [deleted, setDeleted] = useState(false);
	const [scope, animate] = useAnimate();

	function close() {
		play("close");
		setOpen(false);
		setValue("");
	}

	function confirm() {
		if (value !== "acme") {
			play("deny");
			animate(scope.current, shake.x, shake.transition);
			return;
		}
		play("delete");
		setOpen(false);
		setValue("");
		setDeleted(true);
	}

	return (
		<div className="relative flex h-56 w-full max-w-xs items-center justify-center">
			<AnimatePresence mode="wait">
				{deleted ? (
					<motion.div
						key="deleted"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						className="flex items-center gap-3 border bg-card px-3 py-2 text-sm"
					>
						<span className="text-muted-foreground">Project deleted</span>
						<button
							type="button"
							className="font-medium text-primary"
							onClick={() => {
								play("undo");
								setDeleted(false);
							}}
						>
							Undo
						</button>
					</motion.div>
				) : (
					<motion.button
						key="trigger"
						type="button"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => {
							play("open");
							setOpen(true);
						}}
						className="flex items-center gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/20"
					>
						<RiDeleteBinLine size={14} /> Delete project
					</motion.button>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{open && (
					<motion.div
						className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={close}
					>
						<motion.div
							ref={scope}
							role="dialog"
							aria-label="Delete project"
							initial={{ opacity: 0, scale: 0.96, y: 6 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97 }}
							transition={{ type: "spring", stiffness: 500, damping: 35 }}
							onClick={(e) => e.stopPropagation()}
							className="w-full border bg-card p-4 shadow-xl"
						>
							<p className="text-sm font-medium">Delete “acme”?</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Type <span className="font-mono text-foreground">acme</span> to
								confirm.
							</p>
							<input
								// biome-ignore lint/a11y/noAutofocus: focus moves into the dialog on open, as a modal should
								autoFocus
								value={value}
								onChange={(e) => setValue(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && confirm()}
								aria-label="Project name"
								className="mt-3 h-8 w-full border bg-background px-2 font-mono text-sm outline-none focus:border-ring"
							/>
							<div className="mt-3 flex justify-end gap-2">
								<button
									type="button"
									onClick={close}
									className="px-3 py-1.5 text-xs hover:bg-muted"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={confirm}
									className="bg-destructive px-3 py-1.5 text-xs text-white"
								>
									Delete
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Toasts: success / warning / error / info ────────────────────────────────

const TOAST_KINDS = {
	success: {
		icon: RiCheckLine,
		text: "Changes saved",
		tone: "text-emerald-500",
	},
	warning: {
		icon: RiAlertLine,
		text: "Storage almost full",
		tone: "text-amber-500",
	},
	error: {
		icon: RiErrorWarningLine,
		text: "Couldn't reach server",
		tone: "text-destructive",
	},
	info: {
		icon: RiInformationLine,
		text: "v2.0 is available",
		tone: "text-primary",
	},
} as const;

type ToastKind = keyof typeof TOAST_KINDS;

export function ToastDemo() {
	const play = useCellSound();
	const [toasts, setToasts] = useState<{ id: number; kind: ToastKind }[]>([]);

	function push(kind: ToastKind) {
		play(kind);
		const id = Date.now();
		setToasts((t) => [{ id, kind }, ...t].slice(0, 3));
		setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
	}

	return (
		<div className="flex w-full max-w-xs flex-col gap-4">
			<div className="grid grid-cols-4 border">
				{(Object.keys(TOAST_KINDS) as ToastKind[]).map((kind) => (
					<button
						key={kind}
						type="button"
						onClick={() => push(kind)}
						className="border-r py-2 text-xs capitalize transition-colors last:border-r-0 hover:bg-muted"
					>
						{kind}
					</button>
				))}
			</div>
			<ul className="relative flex h-36 flex-col gap-1.5">
				<AnimatePresence initial={false}>
					{toasts.map((toast) => {
						const { icon: Icon, text, tone } = TOAST_KINDS[toast.kind];
						return (
							<motion.li
								key={toast.id}
								layout
								initial={{ opacity: 0, y: -10, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
								transition={{ type: "spring", stiffness: 500, damping: 35 }}
								className="flex items-center gap-2.5 border bg-card px-3 py-2 shadow-sm"
							>
								<Icon size={14} className={tone} />
								<span className="flex-1 text-sm">{text}</span>
								<button
									type="button"
									aria-label="Dismiss"
									onClick={() => {
										play("close");
										setToasts((t) => t.filter((x) => x.id !== toast.id));
									}}
									className="text-muted-foreground hover:text-foreground"
								>
									<RiCloseLine size={14} />
								</button>
							</motion.li>
						);
					})}
				</AnimatePresence>
				{toasts.length === 0 && (
					<p className="absolute inset-0 flex items-center justify-center border border-dashed text-xs text-muted-foreground">
						Fire a toast
					</p>
				)}
			</ul>
		</div>
	);
}

// ─── Upload: loading / complete / clear ──────────────────────────────────────

export function UploadDemo() {
	const play = useCellSound();
	const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (state !== "uploading") return;
		const started = performance.now();
		let raf = 0;
		const step = (now: number) => {
			const p = Math.min(1, (now - started) / 1800);
			setProgress(1 - (1 - p) ** 2);
			if (p < 1) raf = requestAnimationFrame(step);
			else {
				setState("done");
				play("complete");
			}
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [state, play]);

	return (
		<Frame className="p-4">
			<button
				type="button"
				disabled={state === "uploading"}
				onClick={() => {
					if (state === "done") {
						play("clear");
						setState("idle");
						setProgress(0);
						return;
					}
					play("loading");
					setState("uploading");
				}}
				className="flex w-full flex-col items-center gap-2 border border-dashed py-6 text-center transition-colors hover:bg-muted/50 disabled:cursor-progress"
			>
				<RiUploadCloud2Line size={20} className="text-muted-foreground" />
				<span className="text-sm">
					{state === "idle"
						? "Upload a file"
						: state === "uploading"
							? "Uploading…"
							: "Upload another"}
				</span>
				<span className="text-xs text-muted-foreground">PDF up to 10 MB</span>
			</button>
			<AnimatePresence>
				{state !== "idle" && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="mt-3 flex items-center gap-3">
							<RiFileTextLine size={16} className="text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<div className="flex justify-between text-xs">
									<span className="truncate">brand-guidelines.pdf</span>
									<span className="font-mono text-muted-foreground">
										{state === "done" ? (
											<RiCheckLine size={12} className="text-emerald-500" />
										) : (
											`${Math.round(progress * 100)}%`
										)}
									</span>
								</div>
								<div className="mt-1.5 h-0.5 bg-muted">
									<div
										className="h-full bg-primary"
										style={{ width: `${progress * 100}%` }}
									/>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Frame>
	);
}
