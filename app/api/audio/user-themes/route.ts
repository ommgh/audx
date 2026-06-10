import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import type { SoundDefinition } from "@litlab/audx";
import type { Prisma } from "@/prisma/generated/client";

export const dynamic = "force-dynamic";

function toPrismaJson(data: unknown): Prisma.InputJsonValue {
	return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
}

function deriveThemeMeta(themeData: Record<string, SoundDefinition>) {
	const sourceTypes = new Set<string>();
	let hasEffects = false;
	let hasLayers = false;

	for (const sound of Object.values(themeData)) {
		if ("layers" in sound) {
			hasLayers = true;
			for (const layer of sound.layers) {
				sourceTypes.add(layer.source.type);
				if (layer.effects && layer.effects.length > 0) {
					hasEffects = true;
				}
			}
		} else {
			sourceTypes.add(sound.source.type);
			if (sound.effects && sound.effects.length > 0) {
				hasEffects = true;
			}
		}
	}

	const categories = new Map<string, string>();
	for (const soundName of Object.keys(themeData)) {
		// Simple category detection based on sound name
		if (soundName.includes("error") || soundName.includes("warning"))
			categories.set(soundName, "alerts");
		else if (soundName.includes("success") || soundName.includes("complete"))
			categories.set(soundName, "positive");
		else if (
			soundName.includes("click") ||
			soundName.includes("tap") ||
			soundName.includes("press")
		)
			categories.set(soundName, "interactions");
		else categories.set(soundName, "general");
	}

	return {
		sourceTypes: Array.from(sourceTypes),
		hasEffects,
		hasLayers,
		categories,
		fileSize: JSON.stringify(themeData).length,
	};
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { name, description, sounds } = body as {
			name?: string;
			description?: string;
			sounds?: Record<string, SoundDefinition>;
		};

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return NextResponse.json(
				{ error: "Missing or invalid theme name" },
				{ status: 400 },
			);
		}

		if (!sounds || typeof sounds !== "object" || Object.keys(sounds).length === 0) {
			return NextResponse.json(
				{ error: "Theme must have at least one sound" },
				{ status: 400 },
			);
		}

		// Validate that all sounds are valid SoundDefinitions
		for (const [soundName, sound] of Object.entries(sounds)) {
			if (!sound || typeof sound !== "object") {
				return NextResponse.json(
					{ error: `Invalid sound definition: ${soundName}` },
					{ status: 400 },
				);
			}

			if (
				!("source" in sound || "layers" in sound) ||
				!("envelope" in sound && "gain" in sound) &&
				!("layers" in sound)
			) {
				return NextResponse.json(
					{ error: `Invalid sound definition structure: ${soundName}` },
					{ status: 400 },
				);
			}
		}

		const soundCount = Object.keys(sounds).length;
		const derived = deriveThemeMeta(sounds);
		const themeJson = toPrismaJson(sounds);

		// Check if theme already exists for this user
		const existing = await prisma.userTheme.findUnique({
			where: {
				userId_name: {
					userId: session.user.id,
					name,
				},
			},
			select: { id: true },
		});

		let userThemeId: number;

		if (existing) {
			// Update existing theme
			userThemeId = existing.id;
			await prisma.userTheme.update({
				where: { id: userThemeId },
				data: {
					description: description ?? null,
					soundCount,
					themeJson,
					sourceTypes: derived.sourceTypes,
					hasEffects: derived.hasEffects,
					hasLayers: derived.hasLayers,
					updatedAt: new Date(),
				},
			});
		} else {
			// Create new theme
			const created = await prisma.userTheme.create({
				data: {
					userId: session.user.id,
					name,
					description: description ?? null,
					soundCount,
					themeJson,
					sourceTypes: derived.sourceTypes,
					hasEffects: derived.hasEffects,
					hasLayers: derived.hasLayers,
				},
				select: { id: true },
			});
			userThemeId = created.id;
		}

		// Clear and update sounds
		await prisma.userThemeSound.deleteMany({ where: { userThemeId } });

		const soundEntries = Object.keys(sounds).map((soundName) => ({
			userThemeId,
			name: soundName,
			category: derived.categories.get(soundName) ?? "general",
		}));

		if (soundEntries.length > 0) {
			await prisma.userThemeSound.createMany({ data: soundEntries });
		}

		return NextResponse.json({
			ok: true,
			id: userThemeId,
			name,
			sounds: soundCount,
		});
	} catch (err) {
		console.error("Error saving user theme:", err);
		return NextResponse.json(
			{ error: String(err) },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const userThemes = await prisma.userTheme.findMany({
			where: { userId: session.user.id },
			select: {
				id: true,
				name: true,
				description: true,
				soundCount: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: { updatedAt: "desc" },
		});

		return NextResponse.json(userThemes);
	} catch (err) {
		console.error("Error fetching user themes:", err);
		return NextResponse.json(
			{ error: String(err) },
			{ status: 500 },
		);
	}
}
