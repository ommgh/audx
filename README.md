# audx

Open-source library of customizable UI sound effects for modern web apps. Browse, preview, and install audio assets — clicks, scrolls, notifications, and more — with a single command.

Sounds are distributed as TypeScript modules with inline base64-encoded audio, played via the Web Audio API at runtime. No external files to serve, no network requests at play time.

🌐 [audx.dev](https://audx.dev) · 📦 [npm](https://www.npmjs.com/package/@litlab/audx) · 🐛 [Issues](https://github.com/ommgh/audx/issues)

## Quick Start

```bash
# Install the CLI
npm install -g @litlab/audx

# Initialize in your project
npx @litlab/audx init

# Browse available sounds
npx @litlab/audx list

# Add a sound
npx @litlab/audx add click-001
```

## Usage

### React Hook

```tsx
import { useAudio } from "@/hooks/use-audio";
import { click001 } from "@/sounds/click-001";

function Button() {
  const [play] = useAudio(click001, { volume: 0.5 });

  return <button onClick={() => play()}>Click me</button>;
}
```

### Framework-Agnostic Engine

```ts
import { createAudioEngine } from "@/lib/audio-engine";
import { click001 } from "@/sounds/click-001";

const engine = createAudioEngine();
engine.play(click001.dataUri);
```

## Available Sounds

Sounds are organized by category and theme. Some examples:

| Category | Sounds |
|---|---|
| Interaction | click, tap, press, release, hover, toggle, drag, drop |
| Navigation | back, forward, enter, open, close, expand, collapse, tab, scroll, swipe |
| Feedback | success, error, warning, info, complete, loading, notify |
| Clipboard | copy, paste |
| Selection | select, deselect, focus, blur |

Each sound comes in themed variants (e.g. `click-minimal-001`). Browse the full catalog at [audx.dev](https://audx.dev).

## CLI Commands

| Command | Description |
|---|---|
| `audx init` | Initialize audx config in your project |
| `audx add <sounds...>` | Add sounds from the registry |
| `audx remove <sounds...>` | Remove installed sounds |
| `audx list` | List available sounds (`--tag`, `--search`) |
| `audx diff` | Check for updates to installed sounds |
| `audx update [sound]` | Update installed sounds from registry |
| `audx generate "<prompt>"` | AI-generate a sound from a text prompt |
| `audx theme init` | Create theme configuration |
| `audx theme set <name>` | Switch active theme |
| `audx theme map <semantic> <sound>` | Map a semantic name to a sound |
| `audx theme create <name>` | Create a new theme |
| `audx theme list` | List all themes |
| `audx theme generate` | Generate `sound-theme.ts` |

## Themes

The theme system lets you reference sounds by semantic purpose instead of file names:

```ts
play("success"); // plays whatever sound is mapped to "success"
```

Swap entire sound palettes by switching themes — no code changes needed.

```bash
audx theme init
audx theme map click click-minimal-001
audx theme map success success-minimal-001
audx theme generate
```

## Configuration

Running `audx init` creates `audx.config.json`:

```json
{
  "soundDir": "src/sounds",
  "libDir": "src/lib",
  "registryUrl": "https://audx.dev",
  "packageManager": "pnpm",
  "aliases": {
    "lib": "@/lib",
    "hooks": "@/hooks",
    "sounds": "@/sounds"
  },
  "installedSounds": {}
}
```

Path aliases are auto-detected from your `tsconfig.json`.

## How It Works

Each audio asset is a TypeScript module exporting an `AudioAsset` object with a base64-encoded data URI. At runtime, the Web Audio API decodes and plays the audio directly from memory — zero network overhead, instant playback.

The registry follows the [shadcn/ui](https://ui.shadcn.com) distribution model: you own the code. Sounds are copied into your project, not hidden behind a package.

## Project Structure

```
audx/
├── app/              # Next.js website (audx.dev)
├── components/       # Website React components
├── hooks/            # Website React hooks
├── lib/              # Website utilities
├── registry/audx/    # Distributable registry source files
│   ├── audio/        # Sound assets (TypeScript + base64)
│   ├── hooks/        # useAudio hook
│   └── lib/          # Audio engine, types
├── package/          # CLI tool (@litlab/audx)
└── registry.json     # Master registry manifest
```

## Development

### Website

```bash
bun install
bun run dev           # Start dev server (Turbopack)
bun run build         # Production build
bun run lint          # Biome check (lint + format)
```

### CLI

```bash
cd package
npm install
npm run build         # Compile TypeScript
npm run test          # Run tests (vitest)
```

## Requirements

- Node.js 18+
- Bun (for website development)

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
