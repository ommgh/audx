"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import { formatDuration, formatSizeKb } from "@/lib/audio-catalog";
import {
	DEFAULT_PM,
	getInstallPrefix,
	type PackageManager,
} from "@/lib/package-manager";
import type { ThemeDetail, ThemeSound } from "@/lib/theme-data";
import { cn } from "@/lib/utils";

interface ThemeDetailClientProps {
	theme: ThemeDetail;
	allThemeNames: string[];
}

export function ThemeDetailClient({
	theme,
	allThemeNames,
}: ThemeDetailClientProps) {
	const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);
	const [compareTheme, setCompareTheme] = useState<string>("");
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		() => new Set(groupedCategories(theme.sounds).map(([cat]) => cat)),
	);
	const [playingSound, setPlayingSound] = useState<string | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);

	const installCommands = useMemo(() => {
		const prefix = getInstallPrefix(pm);
		const mappedSounds = theme.sounds.filter((s) => s.soundAssetName);
		const lines = [
			`# Initialize theme config`,
			`${prefix} audx theme init`,
			``,
			`# Create the ${theme.name} theme`,
			`${prefix} audx theme create ${theme.name}`,
			``,
			`# Set as active theme`,
			`${prefix} audx theme set ${theme.name}`,
			``,
			`# Map sounds`,
			...mappedSounds.map(
				(s) => `${prefix} audx theme map ${s.semanticName} ${s.soundAssetName}`,
			),
			``,
			`# Generate theme file`,
			`${prefix} audx theme generate`,
		];
		return lines.join("\n");
	}, [pm, theme]);

	const toggleCategory = useCallback((category: string) => {
		setExpandedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(category)) {
				next.delete(category);
			} else {
				next.add(category);
			}
			return next;
		});
	}, []);

	const playSound = useCallback(async (assetName: string) => {
		if (typeof window === "undefined") return;
		try {
			if (!audioCtxRef.current) {
				audioCtxRef.current = new AudioContext();
			}
			const ctx = audioCtxRef.current;
			const res = await fetch(`/r/${assetName}.json`);
			const data = await res.json();
			const file = data.files?.[0];
			if (!file?.content) return;

			// Extract the AudioAsset from the module content
			const match = file.content.match(/dataUri:\s*\n?\s*"([^"]+)"/);
			if (!match?.[1]) return;

			const base64 = match[1].split(",")[1];
			if (!base64) return;

			const binary = atob(base64);
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}

			const buffer = await ctx.decodeAudioData(bytes.buffer);
			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source.connect(ctx.destination);
			source.start();

			setPlayingSound(assetName);
			source.onended = () => setPlayingSound(null);
		} catch {
			setPlayingSound(null);
		}
	}, []);

	const grouped = useMemo(
		() => groupedCategories(theme.sounds),
		[theme.sounds],
	);
	const otherThemes = allThemeNames.filter((n) => n !== theme.name);

	return (
		<div className="flex flex-col gap-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					{theme.displayName}
				</h1>
				<p className="mt-2 text-muted-foreground">{theme.description}</p>
				<p className="mt-1 text-sm text-muted-foreground">
					{theme.mappedCount}/{theme.soundCount} sounds mapped
				</p>
			</div>

			{/* Compare dropdown */}
			{otherThemes.length > 0 && (
				<div className="flex items-center gap-3">
					<label
						htmlFor="compare-theme"
						className="text-sm text-muted-foreground"
					>
						Compare with:
					</label>
					<select
						id="compare-theme"
						value={compareTheme}
						onChange={(e) => setCompareTheme(e.target.value)}
						className="rounded-md border border-border/60 bg-secondary/50 px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<option value="">None</option>
						{otherThemes.map((name) => (
							<option key={name} value={name}>
								{name.charAt(0).toUpperCase() + name.slice(1)}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Sounds by category */}
			<div className="flex flex-col gap-4">
				{grouped.map(([category, sounds]) => {
					const isExpanded = expandedCategories.has(category);
					return (
						<div key={category} className="rounded-lg border border-border/50">
							<button
								type="button"
								onClick={() => toggleCategory(category)}
								className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-secondary/30 transition-colors"
								aria-expanded={isExpanded}
							>
								<span className="capitalize">{category}</span>
								<span className="text-xs text-muted-foreground">
									{sounds.length} sounds
									<span className="ml-2">{isExpanded ? "▾" : "▸"}</span>
								</span>
							</button>
							{isExpanded && (
								<div className="border-t border-border/50">
									{sounds.map((sound) => (
										<SoundRow
											key={sound.semanticName}
											sound={sound}
											isPlaying={playingSound === sound.soundAssetName}
											onPlay={playSound}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Installation instructions */}
			<div className="space-y-2">
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

function SoundRow({
	sound,
	isPlaying,
	onPlay,
}: {
	sound: ThemeSound;
	isPlaying: boolean;
	onPlay: (assetName: string) => void;
}) {
	const isMapped = sound.soundAssetName !== null;

	return (
		<button
			type="button"
			disabled={!isMapped}
			onClick={() => {
				if (sound.soundAssetName) onPlay(sound.soundAssetName);
			}}
			className={cn(
				"flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
				isMapped
					? "hover:bg-secondary/30 cursor-pointer"
					: "opacity-50 cursor-default",
				isPlaying && "bg-primary/5",
			)}
		>
			<div className="flex items-center gap-3">
				<span
					className={cn(
						"inline-block h-2 w-2 rounded-full",
						isPlaying
							? "bg-primary animate-pulse"
							: isMapped
								? "bg-primary/40"
								: "bg-muted-foreground/20",
					)}
					aria-hidden="true"
				/>
				<span className={cn(!isMapped && "text-muted-foreground")}>
					{sound.semanticName}
				</span>
				{!isMapped && (
					<span className="text-xs text-muted-foreground">(unmapped)</span>
				)}
			</div>
			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				{sound.duration !== null && (
					<span>{formatDuration(sound.duration)}</span>
				)}
				{sound.sizeKb !== null && <span>{formatSizeKb(sound.sizeKb)}</span>}
			</div>
		</button>
	);
}

function groupedCategories(sounds: ThemeSound[]): [string, ThemeSound[]][] {
	const map = new Map<string, ThemeSound[]>();
	for (const sound of sounds) {
		const list = map.get(sound.category) ?? [];
		list.push(sound);
		map.set(sound.category, list);
	}
	return Array.from(map.entries());
}
