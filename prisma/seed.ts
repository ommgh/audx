import "dotenv/config";
import prisma from "../lib/db";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES } from "../lib/audio-taxonomy";

type ThemeJson = {
  name: string;
  author?: string;
  description?: string;
  version?: string;
  license?: string;
  compatibility?: string;
  sounds: Record<string, unknown>;
};

function deriveSourceTypes(sounds: Record<string, unknown>): string[] {
  const types = new Set<string>();
  function walk(v: unknown) {
    if (typeof v !== "object" || v === null) return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    const obj = v as Record<string, unknown>;
    if (typeof obj.type === "string") types.add(obj.type);
    if (Array.isArray(obj.layers)) obj.layers.forEach(walk);
  }
  Object.values(sounds).forEach(walk);
  return Array.from(types).sort();
}

const themeFiles = [
  { file: "../.themes/minimal.json", url: "https://audx.site/library/minimal" },
  { file: "../.themes/playful.json", url: "https://audx.site/library/playful" },
  {
    file: "../.themes/mechanical.json",
    url: "https://audx.site/library/mechanical",
  },
  { file: "../.themes/retro.json", url: "https://audx.site/library/retro" },
];

async function main() {
  for (const { file, url } of themeFiles) {
    const raw = readFileSync(join(__dirname, file), "utf-8");
    const theme = JSON.parse(raw) as ThemeJson;
    const sourceTypes = deriveSourceTypes(theme.sounds);

    const data = {
      name: theme.name,
      author: theme.author ?? "Unknown",
      description: theme.description ?? "",
      soundCount: Object.keys(theme.sounds).length,
      version: theme.version,
      license: theme.license,
      compatibility: theme.compatibility,
      themeJson: theme as object,
      sourceTypes,
      fileSize: Buffer.byteLength(raw, "utf8"),
      url,
      verified: true,
    };

    // Match case-insensitively so an existing "Minimal" row is updated in
    // place (keeping its id and load history) instead of duplicated.
    const existing = await prisma.theme.findFirst({
      where: { name: { equals: theme.name, mode: "insensitive" } },
      select: { id: true },
    });

    const record = existing
      ? await prisma.theme.update({ where: { id: existing.id }, data })
      : await prisma.theme.create({ data });

    console.log(`Upserted theme: ${record.name} (id=${record.id})`);

    await prisma.themeSound.deleteMany({
      where: {
        themeId: record.id,
        name: {
          notIn: Object.keys(theme.sounds),
        },
      },
    });

    // Upsert each sound
    for (const [soundName] of Object.entries(theme.sounds)) {
      await prisma.themeSound.upsert({
        where: { themeId_name: { themeId: record.id, name: soundName } },
        update: { category: CATEGORIES[soundName] ?? "general" },
        create: {
          themeId: record.id,
          name: soundName,
          category: CATEGORIES[soundName] ?? "general",
        },
      });
    }

    console.log(`  → ${Object.keys(theme.sounds).length} sounds seeded`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
