# audx

CLI tool for distributing and managing UI sounds from the [audx](https://audx.dev) registry.

## Install

```bash
npm install -g @litlab/audx
```

Or use directly with `npx`:

```bash
npx @litlab/audx <command>
```

## Quick Start

```bash
# Initialize audx in your project
audx init

# Browse available sounds
audx list

# Add a sound
audx add click-001

# Set up themes
audx theme init
audx theme map click click-001
audx theme generate
```

## Commands

| Command | Description |
|---|---|
| `audx init` | Initialize audx config in your project |
| `audx add <sounds...>` | Add sounds from the registry |
| `audx remove <sounds...>` | Remove installed sounds |
| `audx list` | List available sounds (`--tag`, `--search`) |
| `audx diff` | Check for updates to installed sounds |
| `audx update [sound]` | Update installed sounds from registry |
| `audx generate "<prompt>"` | Generate a sound from a text prompt (`--name`, `--duration`) |
| `audx theme init` | Create theme configuration |
| `audx theme set <name>` | Switch active theme |
| `audx theme map <semantic> <sound>` | Map a semantic name to a sound |
| `audx theme create <name>` | Create a new theme |
| `audx theme list` | List all themes |
| `audx theme generate` | Generate `sound-theme.ts` |

## How It Works

audx manages UI sounds as TypeScript modules with base64-encoded audio data — no external files to serve. Sounds are fetched from the audx registry and written directly into your project.

The theme system lets you reference sounds by semantic purpose (`play("success")`) instead of file names, and swap entire sound palettes by switching themes.

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

## Requirements

- Node.js 18+

## License

MIT
