import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InstallMethodProvider } from "@/contexts/install-method-context";
import { PackageManagerProvider } from "@/contexts/package-manager-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const siteUrl = "https://audx.dev";

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
        url: "/hero-dark.png",
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
    images: ["/hero-dark.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1b2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}
      >
        <Suspense fallback={<>...</>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>
              <PackageManagerProvider>
                <InstallMethodProvider>
                  <div className="flex min-h-svh flex-col">
                    <Header />
                    {children}
                    <Footer />
                  </div>
                </InstallMethodProvider>
              </PackageManagerProvider>
            </NuqsAdapter>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
