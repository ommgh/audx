---
title: Metallic - inharmonic FM ratio
impact: MEDIUM
impactDescription: Use the badge-style 2.76 inharmonic ratio for clangorous metallic timbres.
tags: mood, metallic, fm
prompt: "metallic badge"
example: |
  {
    "source": { "type": "sine", "frequency": 1100, "fm": { "ratio": 2.76, "depth": 350 } },
    "envelope": { "attack": 0, "decay": 0.35, "sustain": 0.04, "release": 0.15 },
    "gain": 0.16
  }
---

## Metallic - inharmonic FM ratio

Mutation:

- `source.type: "sine"` (or `square` for a harsher result).
- `source.fm: { ratio: 2.76, depth: 300-400 }` - 2.76 is inharmonic and reads as bell-metal (the mechanical theme's `notify` uses a similar inharmonic 3.7).
- Short release; metallic shouldn't sustain.

Avoid stacking with `mood-warm` - they cancel each other out.

Reference: [scripts/sounds/themes/mechanical.ts](../../../scripts/sounds/themes/mechanical.ts) `info`, `notify`.
