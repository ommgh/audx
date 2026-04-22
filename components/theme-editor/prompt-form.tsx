"use client";

import { RiLoader4Line, RiSparklingLine } from "@remixicon/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/audx/ui/button";
import { Input } from "@/registry/audx/ui/input";
import { Label } from "@/registry/audx/ui/label";
import { Textarea } from "@/registry/audx/ui/textarea";

const THEME_NAME_REGEX = /^[a-z0-9-]*$/;
const MAX_PROMPT_LENGTH = 300;

const SUGGESTION_CHIPS = [
	"warm wooden textures",
	"futuristic digital",
	"retro arcade",
	"soft organic",
] as const;

interface PromptFormProps {
	themeName: string;
	themePrompt: string;
	onThemeNameChange: (name: string) => void;
	onThemePromptChange: (prompt: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
}

export function PromptForm({
	themeName,
	themePrompt,
	onThemeNameChange,
	onThemePromptChange,
	onSubmit,
	isSubmitting,
}: PromptFormProps) {
	const [nameBlurred, setNameBlurred] = useState(false);

	const nameValid = THEME_NAME_REGEX.test(themeName);
	const nameError = nameBlurred && themeName.length > 0 && !nameValid;
	const nameEmpty = nameBlurred && themeName.length === 0;

	const promptLength = themePrompt.length;
	const promptTooLong = promptLength > MAX_PROMPT_LENGTH;
	const canSubmit =
		themeName.length > 0 &&
		nameValid &&
		promptLength >= 1 &&
		!promptTooLong &&
		!isSubmitting;

	function handleNameChange(value: string) {
		onThemeNameChange(value);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (canSubmit) onSubmit();
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* Theme Name */}
			<div className="flex flex-col gap-2">
				<Label htmlFor="theme-name">Theme Name</Label>
				<Input
					id="theme-name"
					placeholder="my-custom-theme"
					value={themeName}
					onChange={(e) => handleNameChange(e.target.value)}
					onBlur={() => setNameBlurred(true)}
					disabled={isSubmitting}
					aria-invalid={nameError || nameEmpty || undefined}
					autoComplete="off"
				/>
				{nameError ? (
					<p className="text-destructive text-xs">
						Only lowercase letters, numbers, and hyphens allowed
					</p>
				) : nameEmpty ? (
					<p className="text-destructive text-xs">Theme name is required</p>
				) : (
					<p className="text-muted-foreground text-xs">
						Lowercase letters, numbers, and hyphens only
					</p>
				)}
			</div>

			{/* Theme Prompt */}
			<div className="flex flex-col gap-2">
				<Label htmlFor="theme-prompt">Describe your theme</Label>
				{/* Suggestion Chips */}
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap gap-2">
						{SUGGESTION_CHIPS.map((chip) => (
							<button
								key={chip}
								type="button"
								onClick={() => onThemePromptChange(chip)}
								disabled={isSubmitting}
								className={cn(
									"border border-border/50 bg-card px-3 py-1.5 text-sm font-medium transition-colors",
									"hover:border-primary/30 hover:bg-accent hover:text-accent-foreground",
									"focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
									"disabled:pointer-events-none disabled:opacity-50",
								)}
							>
								{chip}
							</button>
						))}
					</div>
				</div>
				<Textarea
					id="theme-prompt"
					placeholder="Describe the mood, style, or aesthetic you want for your sounds…"
					value={themePrompt}
					onChange={(e) => onThemePromptChange(e.target.value)}
					disabled={isSubmitting}
					aria-invalid={promptTooLong || undefined}
					className="min-h-24 resize-none"
				/>
				<span
					className={cn(
						"text-xs text-right",
						promptTooLong ? "text-destructive" : "text-muted-foreground",
					)}
				>
					{promptLength}/{MAX_PROMPT_LENGTH}
				</span>
			</div>

			{/* Generate Button */}
			<div className="flex justify-end">
				<Button type="submit" disabled={!canSubmit} size="lg">
					{isSubmitting ? (
						<>
							<RiLoader4Line size={16} className="animate-spin" />
							Generating…
						</>
					) : (
						<>
							<RiSparklingLine size={16} />
							Generate Preview
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
