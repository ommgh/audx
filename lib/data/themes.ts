import { cache } from "react";
import prisma from "@/lib/db";
import type { Theme } from "@/prisma/generated/client";

export type ThemeWithStats = Theme & { loads: number };

export type ThemeSound = {
	id: number;
	name: string;
	category: string;
	description: string | null;
};

export type ThemeSoundsByCategory = {
	category: string;
	sounds: ThemeSound[];
};

export async function getThemesAllTime(): Promise<ThemeWithStats[]> {
	const themes = await prisma.theme.findMany({
		include: {
			_count: {
				select: { loads: true },
			},
		},
		orderBy: {
			loads: {
				_count: "desc",
			},
		},
	});

	return themes.map((theme) => ({
		...theme,
		loads: theme._count.loads,
		_count: undefined,
	})) as ThemeWithStats[];
}

export const getThemeByName = cache(
	async (name: string): Promise<ThemeWithStats | null> => {
		const theme = await prisma.theme.findUnique({
			where: { name },
			include: {
				_count: {
					select: { loads: true },
				},
			},
		});

		if (!theme) return null;

		return {
			...theme,
			loads: theme._count.loads,
			_count: undefined,
		} as ThemeWithStats;
	},
);

export async function getThemeSounds(
	themeId: number,
): Promise<ThemeSoundsByCategory[]> {
	const sounds = await prisma.themeSound.findMany({
		where: { themeId },
		orderBy: [{ category: "asc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			category: true,
			description: true,
		},
	});

	const grouped = new Map<string, ThemeSound[]>();
	for (const sound of sounds) {
		const existing = grouped.get(sound.category);
		if (existing) existing.push(sound);
		else grouped.set(sound.category, [sound]);
	}

	return Array.from(grouped, ([category, sounds]) => ({ category, sounds }));
}
