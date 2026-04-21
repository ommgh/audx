# Implementation Plan: Theme Editor

## Overview

Build the Theme Editor feature at `/themes/create` that lets users describe a mood/style via a text prompt and generates a complete 65-sound theme pack using the ElevenLabs Sound Effects API. Implementation follows a bottom-up approach: shared libraries first, then API routes, then client components, and finally navigation integration.

## Tasks

- [x] 1. Create sound prompt template system and shared libraries
  - [x] 1.1 Create `lib/sound-prompt-templates.ts` with `SoundPromptTemplate` interface and `SOUND_PROMPT_TEMPLATES` record
    - Define `SoundPromptTemplate` type with `semanticName`, `category`, `uxContext`, `durationRange`, and `defaultDuration`
    - Create entries for all 65 semantic sound names from `SEMANTIC_SOUND_NAMES` in `package/src/types.ts`
    - Each entry must have a non-empty `uxContext`, `durationRange` within [0.1, 2.0], and `defaultDuration` within the range
    - Export `PREVIEW_SOUNDS` array with exactly 10 entries — one representative per category (e.g., "click" for interaction, "back" for navigation, "success" for feedback, "alert" for notification, "show" for transition, "trash" for destructive, "upload" for progress, "copy" for clipboard, "lock" for state, "mute" for media)
    - _Requirements: 2.5, 3.1, 3.2, 9.1, 9.2, 9.4_

  - [ ]* 1.2 Write property test for template completeness (Property 4)
    - **Property 4: Template completeness and duration validity**
    - Verify every name in `SEMANTIC_SOUND_NAMES` has a corresponding `SOUND_PROMPT_TEMPLATES` entry with valid `uxContext`, `durationRange`, and `defaultDuration`
    - **Validates: Requirements 2.5, 9.1, 9.2**

  - [ ]* 1.3 Write property test for preview sound selection (Property 5)
    - **Property 5: Preview sound selection covers all categories**
    - Verify `PREVIEW_SOUNDS` has exactly 10 entries, each mapping to a unique category from `CATEGORY_NAMES`
    - **Validates: Requirements 3.1**

  - [x] 1.4 Create `lib/prompt-builder.ts` with `buildSoundPrompt()` function
    - Implement `BuildPromptInput` and `BuildPromptResult` interfaces
    - Combine template `uxContext` with user's mood descriptors and category context
    - Truncate mood portion if combined prompt exceeds 500 characters
    - Return `text` (≤500 chars) and `duration` from the template
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.3, 9.5_

  - [ ]* 1.5 Write property tests for prompt builder (Properties 2 and 3)
    - **Property 2: Prompt builder includes UX context and mood descriptors**
    - **Property 3: Sound prompt length invariant**
    - Verify output contains UX context substring and mood words, and is always ≤500 chars
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 9.3, 9.5**

  - [x] 1.6 Create `lib/credit-cost.ts` with `estimateCost()` function
    - Export `CREDITS_PER_SECOND` (20) and `APPROX_DOLLAR_PER_CREDIT` constants
    - Implement `CostEstimate` interface and `estimateCost()` that sums `duration × 20` for credits
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 1.7 Write property test for cost estimation (Property 6)
    - **Property 6: Cost estimation formula correctness**
    - Verify `totalCredits` equals sum of `duration × 20` and `approximateDollars` equals `totalCredits × APPROX_DOLLAR_PER_CREDIT`
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [x] 1.8 Create `lib/generate-theme-schema.ts` with Zod schemas
    - Define `themeNameSchema` (lowercase letters, numbers, hyphens, 1–50 chars)
    - Define `generateThemeRequestSchema` and `saveThemeRequestSchema`
    - Export inferred types `GenerateThemeRequest` and `SaveThemeRequest`
    - _Requirements: 1.4, 1.5, 5.8_

  - [ ]* 1.9 Write property test for schema validation (Property 1)
    - **Property 1: Schema validation accepts valid inputs and rejects invalid inputs**
    - Generate random valid/invalid theme names and prompts, verify accept/reject behavior
    - **Validates: Requirements 1.4, 1.5, 5.8**

- [x] 2. Checkpoint — Verify shared libraries
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create theme persistence layer
  - [x] 3.1 Create `lib/theme-persistence.ts` with `persistThemePack()` function
    - Implement `PersistThemeInput` and `PersistThemeResult` interfaces
    - Write each sound as a TS module in `registry/audx/audio/{semantic}-{theme}-001/` following the existing `AudioAsset` format (see `click-minimal-001.ts`)
    - Create theme definition JSON in `registry/audx/themes/{theme}.json` matching the existing schema (see `minimal.json`)
    - Update `registry.json` with new asset entries including full metadata (duration, format, sizeKb, license, tags, theme, semanticName)
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.2 Write property tests for persistence (Properties 7, 8, 9)
    - **Property 7: Theme definition structure validity**
    - **Property 8: Sound asset module format**
    - **Property 9: Registry entry metadata completeness**
    - Test the output format functions (theme JSON structure, TS module content, registry entry metadata) with generated inputs
    - **Validates: Requirements 6.2, 6.3, 6.4**

  - [ ]* 3.3 Write unit tests for persistence file paths
    - Test asset path generation follows `{semantic}-{theme}-001` naming convention
    - Test edge cases: long theme names, names with hyphens
    - _Requirements: 6.3_

- [x] 4. Create API routes
  - [x] 4.1 Create `app/api/generate-theme/route.ts` — SSE batch generation endpoint
    - Validate request body with `generateThemeRequestSchema`
    - Check `ELEVENLABS_API_KEY` env var, return 500 if missing
    - Build prompts using `buildSoundPrompt()` for each requested sound
    - Create `ReadableStream` for SSE with JSON events: `progress`, `complete`, `error`, `done`
    - Implement concurrency limiter (default 2 parallel requests)
    - Implement retry logic: wait on 429 (rate limit), exponential backoff on 5xx (up to 2 retries)
    - Detect client disconnect via `request.signal.aborted`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 4.2 Create `app/api/save-theme/route.ts` — theme persistence endpoint
    - Validate request body with `saveThemeRequestSchema`
    - Check if theme name already exists in registry, return 409 if so
    - Call `persistThemePack()` to write assets, theme definition, and update registry
    - Return success with theme path
    - _Requirements: 6.1, 6.2, 6.5, 6.6_

  - [ ]* 4.3 Write unit tests for API route validation
    - Test Zod validation rejects invalid theme names, empty prompts, out-of-range durations
    - Test 409 response for duplicate theme names
    - Test 500 response when API key is missing
    - _Requirements: 5.7, 5.8, 6.6_

- [x] 5. Checkpoint — Verify API routes and persistence
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create client-side state machine and hook
  - [x] 6.1 Create `hooks/use-theme-editor.ts` with `useThemeEditor` hook
    - Implement `useReducer`-based state machine with phases: `idle → previewing → preview-ready → generating → review → saving → saved`
    - Define `ThemeEditorState`, `GeneratedSound`, and `EditorPhase` types
    - Implement `setThemeName`, `setThemePrompt`, `startPreview`, `approvePreview`, `rejectPreview`, `retrySound`, `saveTheme` actions
    - `startPreview` fetches `/api/generate-theme` with the 10 `PREVIEW_SOUNDS`, parses SSE events
    - `approvePreview` fetches `/api/generate-theme` with the remaining 55 sounds
    - `saveTheme` POSTs to `/api/save-theme` with all generated sounds
    - Compute `previewCost` and `fullCost` using `estimateCost()`
    - Create blob URLs for audio playback, revoke on cleanup
    - _Requirements: 1.2, 1.3, 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.3, 4.4, 4.7, 4.8, 8.1, 8.2_

  - [ ]* 6.2 Write unit tests for state machine transitions
    - Test phase transitions: idle→previewing→preview-ready→generating→review→saving→saved
    - Test invalid transitions are rejected
    - Test progress tracking updates correctly
    - _Requirements: 3.5, 3.6, 4.3, 4.4_

- [x] 7. Create Theme Editor UI components
  - [x] 7.1 Create `components/theme-editor/prompt-form.tsx`
    - Theme name input with validation feedback (lowercase, numbers, hyphens only)
    - Theme prompt textarea (1–300 chars) with character count
    - Suggestion chips (e.g., "warm wooden textures", "futuristic digital", "retro arcade", "soft organic")
    - Preview cost estimate display
    - "Generate Preview" button
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 8.1_

  - [x] 7.2 Create `components/theme-editor/generation-progress.tsx`
    - Per-sound status display (pending/generating/completed/failed) organized by category
    - Collapsible category sections
    - Overall progress bar with count and percentage (e.g., "32/65 — 49%")
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 7.3 Create `components/theme-editor/preview-player.tsx`
    - Display 10 preview sounds with inline playback controls organized by category
    - Show cost estimate for full 65-sound generation
    - "Approve & Generate Full Theme" and "Try Again" buttons
    - Retry button for individually failed preview sounds
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 7.3, 7.5, 8.2_

  - [x] 7.4 Create `components/theme-editor/theme-review.tsx`
    - Full 65-sound review with playback, organized by category in collapsible sections
    - Summary stats: total generated, failures, generation time
    - Duration and estimated file size per sound
    - "Save Theme" button and individual retry controls for failed sounds
    - _Requirements: 4.7, 4.8, 7.1, 7.2, 7.3, 7.4, 7.5, 8.5_

  - [x] 7.5 Create `components/theme-editor/save-success.tsx`
    - Post-save confirmation with link to new theme's detail page (`/themes/[name]`)
    - CLI installation commands with `PackageManagerSwitcher` (reuse existing component)
    - _Requirements: 10.3, 10.4_

  - [x] 7.6 Create `components/theme-editor/theme-editor.tsx` — top-level orchestrator
    - Import and use `useThemeEditor` hook
    - Render the current phase's sub-component based on `state.phase`
    - Wire `beforeunload` handler during `previewing` and `generating` phases
    - _Requirements: 1.8_

- [x] 8. Create Theme Editor page and navigation integration
  - [x] 8.1 Create `app/themes/create/page.tsx` — server component shell
    - Export metadata for SEO
    - Render the `ThemeEditor` client component
    - _Requirements: 1.1, 1.8_

  - [x] 8.2 Update `/themes` page with "Create Theme" CTA
    - Add a prominent "Create Theme" card/button linking to `/themes/create`
    - _Requirements: 10.1_

  - [x] 8.3 Update site header navigation to include Theme Editor link
    - Add "Create" or "Create Theme" link to the header nav (in `components/header.tsx` or `components/app-menu.tsx`)
    - _Requirements: 1.7, 10.2_

- [x] 9. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all code examples and implementations use TypeScript
- Shared libraries (`lib/`) are built first so API routes and components can import them
- The existing `components/theme-detail.tsx` and `lib/theme-data.ts` patterns inform the new component structure
