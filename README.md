## <img src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1777189809/audx-banner-final_rl6wci.png">


Open-source library of customizable UI sound effects for modern web apps. Browse, preview, and install audio assets — clicks, scrolls, notifications, and more — with a single command.

---

[![skills.sh](https://skills.sh/b/ommgh/audx)](https://skills.sh/ommgh/audx)
[![npm](https://img.shields.io/npm/v/%40litlab%2Faudx)](https://www.npmjs.com/package/@litlab/audx)
[![license](https://img.shields.io/github/license/ommgh/audx)](LICENSE)
[![CI](https://github.com/ommgh/audx/actions/workflows/publish.yml/badge.svg)](https://github.com/ommgh/audx/actions/workflows/publish.yml)
[![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Faudx.site)](https://audx.site)

---

## Quick Start

```bash
npx @litlab/audx init                 # pick a theme and a starter set of sounds
npx @litlab/audx add click success    # add more any time
npx @litlab/audx theme playful        # re-skin every installed sound
```

```ts
import { click, success } from "@/sounds";

click();
```

Sounds are generated into `src/sounds/` as plain TypeScript you own. See the [package README](./package/core/README.md) for the full CLI and API, and hear every sound in real components at [audx.site/showcase](https://audx.site/showcase).

## Development

```bash
bun install
bun run dev           # Start dev server (Turbopack)
bun run build         # Build the package, then the site
bun run lint          # Biome check (lint + format)
```

### Package & CLI

```bash
cd package/core
bun run build         # bunchee
bun run test          # vitest
```

### Designing sounds

The built-in themes live in `scripts/sounds/themes/*.ts`, written with a small DSL (`scripts/sounds/dsl.ts`). Every theme must implement the full catalog in `package/core/src/catalog.ts`.

```bash
bun run sounds:build  # validates themes, normalizes loudness, writes .themes/*.json
```

The build renders each sound offline and rescales it so sounds with the same role sit at the same loudness across themes, so you only need to think about balance between layers, not absolute volume.

## Requirements

- Node.js 20+
- Bun (for website development)

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
