---
title: Emit, optionally render, optionally round-trip
order: 5
impact: HIGH
impactDescription: Final step. Defines the output contract returned to the user.
tags: pipeline, emit, render, round-trip
---

## Emit, optionally render, optionally round-trip

### 1. Emit

Always return a file ready to drop into the project's sounds directory (the `dir` in `audx.json`, usually `src/sounds/`). Name the export after the file in camelCase so `npx @litlab/audx add` / `remove` keep it in the generated `index.ts`:

```ts
// src/sounds/my-click.ts
import { defineSound } from "@litlab/audx";

export const myClick = defineSound({
  source: { type: "sine", frequency: 1300, fm: { ratio: 0.5, depth: 60 } },
  envelope: { decay: 0.012, release: 0.004 },
  gain: 0.18,
});
```

Then it's used like any built-in sound: `import { myClick } from "@/sounds"; myClick();`. Files without an `// @audx` header are treated as the user's own, so `audx theme` and `audx update` never overwrite them.

If the user is building a theme instead, emit the bare definition object as a new entry under `sounds` in their theme JSON (`npx @litlab/audx create <name>` scaffolds one).

Plus a one-line rationale that names the prompt tokens you acted on:

> "click" -> base from `event-click`; "warm" -> kept default sine, no extra filter needed at 1.3 kHz.

### 2. Optional preview render

If the user asked for a WAV (or you want to grade your own output), use `renderToWav` from [`package/core/src/offline.ts`](../../../package/core/src/offline.ts). In Node, install `node-web-audio-api` and expose its `OfflineAudioContext` globally first:

```ts
import { OfflineAudioContext } from "node-web-audio-api";
import { renderToWav } from "@litlab/audx";
import { writeFile } from "node:fs/promises";

globalThis.OfflineAudioContext = OfflineAudioContext;

const blob = await renderToWav(myClick.definition, { duration: 0.3 });
await writeFile("preview.wav", Buffer.from(await blob.arrayBuffer()));
```

`duration` should be `attack + decay + release + 0.05` (small tail) or longer if reverb is present.

### 3. Optional round-trip validation

If you generated from a prompt and want to confirm the result matches intent, run the `interpret-*` rules against the rendered WAV and diff measured vs intended values:

| Field             | Acceptable drift                            |
| ----------------- | ------------------------------------------- |
| Fundamental Hz    | ±5%                                         |
| Attack            | ±2 ms                                       |
| Decay             | ±10%                                        |
| Spectral centroid | ±20% of expected for the chosen waveform    |

If drift exceeds tolerance, refine the definition (often by raising/lowering `gain`, tightening `envelope`, or adjusting `filter.frequency`) and render again.
