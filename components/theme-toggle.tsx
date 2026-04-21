"use client";

import { useTheme } from "next-themes";
import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { trackEvent } from "@/lib/analytics";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => {
        const newTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        trackEvent("theme_toggled", { theme: newTheme });
      }}
      className="text-muted-foreground hover:text-primary relative flex size-5 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:rounded-sm"
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
    </button>
  );
}
