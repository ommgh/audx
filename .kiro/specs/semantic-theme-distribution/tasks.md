# Implementation Plan: Semantic Theme Distribution

## Overview

Refactor the audx sound distribution system from flat naming (`click-minimal-001`) to a semantic, theme-driven architecture (`click` resolved via config theme). Changes span four layers: registry source restructure, build pipeline update, CLI command rewrites, and website catalog adaptation. Implementation proceeds bottom-up: types/helpers → core modules → commands → registry/build → website → cleanup.

## Tasks

- [x] 1. Update config schema, types, and core helper functions
  - [x] 1.1 Update `audxConfigSchema` in `package/src/types.ts` to add `theme: z.string().min(1)`, change `installedSounds` to `z.array(z.string())`, remove `ThemeConfig`, `themeConfigSchema`, and related types
    - Add `theme` field as required non-empty string
    - Change `installedSounds` from `z.record(...)` to `z.array(z.string())`
    - Remove `ThemeConfig`, `themeConfigSchema` types and exports
    - _Requirements: 3.1, 3.3, 3.5, 14.1_

  - [x] 1.2 Create naming and path helper module `package/src/core/naming.ts`
    - `buildItemName(theme, semanticName)` → `audio/{theme}/{semantic-name}`
    - `parseItemName(name)` → `{ theme, semanticName }` or throws
    - `buildItemUrl(registryUrl, theme, semanticName)` → `{registryUrl}/r/audio/{theme}/{semanticName}.json`
    - `buildSoundFilePath(soundDir, semanticName)` → `{soundDir}/{semanticName}.ts`
    - `buildOutputPath(itemName)` → `public/r/{itemName}.json`
    - `buildInstallCommand(semanticName)` → `npx audx add {semanticName}`
    - `buildImportPattern(semanticName)` → `import { <camelCase>Audio } from "@/assets/audio/<semantic-name>"`
    - _Requirements: 2.1, 2.3, 5.2, 5.3, 12.3, 12.4_

  - [ ]* 1.3 Write property test: Config schema round-trip (Property 1)
    - **Property 1: Config schema round-trip**
    - Generate random valid `AudxConfig` objects with non-empty `theme` and flat `installedSounds` string array; serialize to JSON and deserialize through Zod schema; assert equivalence. Also assert empty `theme` string is rejected.
    - File: `package/tests/properties/config-schema.test.ts`
    - **Validates: Requirements 3.1, 3.3, 3.5**

  - [ ]* 1.4 Write property test: Registry item name round-trip (Property 2)
    - **Property 2: Round trip consistency**
    - For any valid theme and semantic name, `parseItemName(buildItemName(theme, name))` recovers original components.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 2.1, 12.5**

  - [ ]* 1.5 Write property test: Theme-aware registry URL construction (Property 3)
    - **Property 3: Theme-aware registry URL construction**
    - For any valid registryUrl, theme, and semanticName, `buildItemUrl` returns `{registryUrl}/r/audio/{theme}/{semanticName}.json`.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 5.1, 5.2, 9.1, 9.2**

  - [ ]* 1.6 Write property test: Sound file path construction (Property 4)
    - **Property 4: Sound file path construction**
    - For any valid soundDir and semanticName, `buildSoundFilePath` returns `{soundDir}/{semanticName}.ts`.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 5.3, 7.2, 11.1, 13.1**

  - [ ]* 1.7 Write property test: Registry build output path derivation (Property 5)
    - **Property 5: Registry build output path derivation**
    - For any item named `audio/{theme}/{semanticName}`, `buildOutputPath` returns `public/r/audio/{theme}/{semanticName}.json`.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 2.3**

- [x] 2. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Update registry module and file writer
  - [x] 3.1 Add `fetchThemedItem(registryUrl, theme, name)` to `package/src/core/registry.ts`
    - Uses `buildItemUrl` from naming module
    - Same error handling pattern as existing `fetchItem`
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Simplify `writeRegistryFile` in `package/src/core/file-writer.ts`
    - Sound files write to `{soundDir}/{semantic-name}.ts` using `buildSoundFilePath`
    - Keep dependency file logic (hooks, libs) unchanged
    - Update `isSoundFilePath` to detect new `audio/` path pattern
    - _Requirements: 5.3, 7.2_

- [x] 4. Rewrite init command with theme selection
  - [x] 4.1 Update `package/src/commands/init.ts` to prompt for theme selection
    - Add theme selection prompt (list of available themes)
    - Set `soundDir` default to `assets/audio`
    - Write `theme` field to config
    - Write `installedSounds` as empty array `[]`
    - Keep overwrite confirmation, package manager detection, alias resolution
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Rewrite add command with theme-aware fetching
  - [x] 5.1 Update `package/src/commands/add.ts` to use theme-aware registry
    - Read `config.theme`, call `fetchThemedItem(registryUrl, theme, name)`
    - Write sound to `{soundDir}/{semantic-name}.ts`
    - Update `installedSounds` as flat string array (push name, avoid duplicates)
    - Remove old object-based `installedSounds` tracking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 5.2 Write property test: InstalledSounds list management (Property 8)
    - **Property 8: InstalledSounds list management**
    - For any list and a new name not in it, adding increases length by 1 and name is present; removing restores original list.
    - File: `package/tests/properties/installed-sounds.test.ts`
    - **Validates: Requirements 5.4, 7.5, 11.2, 13.3**

- [x] 6. Implement theme set command
  - [x] 6.1 Rewrite `package/src/commands/theme.ts` to only export `themeSetCommand`
    - Remove all other theme subcommand exports (`themeInitCommand`, `themeMapCommand`, `themeCreateCommand`, `themeListCommand`, `themeGenerateCommand`)
    - Remove `ThemeManager` and `ThemeCodegen` imports
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.9_

  - [x] 6.2 Implement new `themeSetCommand(themeName, projectRoot)`
    - Update `config.theme` to new theme name
    - Iterate `installedSounds`, fetch each from new theme via `fetchThemedItem`
    - Overwrite each `{soundDir}/{name}.ts` with new theme content
    - Log warning per failed sound, continue with remaining
    - Display summary: count of updated sounds and new theme name
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 6.3 Write property test: Theme persistence set-then-read (Property 9)
    - **Property 9: Theme persistence (set then read)**
    - For any valid config and new non-empty theme name, writing theme and reading back returns the new theme.
    - File: `package/tests/properties/theme-persistence.test.ts`
    - **Validates: Requirements 4.2, 6.1, 7.4**

  - [ ]* 6.4 Write property test: Theme set re-fetches all installed sounds (Property 12)
    - **Property 12: Theme set re-fetches all installed sounds**
    - For any non-empty list of installed names and a new theme, the operation constructs fetch URLs for every installed sound using the new theme.
    - File: `package/tests/properties/theme-set-refetch.test.ts`
    - **Validates: Requirements 6.2**

- [x] 7. Implement bulk install command
  - [x] 7.1 Create `package/src/commands/install.ts` with `installPackCommand`
    - Iterate `SEMANTIC_SOUND_NAMES` (67 entries), fetch each from specified theme
    - Write each to `{soundDir}/{semantic-name}.ts`, overwrite without prompting
    - Update config: set `theme` to specified theme, set `installedSounds` to all names
    - Log warning per failed sound, continue with remaining
    - Display summary with total count
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 7.2 Register `install <theme> pack` command in `package/src/index.ts`
    - Add `install` command with `<theme>` argument and `pack` subcommand
    - _Requirements: 7.1_

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update remove, diff, update, list, and generate commands
  - [x] 9.1 Update `package/src/commands/remove.ts` for semantic names
    - Delete `{soundDir}/{semantic-name}.ts` using `buildSoundFilePath`
    - Filter removed name from flat `installedSounds` array
    - Remove all `ThemeManager` references and `audx.themes.json` handling
    - Handle missing file on disk: still remove from config, display success
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 14.2, 14.3_

  - [x] 9.2 Update `package/src/commands/diff.ts` for theme-aware URLs
    - Use `fetchThemedItem(registryUrl, config.theme, name)` for each installed sound
    - Iterate `installedSounds` as flat string array
    - Simplify `resolveLocalPath` to use `buildSoundFilePath` for sound files
    - _Requirements: 9.1, 9.4, 9.5_

  - [x] 9.3 Update `package/src/commands/update.ts` for theme-aware URLs
    - Use `fetchThemedItem(registryUrl, config.theme, name)` for each installed sound
    - Iterate `installedSounds` as flat string array
    - Simplify file writing to use `buildSoundFilePath`
    - _Requirements: 9.2, 9.3, 9.5_

  - [x] 9.4 Update `package/src/commands/list.ts` for theme filtering
    - Filter catalog by `config.theme` by default
    - Add `--theme <theme-name>` option to override filter
    - Display semantic names from `meta.semanticName` or parsed from item name
    - Handle empty results with "No sounds found" message
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 9.5 Update `package/src/commands/generate.ts` for new paths
    - Write to `{soundDir}/{name}.ts` using `buildSoundFilePath`
    - Update `installedSounds` as flat string array (push name)
    - Keep existing prompt derivation and API call logic
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 9.6 Write property test: Catalog theme filtering (Property 7)
    - **Property 7: Catalog theme filtering**
    - For any catalog with mixed themes and a filter theme, filtering returns only items with matching `meta.theme`, and result is a subset of original.
    - File: `package/tests/properties/catalog-filter.test.ts`
    - **Validates: Requirements 10.1, 10.2**

- [x] 10. Remove deprecated modules and update CLI entry point
  - [x] 10.1 Delete `package/src/core/theme-manager.ts` and `package/src/codegen/theme-codegen.ts`
    - _Requirements: 8.7, 8.8_

  - [x] 10.2 Update `package/src/index.ts` to remove deprecated theme subcommands
    - Remove `theme init`, `theme map`, `theme create`, `theme list`, `theme generate` registrations
    - Keep only `theme set` subcommand
    - Register new `install <theme> pack` command
    - Verify `audx theme` help shows only `set`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.9_

  - [x] 10.3 Remove all `ThemeManager` and `ThemeCodegen` imports across the codebase
    - Scan and remove any remaining references in commands and core modules
    - _Requirements: 14.2, 14.3_

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Restructure registry source files
  - [x] 12.1 Create new directory structure `registry/audx/audio/{theme}/{semantic-name}/`
    - Create directories for each theme (e.g., `minimal/`, `playful/`)
    - Move files from `{name}-{theme}-001/{name}-{theme}-001.ts` to `{theme}/{name}/{name}.ts`
    - Preserve all base64 audio content without loss
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 12.2 Remove legacy flat-structured and non-themed sound directories
    - Delete old `{name}-{theme}-001/` directories
    - Delete non-themed directories (`back-001/`, `click-001/`, `scroll-001/`)
    - _Requirements: 1.5, 1.6_

- [x] 13. Update registry manifest and build script
  - [x] 13.1 Update `registry.json` items to new name format
    - Change item names to `audio/{theme}/{semantic-name}`
    - Update file paths to `registry/audx/audio/{theme}/{semantic-name}/{semantic-name}.ts`
    - Ensure all items have `meta.theme` and `meta.semanticName` fields
    - Remove `registryDependencies` from themed sound items
    - _Requirements: 2.1, 2.2, 2.4, 14.5_

  - [x] 13.2 Update `scripts/build-registry-items.ts` for new output paths
    - Output files to `public/r/audio/{theme}/{semantic-name}.json` (derive from item name)
    - Create nested output directories as needed
    - Update public registry catalog generation
    - Verify error handling logs path and continues
    - _Requirements: 2.2, 2.3, 2.5, 2.6_

  - [ ]* 13.3 Write property test: Registry item metadata completeness (Property 6)
    - **Property 6: Registry item metadata completeness**
    - For any registry item built from a themed source, metadata contains `theme` matching source theme and `semanticName` matching source name.
    - File: `package/tests/properties/registry-metadata.test.ts`
    - **Validates: Requirements 2.4**

- [x] 14. Update website audio data layer and UI
  - [x] 14.1 Update `lib/audio-catalog.ts` to make `theme` and `semanticName` required on `AudioCatalogItem.meta`
    - Change from optional to required fields in the interface
    - _Requirements: 12.1, 12.5_

  - [x] 14.2 Update `lib/audio-data.ts` `buildCatalog()` to parse new name format
    - Parse `audio/{theme}/{semantic-name}` from item name
    - Populate `theme` and `semanticName` as required fields
    - _Requirements: 12.5_

  - [x] 14.3 Update browse page to group sounds by theme
    - Update `components/audio-page.tsx` and `components/audio-grid.tsx` for theme grouping
    - Display semantic name as primary label on audio cards
    - _Requirements: 12.1, 12.2_

  - [x] 14.4 Update audio detail page for new install/import patterns
    - Show install command as `npx audx add <semantic-name>`
    - Show import pattern as `import { <camelCase>Audio } from "@/assets/audio/<semantic-name>"`
    - Update `lib/audio-snippets.ts` and `lib/audio-install.ts` accordingly
    - _Requirements: 12.3, 12.4_

  - [ ]* 14.5 Write property test: Install command string format (Property 10)
    - **Property 10: Install command string format**
    - For any valid semantic name, `buildInstallCommand` returns `npx audx add {semanticName}`.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 12.3**

  - [ ]* 14.6 Write property test: Import pattern string format (Property 11)
    - **Property 11: Import pattern string format**
    - For any valid semantic name, `buildImportPattern` correctly converts kebab-case to camelCase with `Audio` suffix and references `@/assets/audio/{semantic-name}`.
    - File: `package/tests/properties/naming.test.ts`
    - **Validates: Requirements 12.4**

- [x] 15. Final cleanup and verification
  - [x] 15.1 Remove all remaining references to `audx.themes.json` across the codebase
    - Scan all files for `audx.themes.json`, `ThemeConfig`, `themeConfigSchema`, `removeSoundMappings`
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 15.2 Verify `SEMANTIC_SOUND_NAMES` remains the single source of truth
    - Ensure no duplicate definitions or hardcoded name lists elsewhere
    - _Requirements: 14.4_

  - [ ]* 15.3 Write unit tests for key command behaviors
    - Test init command: theme prompt, defaults, overwrite
    - Test add command: success, HTTP error, missing config
    - Test theme set: config update, partial failure
    - Test install pack: bulk install, summary, partial failure
    - Test remove: deletion, not-installed error, missing file
    - Test list: theme filtering, empty results
    - _Requirements: 4.1–4.7, 5.1–5.6, 6.1–6.6, 7.1–7.7, 11.1–11.4, 10.1–10.4_

  - [ ]* 15.4 Write integration tests for end-to-end flows
    - Test init → add → remove cycle
    - Test theme switch with installed sounds
    - _Requirements: 4.1, 5.1, 6.1, 11.1_

- [x] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 12 universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The implementation language is TypeScript throughout (matching the existing codebase)

## Agent Execution Rules (CRITICAL)

1. **NO intermediate testing**: Do NOT run linting (`bun run lint`), building (`bun run build`), type checking (`tsc --noEmit`), or any verification commands between tasks. Only run these at the very last task (Task 10). Just write the code and move on.
2. **Terminal output not visible? Move on**: If you execute a terminal command and cannot see the output, that is a known bug. Do NOT retry the command. Do NOT try alternative approaches to see the output. Simply move to the next step.
3. **Avoid commands requiring user confirmation**: If a command is not in your auto-approved list and requires user confirmation, defer it to the final task (Task 10) or use an alternative command from the auto-allowed list. Do not block on user confirmation mid-execution — time should not be wasted waiting.
