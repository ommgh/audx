"use client";

import { RiCheckLine } from "@remixicon/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Switch({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			onClick={() => onChange(!checked)}
			className={cn(
				"relative inline-flex h-5 w-9 shrink-0 items-center border p-0.5 transition-colors duration-200",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
				checked ? "border-primary bg-primary" : "border-border bg-muted",
			)}
		>
			<motion.span
				layout
				transition={{ type: "spring", stiffness: 700, damping: 35 }}
				className={cn(
					"block size-3.5 bg-background shadow-sm",
					checked ? "ml-auto" : "ml-0",
				)}
			/>
		</button>
	);
}

export function Checkbox({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
}) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: custom-styled checkbox with full checkbox semantics
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			aria-label={label}
			onClick={() => onChange(!checked)}
			className={cn(
				"flex size-4 shrink-0 items-center justify-center border transition-colors duration-150",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
				checked
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-background",
			)}
		>
			<motion.span
				initial={false}
				animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
				transition={{ type: "spring", stiffness: 600, damping: 30 }}
			>
				<RiCheckLine size={12} />
			</motion.span>
		</button>
	);
}

/** Plain frame for a demo, sized to read like a real piece of UI. */
export function Frame({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"w-full max-w-xs border bg-card text-card-foreground",
				className,
			)}
		>
			{children}
		</div>
	);
}

export const shake = {
	x: [0, -6, 6, -4, 4, -2, 0],
	transition: { duration: 0.35 },
};
