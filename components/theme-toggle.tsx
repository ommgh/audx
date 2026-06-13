"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useInteractionSound } from "@/hooks/use-interaction-sound";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const playInteraction = useInteractionSound();

  return (
    <Button
      onClick={() => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        playInteraction(newTheme === "dark" ? "disable" : "enable");
        setTheme(newTheme);
      }}
      className="p-4"
      variant={"outline"}
      aria-label="Toggle theme"
    >
      <RiSunLine
        size={16}
        className="absolute opacity-100 transition-opacity dark:opacity-0"
      />
      <RiMoonLine
        size={16}
        className="absolute opacity-0 transition-opacity dark:opacity-100"
      />
    </Button>
  );
}
