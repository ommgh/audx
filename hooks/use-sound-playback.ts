"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadAudioAsset } from "@/lib/audio-loader";
import { type AudioPlayback, playAudio } from "@/lib/play-audio";

export type PlayState = "idle" | "loading" | "playing";

export interface AudioPlaybackControls {
	playState: PlayState;
	toggle: () => void;
}

export function useAudioPlayback(
	audioName: string | null,
): AudioPlaybackControls {
	const playbackRef = useRef<AudioPlayback | null>(null);
	const [playState, setPlayState] = useState<PlayState>("idle");

	// Stop & reset when the audio changes
	useEffect(() => {
		setPlayState("idle");
		return () => {
			playbackRef.current?.stop();
			playbackRef.current = null;
		};
	}, []);

	const toggle = useCallback(async () => {
		if (!audioName) return;

		if (playbackRef.current) {
			playbackRef.current.stop();
			playbackRef.current = null;
			setPlayState("idle");
			return;
		}

		try {
			setPlayState("loading");
			const asset = await loadAudioAsset(audioName);
			const pb = await playAudio(asset.dataUri, {
				onEnd: () => {
					playbackRef.current = null;
					setPlayState("idle");
				},
			});
			playbackRef.current = pb;
			setPlayState("playing");
		} catch (err) {
			console.error(`[useAudioPlayback] Failed to play "${audioName}":`, err);
			playbackRef.current = null;
			setPlayState("idle");
		}
	}, [audioName]);

	return { playState, toggle };
}
