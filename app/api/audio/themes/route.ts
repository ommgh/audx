import { type NextRequest, NextResponse } from "next/server";
import { deriveThemeMeta, validateTheme } from "@/lib/data/theme-meta";
import prisma from "@/lib/db";
import type { Prisma } from "@/prisma/generated/client";

export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

const ALLOWED_HOSTS = [
	"raw.githubusercontent.com",
	"gist.githubusercontent.com",
	"audx.site",
];

function isAllowedUrl(raw: string): URL | null {
	try {
		const parsed = new URL(raw);
		if (parsed.protocol !== "https:") return null;
		if (
			!ALLOWED_HOSTS.some(
				(h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`),
			)
		)
			return null;
		return parsed;
	} catch {
		return null;
	}
}

function toPrismaJson(data: unknown): Prisma.InputJsonValue {
	return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { url } = body as { url?: string };

		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ error: "Missing required field: url" },
				{ status: 400 },
			);
		}

		const parsed = isAllowedUrl(url);
		if (!parsed) {
			return NextResponse.json(
				{
					error: `URL must be HTTPS from an allowed host: ${ALLOWED_HOSTS.join(", ")}`,
				},
				{ status: 400 },
			);
		}

		const res = await fetch(parsed.href, {
			signal: AbortSignal.timeout(10_000),
			headers: { Accept: "application/json" },
		});
		if (!res.ok) {
			return NextResponse.json(
				{ error: `Failed to fetch theme from URL: ${res.status}` },
				{ status: 400 },
			);
		}

		let themeData: unknown;
		try {
			themeData = await res.json();
		} catch {
			return NextResponse.json(
				{ error: "URL did not return valid JSON" },
				{ status: 400 },
			);
		}

		if (!validateTheme(themeData)) {
			return NextResponse.json(
				{ error: "Invalid theme format: must have name and sounds" },
				{ status: 400 },
			);
		}

		const slug = themeData.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		const soundCount = Object.keys(themeData.sounds).length;
		const author = themeData.author ?? "unknown";
		const description = themeData.description ?? "";
		const derived = deriveThemeMeta(themeData);
		const themeJson = toPrismaJson(themeData);

		const existing = await prisma.theme.findUnique({
			where: { name: slug },
			select: { id: true },
		});

		let themeId: number;

		if (existing) {
			themeId = existing.id;
			await prisma.theme.update({
				where: { id: themeId },
				data: {
					author,
					description,
					soundCount,
					sourceUrl: url,
					themeJson,
					version: themeData.version ?? null,
					license: themeData.license ?? null,
					compatibility: themeData.compatibility ?? null,
					updatedAt: new Date(),
					sourceTypes: derived.sourceTypes,
					hasEffects: derived.hasEffects,
					hasLayers: derived.hasLayers,
					fileSize: derived.fileSize,
				},
			});
		} else {
			const inserted = await prisma.theme.create({
				data: {
					name: slug,
					author,
					description,
					soundCount,
					url: slug,
					sourceUrl: url,
					themeJson,
					version: themeData.version ?? null,
					license: themeData.license ?? null,
					compatibility: themeData.compatibility ?? null,
					sourceTypes: derived.sourceTypes,
					hasEffects: derived.hasEffects,
					hasLayers: derived.hasLayers,
					fileSize: derived.fileSize,
				},
				select: { id: true },
			});
			themeId = inserted.id;
		}

		await prisma.themeSound.deleteMany({ where: { themeId } });

		const soundEntries = Object.keys(themeData.sounds).map((soundName) => ({
			themeId,
			name: soundName,
			category: derived.categories.get(soundName) ?? "general",
		}));

		if (soundEntries.length > 0) {
			await prisma.themeSound.createMany({ data: soundEntries });
		}

		return NextResponse.json({
			ok: true,
			name: slug,
			sounds: soundCount,
			url: `https://audx.site/library/${slug}`,
		});
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}

export async function GET() {
	try {
		const rows = await prisma.theme.findMany({
			select: {
				name: true,
				author: true,
				description: true,
				soundCount: true,
				sourceUrl: true,
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

		const result = rows.map((row) => ({
			name: row.name,
			file: `${row.name}.json`,
			author: row.author,
			description: row.description ?? "",
			soundCount: row.soundCount,
			sourceUrl: row.sourceUrl,
			loads: row._count.loads,
		}));

		return NextResponse.json(result, {
			headers: {
				"Cache-Control":
					"public, max-age=60, s-maxage=60, stale-while-revalidate=300",
			},
		});
	} catch (err) {
		return NextResponse.json({ error: String(err) }, { status: 500 });
	}
}
