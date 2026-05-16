"use client";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import { SoundProvider } from "@litlab/audx/react";
import { Analytics } from "@vercel/analytics/next";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";

const spaceGroteskHeading = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

// export const metadata: Metadata = {
// 	metadataBase: new URL(siteUrl),
// 	title: {
// 		default: "audx - Customisable UI Audio for Modern Web Apps",
// 		template: "%s | audx",
// 	},
// 	description:
// 		"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command. Free and open source.",
// 	keywords: [
// 		"ui audio",
// 		"UI sounds",
// 		"web app sounds",
// 		"notification sounds",
// 		"click sounds",
// 		"shadcn",
// 		"react audio",
// 		"nextjs audio",
// 		"free sound effects",
// 		"open source audio",
// 	],
// 	authors: [{ name: "audx" }],
// 	creator: "audx",
// 	openGraph: {
// 		type: "website",
// 		locale: "en_US",
// 		url: siteUrl,
// 		siteName: "audx",
// 		title: "audx - Customisable UI Audio for Modern Web Apps",
// 		description:
// 			"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command.",
// 		images: [
// 			{
// 				url: "/hero-light.png",
// 				width: 2896,
// 				height: 944,
// 				alt: "audx - Customisable UI Audio for Modern Web Apps",
// 			},
// 		],
// 	},
// 	twitter: {
// 		card: "summary_large_image",
// 		title: "audx - Customisable UI Audio for Modern Web Apps",
// 		description:
// 			"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command.",
// 		images: ["/hero-light.png"],
// 	},
// 	alternates: {
// 		canonical: siteUrl,
// 	},
// };

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [enabled, setEnabled] = useState(true);
	const [volume, setVolume] = useState(0.8);
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				"font-sans",

				spaceGroteskHeading.variable,
			)}
		>
			<body>
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
				<Analytics />
			</body>
		</html>
	);
}
