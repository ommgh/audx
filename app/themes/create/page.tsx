import type { Metadata } from "next";
import { ThemeEditor } from "@/components/theme-editor/theme-editor";

export const metadata: Metadata = {
	title: "Create Theme — audx",
	description:
		"Describe a mood or style and generate a complete 65-sound theme pack using AI. Preview, review, and publish your custom sound theme.",
};

export default function CreateThemePage() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 py-12 border-x min-h-[calc(100vh-3.5rem)]">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Create Theme</h1>
				<p className="mt-2 text-muted-foreground">
					Describe a mood or style and generate a complete sound theme with AI.
				</p>
			</div>
			<ThemeEditor />
		</main>
	);
}
