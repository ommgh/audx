import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { BUILT_IN_THEMES, isBuiltInTheme } from "@/lib/audio-catalog";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

const CACHE_HEADERS = {
	"Cache-Control": "no-store, max-age=0",
};
const BUILT_IN_CACHE_HEADERS = {
	"Cache-Control":
		"public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;

	// First-party themes ship with the app, so they are always current.
	const slug = name.toLowerCase();
	if (isBuiltInTheme(slug)) {
		recordLoad(slug);
		return NextResponse.json(BUILT_IN_THEMES[slug], {
			headers: BUILT_IN_CACHE_HEADERS,
		});
	}

	const theme = await prisma.theme.findFirst({
		where: { name: { equals: name, mode: "insensitive" } },
		select: {
			name: true,
			themeJson: true,
			sourceUrl: true,
		},
	});

	if (!theme) {
		const session = await auth.api.getSession({ headers: await headers() });

		if (session?.user?.id) {
			const userTheme = await prisma.userTheme.findFirst({
				where: {
					userId: session.user.id,
					name: { equals: name, mode: "insensitive" },
				},
				select: {
					themeJson: true,
				},
			});

			if (userTheme?.themeJson) {
				return NextResponse.json(userTheme.themeJson, {
					headers: CACHE_HEADERS,
				});
			}
		}

		return NextResponse.json({ error: "not found" }, { status: 404 });
	}

	if (theme.themeJson) {
		recordLoad(theme.name);
		return NextResponse.json(theme.themeJson, { headers: CACHE_HEADERS });
	}

	if (!theme.sourceUrl) {
		return NextResponse.json(
			{ error: "Theme has no source URL or cached JSON" },
			{ status: 404 },
		);
	}

	const res = await fetch(theme.sourceUrl);
	if (!res.ok) {
		return NextResponse.json(
			{ error: `Failed to fetch theme from source: ${res.status}` },
			{ status: 502 },
		);
	}

	const themeData = await res.json();

	await prisma.theme.update({
		where: { name: theme.name },
		data: { themeJson: themeData },
	});

	return NextResponse.json(themeData, { headers: CACHE_HEADERS });
}

function recordLoad(name: string) {
	prisma.theme
		.findUnique({ where: { name }, select: { id: true } })
		.then((theme) => {
			if (!theme) return;
			return prisma.themeLoad.create({ data: { themeId: theme.id } });
		})
		.catch(() => {});
}
