import { getAllAudio, getAudioByName } from "@/lib/audio-catalog";
import { renderOgImage } from "@/lib/og";

// Social card for /audio/[theme]/[sound]. It can't live next to that page as
// `opengraph-image.tsx`: metadata routes under a catch-all segment break
// routing for the whole app at runtime.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
	return getAllAudio().map((s) => ({
		theme: s.theme,
		sound: s.meta.semanticName,
	}));
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ theme: string; sound: string }> },
) {
	const { theme, sound } = await params;
	const audio = getAudioByName(`audio/${theme}/${sound}`);
	if (!audio) return new Response("Not found", { status: 404 });

	return renderOgImage({
		eyebrow: `${theme} theme`,
		title: `${audio.title} sound effect`,
		subtitle: audio.description
			? `${audio.description}. A synthesized UI sound for React and the web.`
			: "A synthesized UI sound for React and the web.",
		seed: audio.name,
		footer: `npx @litlab/audx add ${sound}`,
	});
}
