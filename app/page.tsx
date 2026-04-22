import { AudioPage } from "@/components/audio-page";
import { getAllAudio } from "@/lib/audio-data";
import { getAllThemes } from "@/lib/theme-data";

export default function Home() {
	const items = getAllAudio();
	const themes = getAllThemes();
	return <AudioPage items={items} themes={themes} />;
}
