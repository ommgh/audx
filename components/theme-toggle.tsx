"use client";

import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();

	return (
		// biome-ignore lint/a11y/useButtonType: <explanation>
		<Button
			onClick={() => {
				const newTheme = resolvedTheme === "dark" ? "light" : "dark";
				setTheme(newTheme);
			}}
			className="p-4"
			variant={"outline"}
			aria-label="Toggle theme"
		>
			<RiSunLine
				size={16}
				className="absolute opacity-100 transition-opacity dark:opacity-0"
			/>
			<RiMoonLine
				size={16}
				className="absolute opacity-0 transition-opacity dark:opacity-100"
			/>
		</Button>
	);
}
