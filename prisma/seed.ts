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
];

async function main() {
  for (const { file, url } of themeFiles) {
    const raw = readFileSync(join(__dirname, file), "utf-8");
    const theme = JSON.parse(raw) as ThemeJson;
    const sourceTypes = deriveSourceTypes(theme.sounds);

    const record = await prisma.theme.upsert({
      where: { name: theme.name },
      update: {
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
      },
      create: {
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
      },
    });

    console.log(`Upserted theme: ${record.name} (id=${record.id})`);

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
