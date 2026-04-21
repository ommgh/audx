# Implementation Plan: Semantic Sound Vocabulary

## Overview

This plan implements the expanded semantic sound vocabulary, backward-compatible schema changes, category metadata, theme definition files, ~130 sound asset placeholders (65 names × 2 themes), registry metadata extensions, and website theme browsing pages. Tasks are ordered so each step builds on the previous, with checkpoints for validation.

## Tasks

- [x] 1. Expand vocabulary and add category metadata in CLI types
  - [x] 1.1 Expand `SEMANTIC_SOUND_NAMES` array in `package/src/types.ts`
    - Add all new semantic sound names organized by category (interaction, navigation, feedback, notification, transition, destructive, progress, clipboard, state, media)
    - Keep the existing 16 names at the top of the array
    - Total should be ≤ 70 names
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 1.2 Add `CATEGORY_NAMES` and `SEMANTIC_SOUND_CATEGORIES` to `package/src/types.ts`
    - Define `CATEGORY_NAMES` as a const array of the 10 category strings
    - Define `CategoryName` type from the array
    - Define `SEMANTIC_SOUND_CATEGORIES` as a `Record<SemanticSoundName, CategoryName>` mapping every name to exactly one category
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.3 Make `themeConfigSchema` permissive for backward compatibility
    - Change the theme mappings schema from `z.record(z.enum(SEMANTIC_SOUND_NAMES), z.string().nullable())` to `z.record(z.string(), z.string().nullable())`
    - This allows old configs with 16 keys, new configs with 65 keys, and configs with unknown keys to all validate
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ]* 1.4 Write property test: Permissive theme config schema validation
    - **Property 1: Permissive theme config schema validation**
    - **Validates: Requirements 1.4, 2.1, 2.2, 2.4, 2.5**
    - Test file: `package/tests/properties/schema.property.test.ts`
    - Generate arbitrary records of string keys to nullable string values, wrap in valid `{ activeTheme, themes }` structure, assert `themeConfigSchema.parse()` succeeds

  - [ ]* 1.5 Write property test: Category mapping completeness and validity
    - **Property 3: Category mapping completeness and validity**
    - **Validates: Requirements 3.1, 3.3**
    - Test file: `package/tests/properties/categories.property.test.ts`
    - For every name in `SEMANTIC_SOUND_NAMES`, assert `SEMANTIC_SOUND_CATEGORIES[name]` exists and is a member of `CATEGORY_NAMES`

  - [ ]* 1.6 Write unit tests for vocabulary and categories
    - Test file: `package/tests/unit/types.test.ts`
    - Assert all 16 original names are present in `SEMANTIC_SOUND_NAMES`
    - Assert total count is ≤ 70
    - Assert exactly 10 category names exist
    - Assert no duplicate entries in `SEMANTIC_SOUND_NAMES`
    - _Requirements: 1.1, 1.2, 1.3, 3.2_

- [x] 2. Update theme manager for expanded vocabulary
  - [x] 2.1 Update `createTheme` in `package/src/core/theme-manager.ts`
    - Ensure `createTheme` initializes all entries from the expanded `SEMANTIC_SOUND_NAMES` array to `null`
    - Update `themeInitCommand` in `package/src/commands/theme.ts` to use the full expanded vocabulary for the default theme
    - _Requirements: 2.3_

  - [ ]* 2.2 Write property test: New theme initialization covers full vocabulary
    - **Property 2: New theme initialization covers full vocabulary**
    - **Validates: Requirements 2.3**
    - Test file: `package/tests/properties/theme-manager.property.test.ts`
    - For any valid theme name and existing `ThemeConfig`, assert `createTheme(config, themeName)` produces a theme entry where every `SemanticSoundName` is present as a key mapped to `null`

  - [ ]* 2.3 Write unit tests for backward-compatible theme reading
    - Test file: `package/tests/unit/core/theme-manager.test.ts`
    - Assert a config with only the original 16 names validates and operates correctly
    - Assert a config with missing new names does not throw
    - _Requirements: 2.1, 2.2_

- [x] 3. Checkpoint — CLI types and theme manager
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add registry metadata extension and theme definition files
  - [x] 4.1 Update `RegistryItem` interface in `package/src/types.ts`
    - Add optional `theme?: string` and `semanticName?: string` fields to the `meta` object in the `RegistryItem` interface
    - _Requirements: 4.7, 4.8_

  - [x] 4.2 Create theme definition files in `registry/audx/themes/`
    - Create `registry/audx/themes/minimal.json` with metadata (name, displayName, description, author) and mappings for all vocabulary entries pointing to `registry/audx/audio/{name}-minimal-001/{name}-minimal-001.ts` paths
    - Create `registry/audx/themes/playful.json` with the same structure pointing to playful sound asset paths
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.3 Write property test: Theme definition covers all vocabulary entries
    - **Property 4: Theme definition covers all vocabulary entries**
    - **Validates: Requirements 5.2**
    - Test file: `package/tests/properties/theme-definition.property.test.ts`
    - Load each theme definition file, assert its `mappings` object contains a key for every `SemanticSoundName`, and each value is either a non-empty string or `null`

- [x] 5. Create sound asset placeholder structure and registry entries
  - [x] 5.1 Create placeholder sound asset TypeScript modules
    - For each of the ~65 semantic names × 2 themes, create a directory and TypeScript file at `registry/audx/audio/{name}-{theme}-001/{name}-{theme}-001.ts`
    - Each file exports an `AudioAsset` with a placeholder base64 data URI (short silent MP3), correct metadata (name, duration, format, license, author)
    - Use the naming convention `{semantic-name}-{theme}-001`
    - The user will replace placeholder audio data with real ElevenLabs-generated sounds later
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 5.2 Add all new sound assets to `registry.json`
    - Add a registry entry for each sound asset with `type: "registry:block"`, correct file paths, and `meta` including `duration`, `format`, `sizeKb`, `license`, `tags`, `keywords`, `theme`, and `semanticName` fields
    - Minimal theme assets: duration between 0.03 and 0.3
    - Playful theme assets: duration between 0.05 and 0.8
    - _Requirements: 4.2, 4.3, 4.6, 4.7, 4.8, 9.1_

  - [ ]* 5.3 Write property test: Registry filtering returns only matching items
    - **Property 6: Registry filtering returns only matching items**
    - **Validates: Requirements 9.2, 9.3**
    - Test file: `package/tests/properties/registry-filter.property.test.ts`
    - Given a catalog of registry items with various `meta.theme` and `meta.semanticName` values, filtering by a specific theme or semantic name returns only items whose corresponding meta field exactly matches

- [x] 6. Checkpoint — Registry and sound assets
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update build script and website data layer
  - [x] 7.1 Update `scripts/build-registry-items.ts` to pass through `meta.theme` and `meta.semanticName`
    - Ensure the build script preserves the new `meta.theme` and `meta.semanticName` fields when generating `public/r/*.json` files
    - _Requirements: 9.1_

  - [x] 7.2 Extend `AudioCatalogItem` in `lib/audio-catalog.ts`
    - Add optional `theme?: string` and `semanticName?: string` fields to the `meta` object
    - _Requirements: 9.2, 9.3_

  - [x] 7.3 Update `lib/audio-data.ts` to extract new meta fields
    - Update `buildCatalog()` to read `meta.theme` and `meta.semanticName` from registry items
    - _Requirements: 9.4_

  - [x] 7.4 Create `lib/theme-data.ts` for theme catalog data
    - Define `ThemeCatalogItem`, `ThemeSound`, and `ThemeDetail` interfaces
    - Implement `getAllThemes()` that reads theme definition JSON files and returns a list of `ThemeCatalogItem`
    - Implement `getThemeByName(name)` that returns a `ThemeDetail` with all sounds organized by category
    - Use React `cache()` for deduplication
    - _Requirements: 6.2, 7.1, 7.2, 9.4_

- [x] 8. Build website theme browsing pages
  - [x] 8.1 Create `/themes` page at `app/themes/page.tsx`
    - Server component that calls `getAllThemes()`
    - Render a grid of theme cards showing theme name, description, and mapped sound count
    - Each card links to `/themes/[name]`
    - Use server-side rendering
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 8.2 Create theme card component at `components/theme-card.tsx`
    - Display theme name, description, and sound count
    - Link to `/themes/[name]`
    - _Requirements: 6.2_

  - [x] 8.3 Create `/themes/[name]` page at `app/themes/[name]/page.tsx`
    - Server component that calls `getThemeByName(name)`, returns `notFound()` for invalid names
    - Display theme name, description, and total sound count
    - Render sounds organized by category in collapsible sections
    - Each sound entry shows semantic name, duration, and file size
    - Unmapped sounds displayed with muted visual style
    - _Requirements: 7.1, 7.2, 7.4, 7.7_

  - [x] 8.4 Create theme detail client component at `components/theme-detail.tsx`
    - Client component for interactive features: sound playback on click, "Compare with" theme dropdown, package manager switcher for install instructions
    - Sound playback via Web Audio API with `typeof window !== "undefined"` guard
    - Installation instructions code block with copy button
    - Package manager switcher updates commands without page reload
    - _Requirements: 7.3, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 8.5 Write property test: Installation instruction completeness
    - **Property 5: Installation instruction completeness**
    - **Validates: Requirements 8.2**
    - Test file: `package/tests/properties/install-instructions.property.test.ts`
    - For any theme name and set of semantic-name-to-sound mappings, assert the generated installation instructions contain commands for: theme init, theme create, theme map (for each mapped sound), theme set, and theme generate

- [x] 9. Update header navigation and wire everything together
  - [x] 9.1 Add "Themes" link to site header
    - Update `components/header.tsx` to include a "Themes" navigation link to `/themes`
    - Place it between the logo and the right-side controls
    - _Requirements: 6.4_

  - [x] 9.2 Verify theme codegen works with expanded vocabulary
    - Confirm `package/src/codegen/theme-codegen.ts` handles the expanded vocabulary correctly (it already collects names dynamically from `themeConfig.themes`)
    - No structural changes needed — the codegen is already vocabulary-agnostic
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 9.3 Write property test: Theme codegen produces correct output
    - **Property 7: Theme codegen produces correct output for any valid config**
    - **Validates: Requirements 10.1, 10.2, 10.5**
    - Test file: `package/tests/properties/theme-codegen.property.test.ts`
    - For any valid `ThemeConfig` with at least one theme, assert the generated TypeScript contains: a `SemanticSoundName` type union with all semantic names, an import for every unique non-null sound path, and `null` entries for null-mapped names

- [X] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Sound asset files are created as placeholders — the user will generate real audio data via ElevenLabs and replace the placeholder base64 data URIs
- The theme codegen (`theme-codegen.ts`) requires no structural changes since it already dynamically collects semantic names from the theme config
- Property tests use `fast-check` (already a devDependency in `package/package.json`) and run via Vitest
