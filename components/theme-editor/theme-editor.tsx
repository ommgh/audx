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
		previewCost,
		fullCost,
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
				previewCost={previewCost}
				fullCost={fullCost}
			/>
		</div>
	);
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
	previewCost,
	fullCost,
}: ReturnType<typeof useThemeEditor>) {
	switch (state.phase) {
		case "idle":
			return (
				<PromptForm
					themeName={state.themeName}
					themePrompt={state.themePrompt}
					onThemeNameChange={setThemeName}
					onThemePromptChange={setThemePrompt}
					onSubmit={startPreview}
					previewCost={previewCost}
					isSubmitting={false}
				/>
			);
		case "previewing":
			return (
				<GenerationProgress
					sounds={state.previewSounds}
					progress={state.progress}
				/>
			);
		case "preview-ready":
			return (
				<PreviewPlayer
					previewSounds={state.previewSounds}
					fullCost={fullCost}
					onApprove={approvePreview}
					onReject={rejectPreview}
					onRetrySound={retrySound}
				/>
			);
		case "generating":
			return (
				<GenerationProgress sounds={state.sounds} progress={state.progress} />
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
			return <SaveSuccess themeName={state.themeName} />;
	}
}
