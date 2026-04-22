"use client";

import { RiCheckLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import {
	DEFAULT_PM,
	getInstallPrefix,
	type PackageManager,
} from "@/lib/package-manager";
import { cn } from "@/lib/utils";

interface SaveSuccessProps {
	themeName: string;
	indexUrl: string;
}

export function SaveSuccess({ themeName, indexUrl }: SaveSuccessProps) {
	const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);

	const installCommands = useMemo(() => {
		const prefix = getInstallPrefix(pm);
		const lines = [
			"# Initialize theme config",
			`${prefix} theme init`,
			"",
			"# Set as active theme",
			`${prefix} theme set ${themeName} --registry ${indexUrl}`,
			"",
			"# Generate theme file",
			`${prefix} theme generate`,
		];
		return lines.join("\n");
	}, [pm, themeName, indexUrl]);

	return (
		<div className="flex flex-col items-center gap-8">
			{/* Success icon and message */}
			<div className="flex flex-col items-center gap-3 text-center">
				<div
					className={cn(
						"flex h-12 w-12 items-center justify-center rounded-full",
						"bg-green-500/10 text-green-500",
					)}
				>
					<RiCheckLine size={24} />
				</div>
				<h2 className="text-2xl font-bold tracking-tight">Theme Saved</h2>
				<p className="text-muted-foreground">
					Your theme{" "}
					<span className="font-medium text-foreground">{themeName}</span> has
					been saved and is ready to use.
				</p>
			</div>

			{/* CLI installation commands */}
			<div className="w-full max-w-lg space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
						Installation
					</span>
					<CopyButton value={installCommands} successText="Copied!" />
				</div>
				<div className="rounded-lg border border-border/40 bg-secondary/30">
					<div className="border-b border-border/40 px-3 py-1.5">
						<PackageManagerSwitcher value={pm} onChange={setPm} />
					</div>
					<pre className="overflow-x-auto p-3 text-[13px] leading-relaxed [scrollbar-width:none]">
						<code className="font-mono">{installCommands}</code>
					</pre>
				</div>
			</div>
		</div>
	);
}
