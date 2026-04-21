"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSoundGeneratorReturn {
	prompt: string;
	setPrompt: (value: string) => void;
	durationSeconds: number | null;
	setDurationSeconds: (value: number | null) => void;
	promptInfluence: number;
	setPromptInfluence: (value: number) => void;
	isGenerating: boolean;
	error: string | null;
	audioUrl: string | null;
	generate: () => Promise<void>;
}

export function useSoundGenerator(): UseSoundGeneratorReturn {
	const [prompt, setPrompt] = useState("");
	const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
	const [promptInfluence, setPromptInfluence] = useState(0.3);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const audioUrlRef = useRef<string | null>(null);

	// Revoke blob URL on unmount
	useEffect(() => {
		return () => {
			if (audioUrlRef.current) {
				URL.revokeObjectURL(audioUrlRef.current);
			}
		};
	}, []);

	const generate = useCallback(async () => {
		if (!prompt.trim() || isGenerating) return;

		setError(null);
		setIsGenerating(true);

		try {
			const body: Record<string, unknown> = { text: prompt };
			if (durationSeconds !== null) {
				body.duration_seconds = durationSeconds;
			}
			if (promptInfluence !== undefined) {
				body.prompt_influence = promptInfluence;
			}

			const response = await fetch("/api/generate-sound", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				let message = "Something went wrong. Please try again.";
				try {
					const data = await response.json();
					if (data.error) {
						message = data.error;
					}
				} catch {
					// JSON parse failed, use default message
				}
				setError(message);
				setIsGenerating(false);
				return;
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			// Revoke previous blob URL
			if (audioUrlRef.current) {
				URL.revokeObjectURL(audioUrlRef.current);
			}

			audioUrlRef.current = url;
			setAudioUrl(url);
			setIsGenerating(false);
		} catch {
			setError("Network error. Please check your connection and try again.");
			setIsGenerating(false);
		}
	}, [prompt, isGenerating, durationSeconds, promptInfluence]);

	return {
		prompt,
		setPrompt,
		durationSeconds,
		setDurationSeconds,
		promptInfluence,
		setPromptInfluence,
		isGenerating,
		error,
		audioUrl,
		generate,
	};
}
