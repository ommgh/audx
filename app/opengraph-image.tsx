import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "audx: open-source UI sound effects for React and web apps";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
	return renderOgImage({
		eyebrow: "UI sound effects",
		title: "Give your UI some personality",
		subtitle:
			"43 open-source interaction sounds for React and the web. Synthesized with Web Audio, installed as code you own.",
		seed: "audx",
	});
}
