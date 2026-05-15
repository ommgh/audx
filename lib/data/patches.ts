import { cache } from "react";
import prisma from "@/lib/db";
import type { Patch } from "@/prisma/generated/client";

export type PatchWithStats = Patch & { loads: number };

export type PatchSound = {
	id: number;
	name: string;
	category: string;
	description: string | null;
};

export type PatchSoundsByCategory = {
	category: string;
	sounds: PatchSound[];
};

export async function getPatchesAllTime(): Promise<PatchWithStats[]> {
	const patches = await prisma.patch.findMany({
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

	return patches.map((patch) => ({
		...patch,
		loads: patch._count.loads,
		_count: undefined,
	})) as PatchWithStats[];
}

export const getPatchByName = cache(
	async (name: string): Promise<PatchWithStats | null> => {
		const patch = await prisma.patch.findUnique({
			where: { name },
			include: {
				_count: {
					select: { loads: true },
				},
			},
		});

		if (!patch) return null;

		return {
			...patch,
			loads: patch._count.loads,
			_count: undefined,
		} as PatchWithStats;
	},
);

export async function getPatchSounds(
	patchId: number,
): Promise<PatchSoundsByCategory[]> {
	const sounds = await prisma.patchSound.findMany({
		where: { patchId },
		orderBy: [{ category: "asc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			category: true,
			description: true,
		},
	});

	const grouped = new Map<string, PatchSound[]>();
	for (const sound of sounds) {
		const existing = grouped.get(sound.category);
		if (existing) existing.push(sound);
		else grouped.set(sound.category, [sound]);
	}

	return Array.from(grouped, ([category, sounds]) => ({ category, sounds }));
}
