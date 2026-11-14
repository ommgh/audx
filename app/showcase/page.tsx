import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Showcase } from "@/components/showcase";
import { BUILT_IN_THEMES } from "@/lib/audio-catalog";

export const metadata: Metadata = {
	title: "Showcase",
	description:
		"Real UI components wired to audx sounds. Switch between minimal, playful, mechanical and retro to hear the same interface with a different personality.",
	alternates: { canonical: "/showcase" },
};

export default function ShowcasePage() {
	return (
		<div className="flex min-h-svh flex-col">
			<Header />
			<main className="flex-1">
				<Showcase themes={BUILT_IN_THEMES} />
			</main>
		</div>
	);
}
