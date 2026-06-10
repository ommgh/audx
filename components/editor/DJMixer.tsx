"use client";

import { defineSound, type SoundDefinition } from "@litlab/audx";
import {
	RiCheckLine,
	RiFileCopyLine,
	RiPlayFill,
	RiResetLeftLine,
	RiStopFill,
} from "@remixicon/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PackageManagerSwitcher } from "@/components/package-manager-switcher";
import { Button } from "@/components/ui/button";
import {
	DEFAULT_PM,
	getInstallPrefix,
	type PackageManager,
} from "@/lib/package-manager";
import {
	customizeSound,
	DEFAULT_CUSTOMIZATION,
	encodeSoundCustomization,
	type SoundCustomization,
	type Waveform,
} from "@/lib/sound-customization";

type DJMixerProps = {
	definition: SoundDefinition;
	soundName: string;
	theme: string;
};

type SliderProps = {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	display: string;
	onChange: (value: number) => void;
};

function Slider({
	label,
	value,
	min,
	max,
	step,
	display,
	onChange,
}: SliderProps) {
	return (
		<label className="grid gap-2">
			<span className="flex items-center justify-between gap-4 text-xs">
				<span className="font-medium">{label}</span>
				<span className="font-mono text-muted-foreground">{display}</span>
			</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="h-1.5 w-full cursor-pointer accent-primary"
			/>
		</label>
	);
}

export function DJMixer({ definition, soundName, theme }: DJMixerProps) {
	const [settings, setSettings] = useState<SoundCustomization>(
		DEFAULT_CUSTOMIZATION,
	);
	const [pm, setPm] = useState<PackageManager>(DEFAULT_PM);
	const [isPlaying, setIsPlaying] = useState(false);
	const [copied, setCopied] = useState(false);
	const voiceRef = useRef<ReturnType<ReturnType<typeof defineSound>> | null>(
		null,
	);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const customizedDefinition = useMemo(
		() => customizeSound(definition, settings),
		[definition, settings],
	);
	const tuning = useMemo(() => encodeSoundCustomization(settings), [settings]);
	const command = `${getInstallPrefix(pm)} add ${soundName} --theme ${theme} --tune ${tuning} -y`;

	const stopPreview = useCallback(() => {
		voiceRef.current?.stop();
		voiceRef.current = null;
		if (timerRef.current) clearTimeout(timerRef.current);
		setIsPlaying(false);
	}, []);

	useEffect(() => stopPreview, [stopPreview]);

	const update = <K extends keyof SoundCustomization>(
		key: K,
		value: SoundCustomization[K],
	) => {
		stopPreview();
		setSettings((current) => ({ ...current, [key]: value }));
	};

	const playPreview = useCallback(() => {
		if (isPlaying) {
			stopPreview();
			return;
		}

		const play = defineSound(customizedDefinition);
		voiceRef.current = play();
		setIsPlaying(true);
		timerRef.current = setTimeout(
			() => setIsPlaying(false),
			Math.max(250, 2500 * settings.duration),
		);
	}, [customizedDefinition, isPlaying, settings.duration, stopPreview]);

	const copyCommand = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			/* Clipboard access can be unavailable outside a secure context. */
		}
	}, [command]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Sound editor</h2>
					<p className="text-xs text-muted-foreground">
						Preview changes, then install this exact definition.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							stopPreview();
							setSettings(DEFAULT_CUSTOMIZATION);
						}}
					>
						<RiResetLeftLine />
						Reset
					</Button>
					<Button type="button" onClick={playPreview}>
						{isPlaying ? <RiStopFill /> : <RiPlayFill />}
						{isPlaying ? "Stop" : "Preview"}
					</Button>
				</div>
			</div>

			<div className="grid gap-5 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
				<Slider
					label="Pitch"
					value={settings.pitch}
					min={-12}
					max={12}
					step={1}
					display={`${settings.pitch > 0 ? "+" : ""}${settings.pitch} st`}
					onChange={(value) => update("pitch", value)}
				/>
				<Slider
					label="Length"
					value={settings.duration}
					min={0.25}
					max={3}
					step={0.05}
					display={`${settings.duration.toFixed(2)}x`}
					onChange={(value) => update("duration", value)}
				/>
				<Slider
					label="Volume"
					value={settings.gain}
					min={0}
					max={2}
					step={0.05}
					display={`${Math.round(settings.gain * 100)}%`}
					onChange={(value) => update("gain", value)}
				/>
				<Slider
					label="Pan"
					value={settings.pan}
					min={-1}
					max={1}
					step={0.05}
					display={
						settings.pan === 0
							? "center"
							: settings.pan < 0
								? `${Math.round(Math.abs(settings.pan) * 100)}% L`
								: `${Math.round(settings.pan * 100)}% R`
					}
					onChange={(value) => update("pan", value)}
				/>
				<label className="grid gap-2">
					<span className="text-xs font-medium">Waveform</span>
					<select
						value={settings.waveform}
						onChange={(event) =>
							update("waveform", event.target.value as Waveform | "original")
						}
						className="h-8 border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
					>
						<option value="original">Original</option>
						<option value="sine">Sine</option>
						<option value="triangle">Triangle</option>
						<option value="square">Square</option>
						<option value="sawtooth">Sawtooth</option>
					</select>
				</label>
			</div>

			<div className="space-y-2">
				<PackageManagerSwitcher value={pm} onChange={setPm} />
				<div className="relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30">
					<code className="block overflow-x-auto whitespace-nowrap px-4 py-3 pr-12 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{command}
					</code>
					<button
						type="button"
						aria-label="Copy customized install command"
						onClick={copyCommand}
						className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
					>
						{copied ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
					</button>
				</div>
				<p className="text-xs text-muted-foreground">
					The short tuning token reproduces these exact settings from the{" "}
					<code>{theme}</code> theme.
				</p>
			</div>
		</div>
	);
}
