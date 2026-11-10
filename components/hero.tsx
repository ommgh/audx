import Link from "next/link";
import { HeroInstallationCode } from "@/components/hero-installation-code";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

export function Hero({ items }: { items: AudioCatalogItem[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl border-x flex flex-col items-center px-6 pt-8 pb-7 sm:pt-14 sm:pb-14">
        <h1 className="font-display text-4xl font-bold text-balance text-center sm:text-3xl lg:text-5xl">
          Give your <span className="text-primary">UI</span>
          <br />
          <span className="">Some Personality</span>
        </h1>

        <p className="text-muted-foreground mt-5 max-w-lg text-sm text-center">
          An open-source collection of handcrafted interaction sounds designed
          to add feedback, character, and delight to modern interfaces.
        </p>

        <div className="mt-8 w-full max-w-[620px]">
          <HeroInstallationCode items={items} />
        </div>

        <Link
          href="/showcase"
          className="mt-4 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Hear it in real components →
        </Link>
      </div>
    </section>
  );
}
