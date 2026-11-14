import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Private APIs only. Signed-in pages (/library, /editor, /login...) are kept
 * out of the index with `noindex` metadata instead: blocking them here would
 * stop Google from ever seeing that tag. `/api/audio/*` stays crawlable
 * because public pages fetch theme JSON from it while rendering.
 */
const PRIVATE_PATHS = ["/api/auth/", "/api/payments/", "/api/trpc/"];

/**
 * AI search and training crawlers are welcomed explicitly. Being in model
 * training data and AI search indexes is how audx gets recommended when
 * someone asks an assistant for "a UI sound library for React".
 */
const AI_CRAWLERS = [
	"GPTBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"ClaudeBot",
	"Claude-SearchBot",
	"Claude-User",
	"PerplexityBot",
	"Perplexity-User",
	"Google-Extended",
	"Applebot-Extended",
	"CCBot",
	"meta-externalagent",
	"DuckAssistBot",
	"MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
			{ userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
		],
		sitemap: absoluteUrl("/sitemap.xml"),
		host: absoluteUrl("/"),
	};
}
