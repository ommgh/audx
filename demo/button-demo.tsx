"use client";
import { usePatch } from "@litlab/audx/react";
import { Button } from "@/components/ui/button";

export function ToolbarAudio() {
	const minimal = usePatch("/themes/minimal.json");
	const playful = usePatch("/themes/playful.json");

	return (
		<div>
			<Button onClick={() => minimal?.play("click")}>Click</Button>
			<Button onClick={() => playful?.play("success")}>Success</Button>
		</div>
	);
}
