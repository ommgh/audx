"use client";

import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics";
import { loadAudioAsset } from "@/lib/audio-loader";

export function useAudioDownload(audioName: string | null) {
	return useCallback(async () => {
		if (!audioName) return;
		try {
			const asset = await loadAudioAsset(audioName);
			const res = await fetch(asset.dataUri);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${audioName}.${asset.format}`;
			a.click();
			URL.revokeObjectURL(url);
			trackEvent("audio_downloaded", { audioName });
		} catch (err) {
			console.error(
				`[useAudioDownload] Failed to download "${audioName}":`,
				err,
			);
		}
	}, [audioName]);
}
