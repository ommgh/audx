import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoundDetailPage } from "@/components/audio-detail-page";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import {
	type AudioCatalogItem,
	BUILT_IN_THEMES,
	getAllAudio,
	getAudioByName,
	THEME_NAMES,
} from "@/lib/audio-catalog";
import { absoluteUrl, NPM_PACKAGE } from "@/lib/site";

interface PageProps {
	params: Promise<{ name: string[] }>;
}

function buildLookupName(segments: string[]): string {
	// URL: /audio/minimal/alert → segments: ["minimal", "alert"]
	// Lookup key: "audio/minimal/alert"
	return `audio/${segments.join("/")}`;
}

const toTitle = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Primary buttons and links" → "primary buttons and links" for mid-sentence use. */
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function describe(audio: AudioCatalogItem): string {
	const theme = toTitle(audio.theme);
	const use = audio.description
		? ` Use it for ${lowerFirst(audio.description).replace(/\.$/, "")}.`
		: "";
	return `Free ${audio.meta.semanticName} sound effect for web UIs in the ${theme} theme.${use} Synthesized with the Web Audio API (no audio file), ${audio.meta.duration.toFixed(2)}s. Install in React or any web app: npx ${NPM_PACKAGE} add ${audio.meta.semanticName} --theme ${audio.theme}`;
}

export async function generateStaticParams() {
	return getAllAudio().map((s) => {
		// s.name is "audio/minimal/alert" → strip "audio/" prefix and split
		const withoutPrefix = s.name.replace(/^audio\//, "");
		return { name: withoutPrefix.split("/") };
	});
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { name } = await params;
	const audio = getAudioByName(buildLookupName(name));
	if (!audio) return {};

	const title = `${audio.title} Sound Effect (${toTitle(audio.theme)} UI Sound)`;
	const description = describe(audio);
	const path = `/${audio.name}`;
	const image = {
		url: `/og/${audio.theme}/${audio.meta.semanticName}`,
		width: 1200,
		height: 630,
		alt: `${audio.title} sound effect, ${audio.theme} theme`,
	};

	return {
		title,
		description,
		keywords: [
			`${audio.meta.semanticName} sound`,
			`${audio.meta.semanticName} sound effect`,
			`${audio.category} ui sound`,
			`${audio.theme} ui sounds`,
			"ui sound effect",
			"web audio",
			"react sound effect",
		],
		openGraph: {
			title: `${title} | audx`,
			description,
			url: path,
			type: "website",
			images: [image],
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} | audx`,
			description,
			images: [image.url],
		},
		alternates: { canonical: path },
	};
}

export default async function AudioDetailPage({ params }: PageProps) {
	const { name } = await params;
	const audio = getAudioByName(buildLookupName(name));
	if (!audio) notFound();

	const otherThemes = THEME_NAMES.filter((t) => t !== audio.theme).map(
		(theme) => ({
			theme,
			href: `/audio/${theme}/${audio.meta.semanticName}`,
			description: BUILT_IN_THEMES[theme].description,
		}),
	);

	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "UI sounds",
						item: absoluteUrl("/"),
					},
					{
						"@type": "ListItem",
						position: 2,
						name: `${audio.title} sound (${toTitle(audio.theme)})`,
						item: absoluteUrl(`/${audio.name}`),
					},
				],
			},
			{
				"@type": "SoftwareSourceCode",
				name: `${audio.title} sound effect (${audio.theme})`,
				description: describe(audio),
				url: absoluteUrl(`/${audio.name}`),
				programmingLanguage: "TypeScript",
				runtimePlatform: "Web Audio API",
				license: "https://opensource.org/licenses/MIT",
				isPartOf: { "@id": absoluteUrl("/#software") },
				text: `import { ${audio.meta.semanticName === "delete" ? "deleteSound" : audio.meta.semanticName} } from "@/sounds";`,
			},
		],
	};

	return (
		<div className="flex min-h-svh flex-col">
			<JsonLd data={jsonLd} />
			<Header />
			<SoundDetailPage audio={audio} otherThemes={otherThemes} />
		</div>
	);
}
