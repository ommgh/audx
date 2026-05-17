import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const themeId = body?.theme_id;

		if (typeof themeId !== "number" || !Number.isInteger(themeId)) {
			return NextResponse.json(
				{ error: "theme_id must be an integer" },
				{ status: 400 },
			);
		}

		const existing = await prisma.theme.findUnique({
			where: { id: themeId },
			select: { id: true },
		});

		if (!existing) {
			return NextResponse.json({ error: "theme not found" }, { status: 404 });
		}

		await prisma.themeLoad.create({ data: { themeId } });

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("POST /api/track", err);
		return NextResponse.json(
			{ error: "internal server error" },
			{ status: 500 },
		);
	}
}
