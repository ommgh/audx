---
name: "audx"
displayName: "audx"
description: "Complete guide for using the @litlab/audx CLI to manage UI sound effects — install, add, remove, update, generate, and theme sounds in any web project."
keywords: ["audx", "cli", "ui-sounds", "sound-effects", "audio", "theme"]
author: "audx"
---

# audx CLI Guide

## Overview

The `@litlab/audx` CLI is a command-line tool for managing UI sound effects in web projects. It connects to the audx registry to browse, install, update, and remove audio assets — TypeScript modules with base64-encoded audio data that play via the Web Audio API at runtime with zero external file downloads.

The CLI also supports AI-powered sound generation from text prompts and a theme system that lets you reference sounds by semantic purpose (e.g., `play("success")`) and swap entire sound palettes by switching themes.

## Onboarding

### Prerequisites

- Node.js 18+
- A Node.js project with a `package.json`

### Installation

#### Global install (recommended)

```bash
npm install -g @litlab/audx
```

#### Use without installing

```bash
npx @litlab/audx <command>
```

### Initialize a project

Run this inside your project root:

```bash
audx init
```

This creates `audx.config.json` with auto-detected settings:

```json
{
  "soundDir": "src/sounds",
  "libDir": "src/lib",
  "registryUrl": "https://audx.site",
  "packageManager": "pnpm",
  "aliases": {
    "lib": "@/lib",
    "hooks": "@/hooks",
    "sounds": "@/sounds"
  },
  "installedSounds": {}
}
```

- **Package manager** is auto-detected from lockfiles (bun.lock, pnpm-lock.yaml, yarn.lock, package-lock.json)
- **Path aliases** are auto-detected from your `tsconfig.json` (e.g., `@/*` → `@/lib`, `@/hooks`, `@/sounds`)
- If no tsconfig aliases are found, defaults to relative paths like `src/lib`

### Verification

```bash
audx --version
# Expected: 0.0.2 (or current version)

audx --help
# Shows all available commands
```

## Common Workflows

### Workflow 1: Browse and add sounds

```bash
# List all available sounds in the registry
audx list

# Filter by tag
audx list --tag notification

# Search by name, description, or tags
audx list --search click

# Add one or more sounds
audx add click-001
audx add click-001 scroll-001 back-001
```

Sounds are written as TypeScript modules into your configured `soundDir` (default: `src/sounds`). Shared dependencies like `audio-engine.ts` and `audio-types.ts` are placed in `libDir`.

### Workflow 2: Generate a sound with AI

```bash
# Generate from a text prompt (name auto-derived from prompt)
audx generate "soft notification chime"

# Specify a custom name
audx generate "laser blast" --name laser-zap

# Set duration (0.5–22 seconds)
audx generate "ambient hum" --duration 5
```

The generated sound is saved as a TypeScript module in your `soundDir` and registered in `audx.config.json`.

### Workflow 3: Set up themes

Themes let you map semantic names (like `click`, `success`, `error`) to installed sounds, then swap the entire palette by switching themes.

```bash
# Initialize theme config (creates audx.themes.json)
audx theme init

# Create a named theme
audx theme create minimal

# Map semantic names to installed sounds
audx theme map click click-001
audx theme map success back-001

# Set the active theme
audx theme set minimal

# Generate the sound-theme.ts file for use in code
audx theme generate

# List all themes
audx theme list
```

### Workflow 4: Keep sounds up to date

```bash
# Check which installed sounds have newer versions in the registry
audx diff

# Update all installed sounds
audx update

# Update a specific sound
audx update click-001
```

### Workflow 5: Remove sounds

```bash
# Remove one or more installed sounds
audx remove click-001
audx remove click-001 scroll-001
```

## Command Reference

### `audx init`

Initialize audx in the current project. Creates `audx.config.json`.

- Requires `package.json` in the current directory
- Prompts before overwriting an existing config

### `audx add <sounds...>`

Add one or more sounds from the registry.

| Argument | Description |
|----------|-------------|
| `sounds` | Space-separated sound names to add |

- Fetches each sound from the registry
- Writes files to `soundDir` and `libDir`
- Skips shared dependencies that already exist
- Prompts before overwriting existing sound files
- Updates `installedSounds` in config

### `audx list`

List available sounds in the registry.

| Option | Description | Example |
|--------|-------------|---------|
| `--tag <tag>` | Filter by tag | `audx list --tag notification` |
| `--search <query>` | Search name, description, tags | `audx list --search click` |

### `audx remove <sounds...>`

Remove installed sounds and clean up config.

| Argument | Description |
|----------|-------------|
| `sounds` | Space-separated sound names to remove |

### `audx diff`

Check for updates to installed sounds by comparing local versions with the registry.

### `audx update [sound-name]`

Update installed sounds from the registry.

| Argument | Description |
|----------|-------------|
| `sound-name` | Optional — update only this sound. Omit to update all. |

### `audx generate <prompt>`

Generate a sound from a text prompt using AI.

| Argument/Option | Description |
|-----------------|-------------|
| `prompt` | Text description of the sound (required) |
| `--name <name>` | Custom kebab-case name (auto-derived if omitted) |
| `--duration <seconds>` | Duration between 0.5 and 22 seconds |

### `audx theme init`

Create `audx.themes.json` with a default theme.

### `audx theme create <name>`

Create a new named theme.

### `audx theme set <name>`

Set the active theme.

### `audx theme map <semantic-name> <sound-name>`

Map a semantic name to an installed sound in the active theme.

Valid semantic names include: `click`, `back`, `success`, `error`, `warning`, `notify`, `hover`, `toggle`, `scroll`, `delete`, `copy`, `paste`, `confirm`, `cancel`, and many more (67 total across 10 categories).

### `audx theme list`

List all configured themes.

### `audx theme generate`

Generate `sound-theme.ts` from the current theme configuration for use in your app code.

## Troubleshooting

### Error: "No package.json found"

**Cause:** Running `audx init` outside a Node.js project.
**Solution:** Navigate to your project root (where `package.json` lives) and try again.

### Error: "Configuration not found. Run 'audx init' first."

**Cause:** Running a command before initializing.
**Solution:**
```bash
audx init
```

### Error: "Failed to fetch <sound-name> (404)"

**Cause:** The sound name doesn't exist in the registry.
**Solution:**
1. Check available sounds: `audx list`
2. Verify the exact name (names are kebab-case, e.g., `click-001`)

### Error: "Duration must be a number between 0.5 and 22"

**Cause:** Invalid `--duration` value for `audx generate`.
**Solution:** Use a number between 0.5 and 22: `audx generate "chime" --duration 2`

### Sounds not playing in the browser

**Cause:** Web Audio API requires user interaction before playing audio.
**Solution:** Ensure audio playback is triggered by a user event (click, keypress, etc.), not on page load.

### Path aliases not detected

**Cause:** No `tsconfig.json` or no path aliases configured.
**Solution:** Add path aliases to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
Then re-run `audx init`.

## Best Practices

- Run `audx init` before any other command — all commands require `audx.config.json`
- Use `audx list --search` to discover sounds before adding them
- Use the theme system to decouple sound references from specific files — makes it easy to swap sound palettes
- Run `audx diff` periodically to check for updated sounds in the registry
- Keep generated sounds in version control — they're just TypeScript files with inline data

## Additional Resources

- Website: https://audx.site
- GitHub: https://github.com/ommgh/audx
- npm: https://www.npmjs.com/package/@litlab/

## License and support

This power integrates with [MCP Server Name] (Apache-2.0).
- [Privacy Policy](https://audx.site/privacy)
- [Support](https://audx.site/support)

---

**CLI Tool:** `@litlab/audx`
**Installation:** `npm install -g @litlab/audx`
