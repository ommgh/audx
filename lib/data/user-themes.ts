import { cache } from "react";
import type { ThemeSoundsByCategory, ThemeWithStats } from "@/lib/data/themes";
import prisma from "@/lib/db";
import type { UserTheme } from "@/prisma/generated/client";

export type UserThemeWithStats = UserTheme & { soundCount: number };

export async function getUserThemes(
	userId: string,
): Promise<UserThemeWithStats[]> {
	const themes = await prisma.userTheme.findMany({
		where: { userId },
		select: {
			id: true,
			userId: true,
			name: true,
			description: true,
			themeJson: true,
			soundCount: true,
			sourceTypes: true,
			hasEffects: true,
			hasLayers: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { updatedAt: "desc" },
	});

	return themes as UserThemeWithStats[];
}

function toThemeWithStats(theme: UserThemeWithStats): ThemeWithStats {
	return {
		...theme,
		description: theme.description ?? "",
		author: "You",
		loads: 0,
		url: theme.name,
		source: null,
		sourceUrl: null,
		version: null,
		license: null,
		compatibility: null,
		featured: false,
		verified: false,
		forkedFrom: null,
		fileSize: theme.themeJson ? JSON.stringify(theme.themeJson).length : 0,
	} as ThemeWithStats;
}

export const getUserThemeById = cache(
	async (
		userId: string,
		themeId: number,
	): Promise<UserThemeWithStats | null> => {
		const theme = await prisma.userTheme.findFirst({
			where: {
				id: themeId,
				userId,
			},
			select: {
				id: true,
				userId: true,
				name: true,
				description: true,
				themeJson: true,
				soundCount: true,
				sourceTypes: true,
				hasEffects: true,
				hasLayers: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return theme as UserThemeWithStats | null;
	},
);

export const getUserThemeByName = cache(
	async (userId: string, name: string): Promise<ThemeWithStats | null> => {
		const theme = await prisma.userTheme.findFirst({
			where: {
				userId,
				name: { equals: name, mode: "insensitive" },
			},
			select: {
				id: true,
				userId: true,
				name: true,
				description: true,
				themeJson: true,
				soundCount: true,
				sourceTypes: true,
				hasEffects: true,
				hasLayers: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!theme) return null;

		return toThemeWithStats(theme as UserThemeWithStats);
	},
);

export async function getUserThemeSounds(
	userThemeId: number,
): Promise<ThemeSoundsByCategory[]> {
	const sounds = await prisma.userThemeSound.findMany({
		where: { userThemeId },
		orderBy: [{ category: "asc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			category: true,
			description: true,
		},
	});

	const grouped = new Map<string, ThemeSoundsByCategory["sounds"]>();
	for (const sound of sounds) {
		const existing = grouped.get(sound.category);
		if (existing) existing.push(sound);
		else grouped.set(sound.category, [sound]);
	}

	return Array.from(grouped, ([category, sounds]) => ({ category, sounds }));
}

export function userThemeToThemeWithStats(
	theme: UserThemeWithStats,
): ThemeWithStats {
	return toThemeWithStats(theme);
}
