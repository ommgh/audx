import type { AudioAsset } from "@/lib/audio-types";

export async function loadAudioAsset(name: string): Promise<AudioAsset> {
  const mod: Record<string, unknown> = await import(
    `@/registry/audx/sounds/${name}/${name}`
  );

  // Find the AudioAsset export by scanning for an object with `dataUri`
  for (const key of Object.keys(mod)) {
    const val = mod[key];
    if (val && typeof val === "object" && "dataUri" in val && "name" in val) {
      return val as AudioAsset;
    }
  }

  throw new Error(`No AudioAsset export found in module "${name}"`);
}
