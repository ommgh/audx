import type { Metadata } from "next";
import { GenerateSound } from "@/components/generate-sound";

export const metadata: Metadata = {
	title: "Generate Sound",
	description:
		"Generate custom UI sounds with AI. Describe any sound and let AI create it for you.",
};

export default function GeneratePage() {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 border-x">
			<GenerateSound />
		</main>
	);
}
