# Project Structure

```
audx/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/generate-sound/ # POST endpoint for AI sound generation (ElevenLabs)
│   ├── audio/[name]/       # Dynamic audio detail page
│   ├── generate/           # AI sound generation page
│   ├── layout.tsx          # Root layout (theme, fonts, header)
│   ├── page.tsx            # Home — audio catalog browse page
│   └── globals.css         # Tailwind v4 config, CSS variables, theme tokens
│
├── components/             # React components (website-specific)
│   ├── ui/                 # shadcn/ui primitives (tabs, etc.)
│   ├── audio-*.tsx         # Audio browsing, playback, detail components
│   ├── generate-sound.tsx  # AI generation form
│   └── hero.tsx            # Landing page hero
│
├── hooks/                  # Custom React hooks (website-specific)
│   ├── use-sound*.ts       # Sound playback, download, generation hooks
│   └── use-global-filters.ts
│
├── lib/                    # Shared utilities and domain logic (website)
│   ├── audio-types.ts      # AudioAsset, UseAudioOptions types
│   ├── audio-catalog.ts    # AudioCatalogItem type, formatters
│   ├── audio-data.ts       # Catalog builder from registry.json
│   ├── audio-filters.ts    # Search/filter logic
│   ├── audio-engine.ts     # Web Audio API engine (site version)
│   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── constants.ts        # Site-wide constants, URLs
│
├── registry/audx/          # Distributable registry source files
│   ├── audio/              # Sound assets (each in own folder, TS with base64 data URI)
│   ├── hooks/use-audio.ts  # Distributable useAudio hook
│   ├── lib/                # Distributable audio-engine.ts, audio-types.ts
│   └── ui/                 # Distributable UI components (button, card, input, etc.)
│
├── public/r/               # Built registry JSON files (generated, do not edit)
│
├── scripts/                # Build/maintenance scripts (run with bun)
│   ├── build-registry-items.ts  # Builds public/r/*.json from registry.json
│   ├── encode-all.ts            # Base64-encode audio files
│   └── enrich-registry.ts       # Enrich registry metadata
│
├── package/                # CLI tool (@litlab/audx) — independent sub-project
│   ├── src/
│   │   ├── commands/       # CLI commands (add, init, list, remove, diff, update, generate, theme)
│   │   ├── core/           # Config, registry client, file writer, alias resolver
│   │   ├── codegen/        # Theme code generation
│   │   ├── index.ts        # CLI entry point (Commander.js)
│   │   └── types.ts        # Shared types and Zod schemas
│   └── tests/              # Unit, integration, and property-based tests
│
├── registry.json           # Master registry manifest (source of truth for all audio items)
├── components.json         # shadcn/ui configuration
├── biome.json              # Linter/formatter config
└── package.json            # Website dependencies and scripts
```

## Key Conventions

- **Path aliases**: `@/*` maps to project root (e.g., `@/components/...`, `@/lib/...`)
- **Registry items**: Each audio asset lives in `registry/audx/audio/{name}/{name}.ts` and exports an `AudioAsset` with an inline base64 data URI
- **registry.json** is the source of truth — `public/r/` files are generated from it via `bun run registry:build`
- **Website vs distributable**: `lib/` and `hooks/` are website-internal; `registry/audx/` contains the code users actually install
- **CLI is independent**: `package/` has its own `package.json`, `tsconfig.json`, and test setup — treat it as a separate project
- **Components use `"use client"`** directive when they need browser APIs or interactivity
- **Server components** are the default in `app/` pages; data fetching uses React `cache()` for deduplication
