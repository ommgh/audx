"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ReactNode } from "react";
import { useAudio } from "@/hooks/use-sound";
import { click001Audio } from "@/registry/audx/sounds/click-001/click-001";

export function ClickableWithSound({
  children,
  volume = 0.5,
}: {
  children: ReactNode;
  volume?: number;
}) {
  const [play] = useAudio(click001Audio, { volume, interrupt: true });

  return <Slot onClick={() => play()}>{children}</Slot>;
}
