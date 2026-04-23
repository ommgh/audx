import { HeroInstallationCode } from "@/components/hero-installation-code";
import type { AudioCatalogItem } from "@/lib/audio-catalog";

export function Hero({ items }: { items: AudioCatalogItem[] }) {
	return (
		<section className="relative overflow-hidden">
			<div className="relative mx-auto max-w-6xl border-x flex flex-col items-center px-6 pt-8 pb-14 sm:pt-14 sm:pb-20">
				<h1 className="font-display text-4xl font-bold text-balance text-center sm:text-5xl lg:text-6xl">
					Customisable <span className="text-primary">UI audio</span>
					<br />
					<span className="">Copy. Paste. Play.</span>
				</h1>

				<p className="text-muted-foreground mt-5 max-w-lg text-base text-pretty text-center leading-relaxed sm:text-lg">
					Open-source UI sound effects for modern web apps. Install any audio
					with a single CLI command.
				</p>

				<div className="mt-8 w-full max-w-[620px]">
					<HeroInstallationCode items={items} />
				</div>
			</div>
		</section>
	);
}
