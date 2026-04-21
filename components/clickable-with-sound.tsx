"use client";

import { cloneElement, type ReactElement } from "react";
import { useAudio } from "@/hooks/use-sound";
import { click001Audio } from "@/registry/audx/audio/click-001/click-001";

export function ClickableWithSound({
	children,
	volume = 0.5,
}: {
	children: ReactElement<{ onClick?: (...args: unknown[]) => void }>;
	volume?: number;
}) {
	const [play] = useAudio(click001Audio, { volume, interrupt: true });

	return cloneElement(children, {
		onClick: (...args: unknown[]) => {
			play();
			children.props.onClick?.(...args);
		},
	});
}
