import { Suspense } from "react";
import { AudioPage } from "@/components/audio-page";
import { Header } from "@/components/header";
import { getAllAudio, getAllThemes } from "@/lib/audio-catalog";

export default function Home() {
	const items = getAllAudio();
	const themes = getAllThemes();
	return (
		<Suspense>
			<div className="flex min-h-svh flex-col">
				<Header />
				<AudioPage items={items} themes={themes} />
			</div>
		</Suspense>
	);
}
