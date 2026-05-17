import type { ReactNode } from "react";

export default function ThemesLayout({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-6xl mx-auto border-x border-border min-h-dvh">
      <div className="w-full">{children}</div>
    </main>
  );
}
