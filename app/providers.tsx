"use client";

import { SoundProvider } from "@litlab/audx/react";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { TRPCReactProvider } from "@/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
	const [enabled, setEnabled] = useState(true);
	const [volume, setVolume] = useState(0.8);

	return (
		<TRPCReactProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<NuqsAdapter>
					<SoundProvider
						enabled={enabled}
						volume={volume}
						onEnabledChange={setEnabled}
						onVolumeChange={setVolume}
					>
						{children}
					</SoundProvider>
				</NuqsAdapter>
			</ThemeProvider>
		</TRPCReactProvider>
	);
}
