# Design Document: Semantic Theme Distribution

## Overview

This feature refactors the audx sound distribution system from a flat naming scheme (`click-minimal-001`) to a semantic, theme-driven architecture where sounds are identified by purpose (`click`) and organized by theme (`minimal`, `playful`). The change spans four layers:

1. **Registry source** — Restructure `registry/audx/audio/` from flat directories to `{theme}/{semantic-name}/` subdirectories
2. **Build pipeline** — Update `registry.json` manifest and `build-registry-items.ts` to produce `public/r/audio/{theme}/{semantic-name}.json`
3. **CLI package** — Rewrite commands (`init`, `add`, `remove`, `update`, `diff`, `list`, `generate`, `theme set`) to be theme-aware, add `install pack`, remove deprecated theme-mapping workflow
4. **Website** — Adapt catalog data layer and UI to display sounds grouped by theme with semantic names

The core design principle is: the `theme` field in `audx.config.json` drives all sound resolution. Users never type theme-qualified names — `audx add click` reads the config theme and fetches `audio/minimal/click` automatically.

## Architecture

```mermaid
graph TD
    subgraph "Registry Source (build-time)"
        RS[registry/audx/audio/{theme}/{semantic-name}/{semantic-name}.ts]
        RM[registry.json manifest]
        BS[build-registry-items.ts]
        RS --> BS
        RM --> BS
        BS --> PUB[public/r/audio/{theme}/{semantic-name}.json]
    end

    subgraph "CLI (user machine)"
        CFG[audx.config.json<br/>theme: 'minimal']
        INIT[audx init] --> CFG
        ADD[audx add click] -->|reads theme| CFG
        ADD -->|GET /r/audio/minimal/click.json| PUB
        ADD -->|writes| SD[assets/audio/click.ts]
        TS[audx theme set playful] -->|updates theme + re-fetches| CFG
        IP[audx install pack] -->|bulk fetch all 67| PUB
        UPD[audx update] -->|fetch + overwrite| PUB
        DIFF[audx diff] -->|compare| PUB
        LIST[audx list] -->|fetch catalog| PUB
        REM[audx remove click] -->|delete| SD
        GEN[audx generate] -->|write| SD
    end

    subgraph "Website (audx.site)"
        WEB[Next.js App]
        WEB -->|reads| RM
        WEB -->|groups by theme| UI[Browse Page]
    end
```

### Key Design Decisions

1. **Theme in config, not in filenames** — The user's `soundDir` contains flat files like `click.ts`, `success.ts`. The theme is stored only in `audx.config.json`. This means theme switching overwrites files in-place rather than creating parallel directories.

2. **Registry URL scheme** — `{registryUrl}/r/audio/{theme}/{semantic-name}.json`. The `audio/` prefix namespaces sound items from other registry types (hooks, libs, UI components).

3. **Simplified config** — `installedSounds` becomes a flat `string[]` of semantic names instead of a `Record<string, { files, installedAt }>`. The `theme` field is added. `soundDir` defaults to `assets/audio` instead of `src/sounds`.

4. **Remove entire theme-mapping workflow** — `audx.themes.json`, `ThemeManager`, `ThemeCodegen`, and all `theme` subcommands except `set` are removed. The new system makes manual mapping unnecessary.

5. **Bulk install** — `audx install <theme> pack` iterates `SEMANTIC_SOUND_NAMES` (67 entries) and fetches each from the registry. This is a new command, not a modification of `add`.

## Components and Interfaces

### CLI Components

#### 1. Config Module (`package/src/core/config.ts`)

Updated to handle the new schema with `theme` field and simplified `installedSounds`.

```typescript
// New config shape
interface AudxConfig {
  $schema?: string;
  soundDir: string;       // default: "assets/audio"
  libDir: string;
  registryUrl: string;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  theme: string;          // NEW: e.g. "minimal"
  aliases: { lib: string; hooks: string; sounds: string };
  installedSounds: string[];  // CHANGED: flat list of semantic names
}
```

#### 2. Registry Module (`package/src/core/registry.ts`)

Updated `fetchItem` to accept theme-qualified paths:

```typescript
// New: theme-aware fetch
function buildItemUrl(registryUrl: string, theme: string, semanticName: string): string {
  return `${registryUrl}/r/audio/${theme}/${semanticName}.json`;
}

async function fetchThemedItem(registryUrl: string, theme: string, name: string): Promise<RegistryItem>
```

#### 3. File Writer (`package/src/core/file-writer.ts`)

Simplified — sounds always write to `{soundDir}/{semantic-name}.ts`. No more complex path resolution for sound files. Dependency files (hooks, libs) still use existing logic.

#### 4. Commands

| Command | Changes |
|---------|---------|
| `init` | Prompts for theme selection, sets `soundDir: "assets/audio"`, writes `theme` field |
| `add <name>` | Reads `config.theme`, fetches `audio/{theme}/{name}.json`, writes to `{soundDir}/{name}.ts` |
| `theme set <name>` | Updates `config.theme`, re-fetches all `installedSounds` from new theme |
| `install <theme> pack` | NEW — bulk installs all 67 semantic sounds for a theme |
| `remove <name>` | Deletes `{soundDir}/{name}.ts`, removes from `installedSounds[]` |
| `update [name]` | Fetches from `audio/{theme}/{name}.json`, overwrites local file |
| `diff` | Compares each installed sound against `audio/{theme}/{name}.json` |
| `list` | Fetches catalog, filters by current theme (or `--theme` flag) |
| `generate` | Writes to `{soundDir}/{name}.ts`, adds to `installedSounds[]` |

#### 5. Removed Modules

- `package/src/core/theme-manager.ts` — deleted entirely
- `package/src/codegen/theme-codegen.ts` — deleted entirely
- `package/src/commands/theme.ts` — rewritten to only contain `themeSetCommand`
- Theme subcommands: `init`, `map`, `create`, `list`, `generate` — all removed

### Registry / Build Components

#### 6. Registry Manifest (`registry.json`)

Items use the new name format `audio/{theme}/{semantic-name}`:

```json
{
  "name": "audio/minimal/click",
  "type": "registry:block",
  "title": "Click (Minimal)",
  "files": [
    { "path": "registry/audx/audio/minimal/click/click.ts", "type": "registry:lib" },
    { "path": "registry/audx/lib/audio-types.ts", "type": "registry:lib" },
    { "path": "registry/audx/lib/audio-engine.ts", "type": "registry:lib" }
  ],
  "meta": {
    "theme": "minimal",
    "semanticName": "click",
    ...
  }
}
```

#### 7. Build Script (`scripts/build-registry-items.ts`)

Updated to output files at `public/r/audio/{theme}/{semantic-name}.json` instead of `public/r/{name}.json`. The output path is derived from the item name by replacing the `audio/` prefix.

### Website Components

#### 8. Audio Data Layer (`lib/audio-data.ts`)

Updated `buildCatalog()` to parse the new `audio/{theme}/{semantic-name}` name format and expose `theme` and `semanticName` as first-class fields on `AudioCatalogItem`.

#### 9. Browse Page / Audio Grid

Groups sounds by theme. The `AudioCatalogItem.name` field now contains the full path (`audio/minimal/click`), while display uses `semanticName`.

#### 10. Audio Detail Page

Install command shows `npx audx add <semantic-name>`. Import pattern shows `import { <camelCase>Audio } from "@/assets/audio/<semantic-name>"`.

## Data Models

### AudxConfig (new schema)

```typescript
const audxConfigSchema = z.object({
  $schema: z.string().optional(),
  soundDir: z.string(),                    // default: "assets/audio"
  libDir: z.string(),
  registryUrl: z.string().url(),
  packageManager: z.enum(["npm", "pnpm", "yarn", "bun"]),
  theme: z.string().min(1),                // NEW required field
  aliases: z.object({
    lib: z.string(),
    hooks: z.string(),
    sounds: z.string(),
  }),
  installedSounds: z.array(z.string()),    // CHANGED: flat string array
});
```

### RegistryItem (unchanged interface, new naming convention)

```typescript
interface RegistryItem {
  $schema: string;
  name: string;           // "audio/minimal/click"
  type: string;           // "registry:block"
  title: string;
  author?: string;
  description: string;
  files: RegistryFile[];
  meta?: {
    duration: number;
    format: string;
    sizeKb: number;
    license: string;
    tags: string[];
    theme: string;          // always present for themed items
    semanticName: string;   // always present for themed items
  };
}
```

### AudioCatalogItem (website, updated)

```typescript
interface AudioCatalogItem {
  name: string;           // "audio/minimal/click"
  title: string;
  description: string;
  author: string;
  meta: {
    duration: number;
    sizeKb: number;
    license: string;
    tags: string[];
    keywords: string[];
    theme: string;          // required now
    semanticName: string;   // required now
  };
}
```

### Registry Source Directory Layout

```
registry/audx/audio/
├── minimal/
│   ├── click/
│   │   └── click.ts
│   ├── success/
│   │   └── success.ts
│   └── ... (67 sounds)
├── playful/
│   ├── click/
│   │   └── click.ts
│   └── ... (67 sounds)
└── (future themes)
```

### Registry URL Layout

```
public/r/
├── audio/
│   ├── minimal/
│   │   ├── click.json
│   │   ├── success.json
│   │   └── ...
│   └── playful/
│       ├── click.json
│       └── ...
└── registry.json
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Config schema round-trip

*For any* valid `AudxConfig` object with a non-empty `theme` string and a flat `installedSounds` string array, serializing to JSON and deserializing back through the Zod schema should produce an equivalent config object. Additionally, *for any* empty string as the `theme` value, validation should reject the config.

**Validates: Requirements 3.1, 3.3, 3.5**

### Property 2: Registry item name round-trip (build then parse)

*For any* valid theme name and semantic sound name, building the registry item name as `audio/{theme}/{semantic-name}` and then parsing it back should recover the original theme and semantic name components.

**Validates: Requirements 2.1, 12.5**

### Property 3: Theme-aware registry URL construction

*For any* valid registry URL, theme name, and semantic sound name, the constructed fetch URL should equal `{registryUrl}/r/audio/{theme}/{semantic-name}.json`.

**Validates: Requirements 5.1, 5.2, 9.1, 9.2**

### Property 4: Sound file path construction

*For any* valid `soundDir` path and semantic sound name, the resolved install path should equal `{soundDir}/{semantic-name}.ts`.

**Validates: Requirements 5.3, 7.2, 11.1, 13.1**

### Property 5: Registry build output path derivation

*For any* registry item with name `audio/{theme}/{semantic-name}`, the build script output path should equal `public/r/audio/{theme}/{semantic-name}.json`.

**Validates: Requirements 2.3**

### Property 6: Registry item metadata completeness

*For any* registry item built from a themed source directory, the generated metadata object should contain both a `theme` field matching the source theme and a `semanticName` field matching the source semantic name.

**Validates: Requirements 2.4**

### Property 7: Catalog theme filtering

*For any* catalog of audio items with mixed themes and a filter theme string, filtering the catalog should return only items whose `meta.theme` matches the filter, and the result should be a subset of the original catalog.

**Validates: Requirements 10.1, 10.2**

### Property 8: InstalledSounds list management

*For any* list of installed sound names and a new semantic name not already in the list, adding the name should increase the list length by one and the name should be present. Subsequently removing that name should restore the original list.

**Validates: Requirements 5.4, 7.5, 11.2, 13.3**

### Property 9: Theme persistence (set then read)

*For any* valid config and a new non-empty theme name, writing the theme to the config and reading it back should return the new theme name.

**Validates: Requirements 4.2, 6.1, 7.4**

### Property 10: Install command string format

*For any* valid semantic sound name, the generated install command should equal `npx audx add {semantic-name}`.

**Validates: Requirements 12.3**

### Property 11: Import pattern string format

*For any* valid semantic sound name, the generated import statement should correctly convert the kebab-case name to camelCase with an `Audio` suffix and reference the path `@/assets/audio/{semantic-name}`.

**Validates: Requirements 12.4**

### Property 12: Theme set re-fetches all installed sounds

*For any* non-empty list of installed semantic sound names and a new theme name, the theme set operation should construct fetch URLs for every installed sound using the new theme, with no sounds skipped.

**Validates: Requirements 6.2**

## Error Handling

### CLI Error Scenarios

| Scenario | Behavior |
|----------|----------|
| No `audx.config.json` | Exit with error: "Configuration not found. Run 'audx init' first." |
| Missing `theme` field in config | Zod validation error instructing user to run `audx init` |
| `audx add` — HTTP error from registry | Display error with sound name and HTTP status, exit code 2 |
| `audx theme set` — HTTP error for one sound | Log warning for that sound, continue with remaining sounds |
| `audx install pack` — HTTP error for one sound | Log warning for that sound, continue installing remaining sounds |
| `audx update` / `audx diff` — HTTP error for one sound | Log warning, continue processing remaining sounds |
| `audx remove` — sound not installed | Display error listing currently installed sounds |
| `audx remove` — file missing on disk | Remove from config anyway, display success |
| `audx init` — no `package.json` | Exit with error: "No package.json found." |
| `audx init` — config already exists | Prompt for confirmation before overwriting |
| Network unreachable | "Could not reach the audx registry. Check your network connection." |

### Error Design Principles

1. **Partial failure resilience** — Bulk operations (`theme set`, `install pack`, `update`, `diff`) continue on individual item failures, logging warnings. Only single-item commands (`add`) exit on failure.
2. **Config-first validation** — All commands except `init` check for config existence before proceeding.
3. **Consistent exit codes** — 0 for success, 1 for config/validation errors, 2 for network/registry errors.

## Testing Strategy

### Property-Based Tests (fast-check)

Property-based testing is well-suited for this feature because the core logic involves pure functions for path construction, URL building, name parsing, config validation, and list management — all of which have clear input/output behavior across a wide input space.

- **Library**: fast-check (already in devDependencies)
- **Minimum iterations**: 100 per property
- **Location**: `package/tests/properties/`
- **Tag format**: `Feature: semantic-theme-distribution, Property {N}: {title}`

Each of the 12 correctness properties above maps to a single property-based test. The generators will produce:
- Random theme names (non-empty alphanumeric strings)
- Random semantic sound names (drawn from `SEMANTIC_SOUND_NAMES` or arbitrary kebab-case strings)
- Random registry URLs (valid URL strings)
- Random `soundDir` paths
- Random `AudxConfig` objects

### Unit Tests (Vitest)

- **Location**: `package/tests/unit/`
- **Focus**: Specific examples, edge cases, error conditions, command behavior with mocked I/O
- Key areas:
  - Init command: theme prompt, default values, overwrite confirmation
  - Add command: successful add, HTTP error handling, missing config
  - Theme set: config update, re-fetch behavior, partial failure
  - Install pack: bulk install, summary output, partial failure
  - Remove: file deletion, config update, not-installed error, missing file edge case
  - Update/diff: theme-aware URL usage, change detection
  - List: theme filtering, empty results
  - Generate: path construction, config update
  - Build script: output path, metadata inclusion, missing file handling

### Integration Tests

- **Location**: `package/tests/integration/`
- **Focus**: End-to-end command flows with filesystem and mocked HTTP
- Key scenarios:
  - Full init → add → remove cycle
  - Theme switch with installed sounds
  - Bulk install pack
  - Build script producing correct output files

### Website Tests

- Catalog data builder correctly parses new name format
- Theme grouping logic
- Install command and import pattern generation
