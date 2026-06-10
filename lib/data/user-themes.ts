import { cache } from "react";
import prisma from "@/lib/db";
import type { UserTheme } from "@/prisma/generated/client";

export type UserThemeWithStats = UserTheme & { soundCount: number };

export async function getUserThemes(userId: string): Promise<UserThemeWithStats[]> {
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

export const getUserThemeById = cache(
  async (userId: string, themeId: number): Promise<UserThemeWithStats | null> => {
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
