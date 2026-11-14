import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import {
	GA_MEASUREMENT_ID,
	GITHUB_URL,
	NPM_URL,
	SITE_DESCRIPTION,
	SITE_KEYWORDS,
	SITE_NAME,
	SITE_TITLE,
	SITE_URL,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import "./globals.css";

const spaceGroteskHeading = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

// Only the production deployment reports to GA, so local dev and Vercel
// preview builds don't pollute the data.
const enableGoogleAnalytics = process.env.VERCEL_ENV === "production";

const SHORT_DESCRIPTION =
	"Open-source UI sound effects for React and web apps. Synthesized with Web Audio, installed as code you own with one command.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_TITLE,
		template: "%s | audx",
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: SITE_KEYWORDS,
	authors: [{ name: "audx", url: GITHUB_URL }],
	creator: "audx",
	publisher: "audx",
	category: "technology",
	// No `alternates.canonical` here on purpose: it would be inherited by every
	// page that doesn't set its own and mark them as duplicates of the homepage.
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: SITE_TITLE,
		description: SHORT_DESCRIPTION,
		// Images come from the file-based `opengraph-image.tsx` routes, which
		// (unlike this object) survive pages overriding `openGraph`.
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_TITLE,
		description: SHORT_DESCRIPTION,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
};

const siteJsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			"@id": `${SITE_URL}/#organization`,
			name: SITE_NAME,
			url: SITE_URL,
			logo: `${SITE_URL}/audx-logo.svg`,
			sameAs: [GITHUB_URL, NPM_URL],
		},
		{
			"@type": "WebSite",
			"@id": `${SITE_URL}/#website`,
			name: SITE_NAME,
			url: SITE_URL,
			description: SITE_DESCRIPTION,
			publisher: { "@id": `${SITE_URL}/#organization` },
			inLanguage: "en",
		},
	],
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
				<JsonLd data={siteJsonLd} />
				<Providers>{children}</Providers>
				<Analytics />
			</body>
			{enableGoogleAnalytics && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
		</html>
	);
}
