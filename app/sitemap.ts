import type { MetadataRoute } from "next";
import { getAllAudio } from "@/lib/audio-catalog";
import { absoluteUrl } from "@/lib/site";

// `lastModified` is deliberately omitted: stamping every URL with the build
// time teaches Google to ignore the field. Google ignores `priority` and
// `changeFrequency`, so they are left out too.
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: absoluteUrl("/") },
		{ url: absoluteUrl("/showcase") },
		{ url: absoluteUrl("/library") },
		{ url: absoluteUrl("/editor") },
		{ url: absoluteUrl("/changelog") },
		...getAllAudio().map((item) => ({ url: absoluteUrl(`/${item.name}`) })),
	];
}
