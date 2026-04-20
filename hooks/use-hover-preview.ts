"use client";

import { useCallback, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { loadAudioAsset } from "@/lib/audio-loader";
import { playAudio, type AudioPlayback } from "@/lib/play-audio";

const DEBOUNCE_MS = 150;

export interface HoverPreviewHandlers {
  onPreviewStart: (audioName: string) => void;
  onPreviewStop: () => void;
}

export function useHoverPreview(): HoverPreviewHandlers {
  const playbackRef = useRef<AudioPlayback | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeNameRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playbackRef.current?.stop();
    playbackRef.current = null;
    activeNameRef.current = null;
  }, []);

  const start = useCallback(
    (audioName: string) => {
      // Already previewing this audio
      if (activeNameRef.current === audioName) return;

      stop();
      activeNameRef.current = audioName;

      timerRef.current = setTimeout(async () => {
        timerRef.current = null;
        if (activeNameRef.current !== audioName) return;

        trackEvent("audio_previewed", { audioName });

        try {
          const asset = await loadAudioAsset(audioName);
          if (activeNameRef.current !== audioName) return;

          const pb = await playAudio(asset.dataUri, {
            onEnd: () => {
              if (activeNameRef.current === audioName) {
                playbackRef.current = null;
                activeNameRef.current = null;
              }
            },
          });

          if (activeNameRef.current !== audioName) {
            pb.stop();
            return;
          }

          playbackRef.current = pb;
        } catch {
          if (activeNameRef.current === audioName) {
            activeNameRef.current = null;
          }
        }
      }, DEBOUNCE_MS);
    },
    [stop],
  );

  return {
    onPreviewStart: start,
    onPreviewStop: stop,
  };
}
