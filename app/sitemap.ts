import type { MetadataRoute } from "next";
import { getAllAudio } from "@/lib/audio-data";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://audx.site";

export default function sitemap(): MetadataRoute.Sitemap {
	const items = getAllAudio();
	const now = new Date();

	return [
		{
			url: baseUrl,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		...items.map((item) => ({
			url: `${baseUrl}/sound/${item.name}`,
			lastModified: now,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
	];
}
