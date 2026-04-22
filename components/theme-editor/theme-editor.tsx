"use client";

import { useEffect } from "react";
import { useThemeEditor } from "@/hooks/use-theme-editor";
import { GenerationProgress } from "./generation-progress";
import { PreviewPlayer } from "./preview-player";
import { PromptForm } from "./prompt-form";
import { SaveSuccess } from "./save-success";
import { ThemeReview } from "./theme-review";

export function ThemeEditor() {
	const {
		state,
		setThemeName,
		setThemePrompt,
		startPreview,
		approvePreview,
		rejectPreview,
		retrySound,
		saveTheme,
	} = useThemeEditor();

	// Warn before navigating away during active generation
	useEffect(() => {
		if (state.phase !== "previewing" && state.phase !== "generating") return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [state.phase]);

	return (
		<div className="flex flex-col gap-6">
			{state.error && (
				<div
					role="alert"
					className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
				>
					{state.error}
				</div>
			)}
			<PhaseRenderer
				state={state}
				setThemeName={setThemeName}
				setThemePrompt={setThemePrompt}
				startPreview={startPreview}
				approvePreview={approvePreview}
				rejectPreview={rejectPreview}
				retrySound={retrySound}
				saveTheme={saveTheme}
			/>
		</div>
	);
}

interface PhaseRendererProps {
	state: ReturnType<typeof useThemeEditor>["state"];
	setThemeName: (name: string) => void;
	setThemePrompt: (prompt: string) => void;
	startPreview: () => Promise<void>;
	approvePreview: () => Promise<void>;
	rejectPreview: () => void;
	retrySound: (semanticName: string) => Promise<void>;
	saveTheme: () => Promise<void>;
}

function PhaseRenderer({
	state,
	setThemeName,
	setThemePrompt,
	startPreview,
	approvePreview,
	rejectPreview,
	retrySound,
	saveTheme,
}: PhaseRendererProps) {
	switch (state.phase) {
		case "idle":
			return (
				<PromptForm
					themeName={state.themeName}
					themePrompt={state.themePrompt}
					onThemeNameChange={setThemeName}
					onThemePromptChange={setThemePrompt}
					onSubmit={startPreview}
					isSubmitting={false}
				/>
			);
		case "previewing":
			return (
				<GenerationProgress
					sounds={state.previewSounds}
					progress={state.progress}
					startTime={state.startTime}
				/>
			);
		case "preview-ready":
			return (
				<PreviewPlayer
					previewSounds={state.previewSounds}
					onApprove={approvePreview}
					onReject={rejectPreview}
					onRetrySound={retrySound}
				/>
			);
		case "generating":
			return (
				<GenerationProgress
					sounds={state.sounds}
					progress={state.progress}
					startTime={state.startTime}
				/>
			);
		case "review":
			return (
				<ThemeReview
					previewSounds={state.previewSounds}
					sounds={state.sounds}
					progress={state.progress}
					elapsedMs={state.elapsedMs}
					onSave={saveTheme}
					onRetrySound={retrySound}
					isSaving={false}
				/>
			);
		case "saving":
			return (
				<ThemeReview
					previewSounds={state.previewSounds}
					sounds={state.sounds}
					progress={state.progress}
					elapsedMs={state.elapsedMs}
					onSave={saveTheme}
					onRetrySound={retrySound}
					isSaving={true}
				/>
			);
		case "saved":
			return (
				<SaveSuccess themeName={state.themeName} indexUrl={state.indexUrl!} />
			);
	}
}
