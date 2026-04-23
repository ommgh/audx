import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

const spaceGroteskHeading = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const siteUrl = "https://audx.site";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "audx - Customisable UI Audio for Modern Web Apps",
		template: "%s | audx",
	},
	description:
		"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command. Free and open source.",
	keywords: [
		"ui audio",
		"UI sounds",
		"web app sounds",
		"notification sounds",
		"click sounds",
		"shadcn",
		"react audio",
		"nextjs audio",
		"free sound effects",
		"open source audio",
	],
	authors: [{ name: "audx" }],
	creator: "audx",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		siteName: "audx",
		title: "audx - Customisable UI Audio for Modern Web Apps",
		description:
			"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command.",
		images: [
			{
				url: "/hero-light.png",
				width: 2896,
				height: 944,
				alt: "audx - Customisable UI Audio for Modern Web Apps",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "audx - Customisable UI Audio for Modern Web Apps",
		description:
			"Customisable UI sound effects for modern web apps. Browse, preview, and install audio with a single command.",
		images: ["/hero-light.png"],
	},
	alternates: {
		canonical: siteUrl,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
				<Suspense fallback={<>...</>}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<NuqsAdapter>
							<div className="flex min-h-svh flex-col">
								<Header />
								{children}
							</div>
						</NuqsAdapter>
					</ThemeProvider>
					<Analytics />
				</Suspense>
			</body>
		</html>
	);
}
