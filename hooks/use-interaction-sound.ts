"use client";

import { usePatch } from "@litlab/audx/react";
import { useCallback } from "react";

const DEFAULT_UI_THEME = "minimal";

type PlayOptions = Parameters<ReturnType<typeof usePatch>["play"]>[1];

export function useInteractionSound(theme = DEFAULT_UI_THEME) {
  const patch = usePatch(`/api/audio/theme/${theme}`);

  return useCallback(
    (soundName: string, options?: PlayOptions) => {
      patch.play(soundName, options);
    },
    [patch],
  );
}
