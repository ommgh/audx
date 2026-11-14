/**
 * Single source of truth for the public site identity. Everything SEO-facing
 * (canonical URLs, sitemap, robots, JSON-LD, llms.txt) reads from here so the
 * host can never drift between files again.
 *
 * `audx.site` (apex) is canonical; `www.audx.site` should 308 to it.
 */
export const SITE_URL = "https://audx.site";

export const SITE_NAME = "audx";

export const SITE_TITLE = "audx - UI Sound Effects for React & Web Apps";

export const SITE_DESCRIPTION =
	"Open-source UI sound effects for React, Next.js and any web app. 43 semantic interaction sounds (click, toggle, success, error, notification) in 4 themes, synthesized with the Web Audio API and installed as code you own with one CLI command. No audio files.";

export const SITE_KEYWORDS = [
	"ui sound effects",
	"ui sounds",
	"interaction sounds",
	"web audio",
	"web audio api",
	"react sound effects",
	"react sounds",
	"nextjs sound effects",
	"button click sound",
	"notification sound",
	"success sound",
	"error sound",
	"toggle sound",
	"microinteractions",
	"sound design for ui",
	"ui audio",
	"shadcn",
	"use-sound alternative",
	"open source sound effects",
	"free ui sounds",
];

export const NPM_PACKAGE = "@litlab/audx";
export const NPM_URL = "https://www.npmjs.com/package/@litlab/audx";
export const GITHUB_URL = "https://github.com/ommgh/audx";

/** GA4 measurement ID (public by design: it ships in every page's HTML). */
export const GA_MEASUREMENT_ID =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-M5NFPNE1Y5";

export function absoluteUrl(path = "/"): string {
	return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Default social card (rendered by app/opengraph-image.tsx). Next.js replaces
 * `openGraph` wholesale, so any page that sets its own `openGraph` must list
 * this again or it ships without an image.
 */
export const DEFAULT_OG_IMAGE = {
	url: "/opengraph-image",
	width: 1200,
	height: 630,
	alt: "audx: open-source UI sound effects for React and web apps",
};
