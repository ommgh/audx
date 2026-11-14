import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
	title: "AI Sound Theme Generator & Agent Skill",
	description:
		"Generate a custom UI sound theme with AI, or add the create-audio agent skill so Claude Code and other coding agents can design new @litlab/audx sounds from a prompt or an audio file.",
	alternates: { canonical: "/editor" },
	openGraph: {
		title: "AI Sound Theme Generator & Agent Skill | audx",
		description:
			"Generate a custom UI sound theme with AI, or let your coding agent design sounds with the create-audio skill.",
		url: "/editor",
		images: [DEFAULT_OG_IMAGE],
	},
};

export default function EditorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
