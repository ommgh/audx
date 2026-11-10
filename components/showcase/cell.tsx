"use client";

import { RiCodeLine, RiEyeLine } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CellProvider, useActiveSounds, useShowcase } from "./sound-context";

type ShowcaseCellProps = {
	id: string;
	title: string;
	sounds: string[];
	code: string;
	className?: string;
	children: React.ReactNode;
};

export function ShowcaseCell({
	id,
	title,
	sounds,
	code,
	className,
	children,
}: ShowcaseCellProps) {
	const [showCode, setShowCode] = useState(false);
	const active = useActiveSounds(id);
	const { play } = useShowcase();

	return (
		<CellProvider value={id}>
			<section
				aria-label={title}
				className={cn(
					"group/cell relative flex min-h-72 flex-col bg-background",
					className,
				)}
			>
				<div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 sm:p-8">
					<AnimatePresence mode="wait" initial={false}>
						{showCode ? (
							<motion.pre
								key="code"
								initial={{ opacity: 0, y: 4 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.15 }}
								className="w-full overflow-x-auto font-mono text-[12px] leading-relaxed text-muted-foreground scrollbar-thin"
							>
								<code>{code}</code>
							</motion.pre>
						) : (
							<motion.div
								key="demo"
								initial={{ opacity: 0, y: 4 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.15 }}
								className="flex w-full items-center justify-center"
							>
								{children}
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<footer className="flex items-center gap-3 border-t border-dashed px-4 py-2.5">
					<h3 className="shrink-0 text-xs font-medium">{title}</h3>
					<div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-0.5">
						{sounds.map((sound) => (
							<button
								key={sound}
								type="button"
								onClick={() => play(sound, { cell: id })}
								title={`Play ${sound}`}
								className={cn(
									"px-1 py-0.5 font-mono text-[10px] leading-none transition-colors duration-200",
									active[sound]
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:text-foreground",
								)}
							>
								{sound}
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={() => setShowCode((v) => !v)}
						aria-label={showCode ? "Show demo" : "Show code"}
						aria-pressed={showCode}
						className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
					>
						{showCode ? <RiEyeLine size={14} /> : <RiCodeLine size={14} />}
					</button>
				</footer>
			</section>
		</CellProvider>
	);
}
