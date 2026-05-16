"use client";

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { useCallback, useState } from "react";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import {
	DEFAULT_PM,
	getInstallPrefix,
	type PackageManager,
} from "@/lib/package-manager";
import { cn } from "@/lib/utils";

interface SoundInstallInstructionsProps {
	soundName: string;
}

export function SoundInstallInstructions({
	soundName,
}: SoundInstallInstructionsProps) {
	const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);
	const [copyState, setCopyState] = useState<"idle" | "done">("idle");

	const prefix = getInstallPrefix(pm);
	const fullCommand = `${prefix} add ${soundName}`;

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(fullCommand);
			setCopyState("done");
			setTimeout(() => setCopyState("idle"), 2000);
		} catch {
			/* noop */
		}
	}, [fullCommand]);

	return (
		<div className="flex flex-col gap-2">
			{/* Package manager tabs */}
			<PackageManagerSwitcher value={pm} onChange={setPm} />

			{/* Command block */}
			<div className="relative w-full overflow-hidden rounded-lg border border-border/50 bg-secondary/30">
				<div
					className={cn(
						"overflow-x-auto whitespace-nowrap px-4 py-3 pr-12 font-mono text-sm",
						"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					)}
				>
					<span className="sr-only">{fullCommand}</span>
					<span aria-hidden="true" className="text-muted-foreground">
						{prefix}
					</span>{" "}
					<span aria-hidden="true" className="text-foreground font-medium">
						add{" "}
					</span>
					<span aria-hidden="true" className="text-primary">
						{soundName}
					</span>
				</div>

				<button
					type="button"
					aria-label="Copy install command"
					onClick={handleCopy}
					className={cn(
						"absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-md transition-colors duration-150",
						"focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
						copyState === "done"
							? "text-primary"
							: "text-muted-foreground hover:text-foreground hover:bg-accent",
					)}
				>
					{copyState === "done" ? (
						<RiCheckLine size={15} />
					) : (
						<RiFileCopyLine size={15} />
					)}
				</button>
			</div>
		</div>
	);
}
