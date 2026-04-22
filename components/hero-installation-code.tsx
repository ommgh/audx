"use client";

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTypewriter } from "@/hooks/use-typewriter";
import type { AudioCatalogItem } from "@/lib/audio-catalog";
import {
	DEFAULT_PM,
	getInstallPrefix,
	PACKAGE_MANAGERS,
	type PackageManager,
} from "@/lib/package-manager";
import { cn } from "@/lib/utils";

function pickHeroWords(items: AudioCatalogItem[], count: number): string[] {
	if (items.length === 0) return ["click-001"];
	const step = Math.max(1, Math.floor(items.length / count));
	const picked: string[] = [];
	for (let i = 0; i < items.length && picked.length < count; i += step) {
		picked.push(items[i].name);
	}
	return picked;
}

export function HeroInstallationCode({ items }: { items: AudioCatalogItem[] }) {
	const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);
	const [copyState, setCopyState] = useState<"idle" | "done">("idle");
	const heroWords = useMemo(() => pickHeroWords(items, 6), [items]);
	const currentNameRef = useRef("");

	const { text: typedName, isTyping: cursorActive } = useTypewriter({
		words: heroWords,
	});

	useEffect(() => {
		currentNameRef.current = typedName;
	}, [typedName]);

	const prefix = getInstallPrefix(pm);
	const fullCommand = `${prefix} add ${typedName}`;

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(
				`${getInstallPrefix(pm)} add ${currentNameRef.current}`,
			);
			setCopyState("done");
			setTimeout(() => setCopyState("idle"), 2000);
		} catch {
			/* noop */
		}
	}, [pm]);

	/* ── Tab indicator measurement ── */
	const tabsRef = useRef<HTMLDivElement>(null);
	const [indicator, setIndicator] = useState({ x: 0, width: 0 });
	const measured = useRef(false);

	const measure = useCallback(() => {
		const container = tabsRef.current;
		if (!container) return;
		const active = container.querySelector<HTMLButtonElement>(
			"[aria-checked='true']",
		);
		if (!active) return;
		const padding = 3;
		setIndicator({
			x: active.offsetLeft - padding,
			width: active.offsetWidth,
		});
		measured.current = true;
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when pm changes
	useEffect(() => {
		measure();
	}, [pm, measure]);

	useEffect(() => {
		const ro = new ResizeObserver(measure);
		if (tabsRef.current) ro.observe(tabsRef.current);
		return () => ro.disconnect();
	}, [measure]);

	return (
		<div className="w-full max-w-[620px] min-w-0">
			{/* ── Package manager tabs ── */}
			<div
				ref={tabsRef}
				className="relative inline-flex items-center border border-b-0 border-border/60 bg-secondary/50 p-[3px] backdrop-blur-sm"
				role="radiogroup"
				aria-label="Package manager"
			>
				{indicator.width > 0 && (
					<span
						className={cn(
							"absolute left-[3px] top-[3px] bottom-[3px] bg-background shadow-sm shadow-primary/10 dark:shadow-primary/5",
							measured.current && "transition-all duration-200 ease-out",
						)}
						style={{
							width: indicator.width,
							transform: `translateX(${indicator.x}px)`,
						}}
						aria-hidden="true"
					/>
				)}
				{PACKAGE_MANAGERS.map((p) => (
					// biome-ignore lint/a11y/useSemanticElements: <explanation>
					<button
						type="button"
						key={p}
						role="radio"
						aria-checked={p === pm}
						onClick={() => setPm(p)}
						className={cn(
							"relative z-10 px-2.5 py-1 font-mono text-xs font-medium transition-colors duration-150",
							"focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
							p === pm
								? "text-foreground"
								: "text-muted-foreground/70 hover:text-muted-foreground",
						)}
					>
						{p}
					</button>
				))}
			</div>

			<div className="relative w-full overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm">
				<div
					className={cn(
						"overflow-x-auto whitespace-nowrap px-4 py-3.5 pr-14 font-mono text-sm",
						"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					)}
				>
					<span className="sr-only">{fullCommand}</span>
					<span aria-hidden="true" className="text-muted-foreground">
						{prefix}
					</span>{" "}
					<span aria-hidden="true" className="text-foreground">
						add{" "}
					</span>
					<span className="text-primary">{typedName}</span>
					<span
						className="ml-px inline-block w-[7px] h-[15px] translate-y-[2px] bg-primary/60"
						style={{
							animation: cursorActive
								? "none"
								: "blink-caret 1.1s step-end infinite",
						}}
						aria-hidden="true"
					/>
				</div>

				<button
					type="button"
					aria-label="Copy to clipboard"
					onClick={handleCopy}
					disabled={copyState !== "idle"}
					className={cn(
						"absolute top-1/2 right-2 z-20 -translate-y-1/2 p-2 transition-colors duration-150",
						"focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
						copyState === "done"
							? "text-primary"
							: "text-muted-foreground hover:text-foreground hover:bg-accent",
					)}
				>
					{copyState === "done" ? (
						<RiCheckLine size={16} />
					) : (
						<RiFileCopyLine size={16} />
					)}
				</button>
			</div>
		</div>
	);
}
