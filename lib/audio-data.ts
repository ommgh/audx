export { getAllAudio, getAudioByName } from "@/lib/audio-catalog";

export function generateAudioWaves(seed: string) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	}

	return Array.from({ length: 18 }, (_, index) => {
		hash = (hash * 1664525 + 1013904223) >>> 0;
		return {
			height: 20 + ((hash + index * 13) % 80),
		};
	});
}

export function generateWaveform(seed: string) {
	return generateAudioWaves(seed).map((bar) => bar.height);
}
