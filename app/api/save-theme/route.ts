import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { saveThemeRequestSchema } from "@/lib/generate-theme-schema";
import { persistThemePack, themeExistsInBlob } from "@/lib/theme-persistence";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = saveThemeRequestSchema.parse(body);

		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Authentication required to save themes" },
				{ status: 401 },
			);
		}

		// Check if theme name already exists in blob storage
		const exists = await themeExistsInBlob(parsed.themeName);
		if (exists) {
			return NextResponse.json(
				{ error: "Theme already exists" },
				{ status: 409 },
			);
		}

		const result = await persistThemePack({
			themeName: parsed.themeName,
			themePrompt: parsed.themePrompt,
			sounds: parsed.sounds,
		});

		await prisma.generatedTheme.create({
			data: {
				name: parsed.themeName,
				prompt: parsed.themePrompt,
				blobIndexUrl: result.indexUrl,
				assetCount: result.assetCount,
				userId: session.user.id,
			},
		});

		return NextResponse.json({
			success: true,
			indexUrl: result.indexUrl,
			themeName: parsed.themeName,
			assetCount: result.assetCount,
		});
	} catch (error) {
		if (error instanceof ZodError) {
			const issue = error.issues[0];
			const message = issue?.message ?? "Invalid request";
			return NextResponse.json({ error: message }, { status: 400 });
		}

		if (
			error instanceof Error &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		) {
			return NextResponse.json(
				{ error: "Theme already exists" },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to save theme" },
			{ status: 500 },
		);
	}
}
