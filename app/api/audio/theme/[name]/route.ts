import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

const SLUG_RE = /^[a-z0-9-]+$/;
const THEMES_DIR = resolve(process.cwd(), "../../.themes");
const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  if (SLUG_RE.test(name)) {
    const localPath = resolve(THEMES_DIR, `${name}.json`);
    if (existsSync(localPath)) {
      const data = JSON.parse(await readFile(localPath, "utf-8"));
      recordLoad(name);
      return NextResponse.json(data, { headers: CACHE_HEADERS });
    }
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
