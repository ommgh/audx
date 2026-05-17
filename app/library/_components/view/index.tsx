"use client";

import { Field } from "@base-ui/react";
import { RiFileSearchLine, RiSearchLine } from "@remixicon/react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ThemeWithStats } from "@/lib/data/themes";
import { Card } from "../card";

export function View({ themes }: { themes: ThemeWithStats[] }) {
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);
  const stopByThemeIdRef = useRef<Map<number, () => void>>(new Map());

  const registerStop = useCallback((themeId: number, stop: () => void) => {
    stopByThemeIdRef.current.set(themeId, stop);
    return () => {
      stopByThemeIdRef.current.delete(themeId);
    };
  }, []);

  const requestPlay = useCallback(
    (themeId: number) => {
      if (activeThemeId && activeThemeId !== themeId) {
        stopByThemeIdRef.current.get(activeThemeId)?.();
      }
      setActiveThemeId(themeId);
    },
    [activeThemeId],
  );

  const clearActive = useCallback((themeId: number) => {
    setActiveThemeId((prev) => (prev === themeId ? null : prev));
  }, []);

  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: true, throttleMs: 300 }),
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return themes;
    return themes.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term),
    );
  }, [themes, query]);

  return (
    <div className="w-full px-6 pt-8 pb-12">
      <Field.Root className="relative flex shrink-0 items-center w-full mb-6">
        <RiSearchLine
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          size={16}
          aria-hidden="true"
        />
        <Field.Control
          autoComplete="off"
          placeholder="Search..."
          className="w-full h-10 pl-9 pr-3 bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          onValueChange={(value) => setQuery(value)}
        />
      </Field.Root>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-muted text-center">
          <div className="flex items-center justify-center p-2 mb-4 text-muted-foreground bg-background shadow-sm">
            <RiFileSearchLine size={48} aria-hidden="true" />
          </div>
          <p className="mb-1 text-base font-semibold text-foreground">
            No themes found.
          </p>
          <p className="text-sm text-muted-foreground">
            Try searching for a different term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((theme) => (
            <Card
              key={theme.id}
              theme={theme}
              isActive={activeThemeId === theme.id}
              registerStop={registerStop}
              requestPlay={requestPlay}
              clearActive={clearActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
