import { Suspense } from "react";
import { AudioBento } from "@/components/audio-bento";
import { Header } from "@/components/header";
import { getAllAudio } from "@/lib/audio-catalog";

export default function BentoPage() {
	const items = getAllAudio();
	return (
		<Suspense>
			<div className="flex min-h-svh flex-col">
				<Header />
				<AudioBento items={items} />
			</div>
		</Suspense>
	);
}
