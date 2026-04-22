"use client";

import { RiPaletteLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemeCatalogItem } from "@/lib/theme-data";

interface ThemeSelectorProps {
	themes: ThemeCatalogItem[];
	selectedTheme: string;
	onThemeChange: (themeName: string) => void;
}

export function ThemeSelector({
	themes,
	selectedTheme,
	onThemeChange,
}: ThemeSelectorProps) {
	const selected = themes.find((t) => t.name === selectedTheme);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="sm">
						<RiPaletteLine data-icon="inline-start" />
						{selected?.displayName ?? "Select theme"}
					</Button>
				}
			/>
			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={selectedTheme}
					onValueChange={(value) => onThemeChange(value as string)}
				>
					{themes.map((theme) => (
						<DropdownMenuRadioItem key={theme.name} value={theme.name}>
							{theme.displayName}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
