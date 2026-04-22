# Implementation Plan: Blob Theme Distribution

## Overview

Migrate user-generated theme persistence from local filesystem writes to Vercel Blob storage. Each task builds incrementally: first the pure functions and data models, then the blob-based persistence layer, then the API route, then the frontend state/UI changes, and finally cleanup of removed routes. Property-based tests validate the pure functions against the four correctness properties defined in the design.

## Tasks

- [x] 1. Add new pure functions to `lib/theme-persistence.ts`
  - [x] 1.1 Add `RegistryItemJSON` and `ThemeRegistryIndex` TypeScript interfaces
    - Define `RegistryItemJSON` interface matching the design's data model (name, type, title, description, author, files with content, meta)
    - Define `ThemeRegistryIndex` interface (name, displayName, description, author, assetCount, mappings, assets)
    - _Requirements: 1.3, 2.2_

  - [x] 1.2 Implement `buildRegistryItemJSON` pure function
    - Accepts `semanticName`, `themeName`, `audioBase64`, `duration`
    - Constructs asset name as `{semanticName}-{themeName}-001`
    - Builds a `RegistryItemJSON` with: `$schema`, `name`, `type: "registry:block"`, `title`, `description`, `author`, `files` array (with `path`, `content` using `buildAssetModuleContent`, `type: "registry:lib"`), and `meta` (duration, format, sizeKb via `calculateSizeKb`, license, tags, theme, semanticName)
    - Reuses existing `buildAssetModuleContent`, `toDisplayName`, `calculateSizeKb` helpers
    - _Requirements: 1.1, 1.3_

  - [ ]* 1.3 Write property test for `buildRegistryItemJSON` completeness
    - **Property 1: RegistryItemJSON contains all required fields**
    - Use fast-check to generate arbitrary valid semantic names, theme names (matching `^[a-z0-9-]+$`), base64 strings, and positive durations
    - Assert output has correct `name`, `type`, non-empty `files` with content containing base64 data URI, correct `meta` fields
    - **Validates: Requirements 1.1, 1.3**

  - [x] 1.4 Implement `buildThemeRegistryIndex` pure function
    - Accepts `themeName`, `themePrompt`, `assets` array (each with semanticName, blobUrl, duration, sizeKb)
    - Returns `ThemeRegistryIndex` with: `name`, `displayName` (via `toDisplayName`), `description` containing themePrompt, `author: "audx-community"`, `assetCount`, `mappings` (semanticName → blobUrl), `assets` array
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ]* 1.5 Write property test for `buildThemeRegistryIndex` completeness
    - **Property 3: ThemeRegistryIndex contains complete theme metadata and mappings**
    - Use fast-check to generate valid theme names, prompts, and non-empty asset arrays
    - Assert `name`, `displayName`, `description`, `assetCount`, `mappings` keys, and `assets` entries all match inputs
    - **Validates: Requirements 2.2, 2.4**

  - [ ]* 1.6 Write property test for blob path construction
    - **Property 2: Blob path construction follows deterministic patterns**
    - Use fast-check to generate valid theme names and semantic sound names from `SEMANTIC_SOUND_NAMES`
    - Assert asset blob path equals `themes/{themeName}/{semanticName}-{themeName}-001.json`
    - Assert index blob path equals `themes/{themeName}/index.json`
    - **Validates: Requirements 1.5, 2.3**

- [x] 2. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Rewrite `persistThemePack` to use Vercel Blob and add `themeExistsInBlob`
  - [x] 3.1 Implement `themeExistsInBlob` function
    - Import `head` from `@vercel/blob`
    - Call `head("themes/{themeName}/index.json")` — return `true` if blob exists
    - Catch `BlobNotFoundError` and return `false`; let other errors propagate
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.2 Rewrite `persistThemePack` to upload to Vercel Blob
    - Import `put` from `@vercel/blob`
    - Remove all `fs` and `path` imports and filesystem writes
    - Remove `buildThemeDefinition` function (replaced by `buildThemeRegistryIndex`)
    - For each sound: call `buildRegistryItemJSON`, then `put("themes/{themeName}/{assetName}.json", JSON.stringify(item), { access: "public", addRandomSuffix: false, contentType: "application/json" })`
    - Upload all assets in parallel with `Promise.all`
    - After all assets uploaded: call `buildThemeRegistryIndex` with the blob URLs, then `put("themes/{themeName}/index.json", ...)`
    - Update `PersistThemeResult` to return `{ indexUrl: string; assetCount: number }` instead of `{ themeDefinitionPath, assetCount, registryUpdated }`
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.3, 7.1, 7.2, 7.3_

  - [ ]* 3.3 Write unit tests for `themeExistsInBlob`
    - Mock `@vercel/blob` `head` to test: returns `true` when blob exists, returns `false` on `BlobNotFoundError`, throws on other errors
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 4. Update `app/api/save-theme/route.ts` to use blob-based persistence
  - Remove `fs` and `path` imports
  - Replace filesystem duplicate check (`fs.access`) with `themeExistsInBlob(parsed.themeName)`
  - Call updated `persistThemePack` and return `{ success: true, indexUrl, themeName, assetCount }` instead of `{ success: true, themePath }`
  - Keep existing Zod validation and error handling unchanged
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2_

- [x] 5. Propagate `indexUrl` through theme editor state and UI
  - [x] 5.1 Update `hooks/use-theme-editor.ts` state and reducer
    - Add `indexUrl: string | null` to `ThemeEditorState` (initial: `null`)
    - Change `SAVE_COMPLETE` action type to carry `indexUrl: string`
    - Update reducer to store `indexUrl` on `SAVE_COMPLETE`
    - Update `saveTheme` callback to parse `indexUrl` from API response and dispatch `{ type: "SAVE_COMPLETE", indexUrl }`
    - _Requirements: 9.1_

  - [x] 5.2 Update `components/theme-editor/theme-editor.tsx` to pass `indexUrl`
    - In the `"saved"` case of `PhaseRenderer`, pass `indexUrl={state.indexUrl!}` to `<SaveSuccess>`
    - _Requirements: 9.2_

  - [x] 5.3 Update `components/theme-editor/save-success.tsx` with blob-based CLI commands
    - Add `indexUrl: string` to `SaveSuccessProps`
    - Remove the "View Theme" `<Button asChild><Link>` block
    - Update `installCommands` to use `--registry {indexUrl}` pattern in CLI commands, e.g.:
      - `npx audx theme init`
      - `npx audx theme set {themeName} --registry {indexUrl}`
      - `npx audx theme generate`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.4 Write property test for CLI command string construction
    - **Property 4: CLI install commands embed the blob URL as registry source**
    - Use fast-check to generate valid theme names and HTTPS URL strings
    - Assert generated CLI commands contain the blob URL and the theme name
    - **Validates: Requirements 4.1**

- [x] 6. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Remove theme detail page and update navigation
  - [x] 7.1 Delete `app/themes/[name]/page.tsx`
    - Remove the entire file so `/themes/{name}` returns Next.js default 404
    - _Requirements: 5.1, 5.2_

  - [x] 7.2 Remove `/themes/[name]` link from `components/theme-card.tsx`
    - Change the `<Link>` wrapper to a non-navigating `<div>` (or remove the link behavior) since built-in theme detail pages no longer exist
    - _Requirements: 5.3_

  - [x] 7.3 Remove `/themes/[name]` link from `app/themes/page.tsx`
    - Verify `ThemeCard` no longer links to detail pages; update if the page directly references `/themes/[name]`
    - _Requirements: 5.3_

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- `@vercel/blob` is already in `package.json` dependencies — no install step needed
- Property-based tests use `fast-check` (available in `package/`) — a vitest config at the root level will need to be created or tests placed in `package/tests/`
- Built-in themes (minimal, playful) and `registry.json` are untouched throughout
- The CLI package requires zero changes — `fetchItem` already fetches by URL
