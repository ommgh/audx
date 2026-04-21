import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { saveThemeRequestSchema } from "@/lib/generate-theme-schema";
import { persistThemePack } from "@/lib/theme-persistence";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const parsed = saveThemeRequestSchema.parse(body);

		// Check if theme name already exists
		const themePath = path.join(
			process.cwd(),
			"registry/audx/themes",
			`${parsed.themeName}.json`,
		);

		try {
			await fs.access(themePath);
			return NextResponse.json(
				{ error: "Theme already exists" },
				{ status: 409 },
			);
		} catch {
			// File doesn't exist — good, we can proceed
		}

		const result = await persistThemePack({
			themeName: parsed.themeName,
			themePrompt: parsed.themePrompt,
			sounds: parsed.sounds,
		});

		return NextResponse.json({
			success: true,
			themePath: result.themeDefinitionPath,
		});
	} catch (error) {
		if (error instanceof ZodError) {
			const issue = error.issues[0];
			const message = issue?.message ?? "Invalid request";
			return NextResponse.json({ error: message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to save theme" },
			{ status: 500 },
		);
	}
}
