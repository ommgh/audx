"use client";

import { cloneElement, type ReactElement } from "react";
import { useAudio } from "@/hooks/use-sound";
import { clickMinimal001Audio } from "@/registry/audx/audio/minimal/click/click";

export function ClickableWithSound({
	children,
	volume = 0.5,
}: {
	children: ReactElement<{ onClick?: (...args: unknown[]) => void }>;
	volume?: number;
}) {
	const [play] = useAudio(clickMinimal001Audio, { volume, interrupt: true });

	return cloneElement(children, {
		onClick: (...args: unknown[]) => {
			play();
			children.props.onClick?.(...args);
		},
	});
}
