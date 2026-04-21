# Tech Stack & Build

## Website (root)

- **Framework**: Next.js 15 (App Router, React 19, RSC enabled, Turbopack dev)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables for theming, `tw-animate-css`
- **UI Components**: shadcn/ui (base-lyra style), Radix UI, Base UI, Vaul (drawers)
- **Icons**: Remix Icon (`@remixicon/react`)
- **Fonts**: DM Sans (body), Space Grotesk (headings), Geist Mono (code)
- **State/URL**: `nuqs` for URL query state
- **Theming**: `next-themes` (system/light/dark)
- **Validation**: Zod
- **AI**: Vercel AI SDK + AI Gateway (for sound generation)
- **Analytics**: Vercel Analytics
- **Linter/Formatter**: Biome 2.4
- **Runtime**: Bun (for scripts), Node.js (for Next.js)

## CLI Package (`package/`)

- **Language**: TypeScript (ES2022, Node16 modules)
- **CLI Framework**: Commander.js
- **Validation**: Zod
- **Testing**: Vitest + fast-check (property-based testing)
- **Build**: `tsc` (outputs to `dist/`)
- **Published as**: `@litlab/audx` on npm

## Common Commands

### Website
```bash
bun run dev              # Start dev server (Turbopack)
bun run build            # Production build
bun run lint             # Biome check (lint + format)
bun run registry:build   # Build public/r/*.json from registry.json
bun run audio:encode     # Base64-encode all audio files
bun run audio:encode-one # Encode a single audio file
```

### CLI Package
```bash
cd package
npm run build            # Compile TypeScript
npm run test             # Run tests once (vitest --run)
npm run test:watch       # Run tests in watch mode
```

## Code Style (Biome)

- Indent: tabs
- Quotes: double quotes
- Imports: auto-organized
- Rules: recommended set enabled
