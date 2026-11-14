import type { Metadata } from "next";
import { Suspense } from "react";
import { AudioPage } from "@/components/audio-page";
import { FaqSection } from "@/components/faq-section";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { getAllAudio, getAllThemes } from "@/lib/audio-catalog";
import {
	GITHUB_URL,
	NPM_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

const softwareJsonLd = {
	"@context": "https://schema.org",
	"@type": ["SoftwareApplication", "SoftwareSourceCode"],
	"@id": `${SITE_URL}/#software`,
	name: SITE_NAME,
	alternateName: "@litlab/audx",
	description: SITE_DESCRIPTION,
	url: SITE_URL,
	applicationCategory: "DeveloperApplication",
	applicationSubCategory: "UI sound effects library",
	operatingSystem: "Web browser, Node.js 20+",
	programmingLanguage: ["TypeScript", "JavaScript"],
	runtimePlatform: "Web Audio API",
	codeRepository: GITHUB_URL,
	downloadUrl: NPM_URL,
	installUrl: NPM_URL,
	license: "https://opensource.org/licenses/MIT",
	isAccessibleForFree: true,
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	publisher: { "@id": `${SITE_URL}/#organization` },
	keywords:
		"UI sound effects, interaction sounds, React sound effects, Web Audio API, button click sound, notification sound",
};

export default function Home() {
	const items = getAllAudio();
	const themes = getAllThemes();
	return (
		<Suspense>
			<JsonLd data={softwareJsonLd} />
			<div className="flex min-h-svh flex-col">
				<Header />
				<AudioPage items={items} themes={themes} />
				<FaqSection />
			</div>
		</Suspense>
	);
}
