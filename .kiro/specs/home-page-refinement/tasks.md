# Implementation Plan: Home Page Refinement

## Overview

Move theme selection and category filtering onto the home page by extending the existing filter infrastructure (`useGlobalFilters`, `filterAudio`), adding three new UI components (`ThemeSelector`, `NewThemeButton`, `CategoryBar`), modifying `GlobalFilters` and `AudioPage` to wire them in, cleaning up the `Header`, and updating `app/page.tsx` to pass theme data. Property-based tests validate the filter logic using `fast-check`.

## Tasks

- [x] 1. Install shadcn/ui Button and extend filter infrastructure
  - [x] 1.1 Install the shadcn/ui Button component into `components/ui/`
    - Run `bunx shadcn@latest add @shadcn/button` to install `components/ui/button.tsx`
    - _Requirements: 5.3_

  - [x] 1.2 Extend `filterAudio` in `lib/audio-filters.ts` with theme and category parameters
    - Add optional `theme` and `category` parameters to `filterAudio`
    - When `theme` is provided, filter items where `item.meta.theme === theme`
    - When `category` is provided, derive category from `item.meta.semanticName` using the `CATEGORIES` map from `lib/theme-data.ts` and filter accordingly
    - Text search continues to apply after theme/category filtering
    - Export the `CATEGORIES` map from `lib/theme-data.ts` if not already exported
    - _Requirements: 1.3, 3.5_

  - [x] 1.3 Extend `useGlobalFilters` hook with theme and category URL state
    - Add `theme` and `category` query params via `nuqs` (`parseAsString.withDefault("")`)
    - On mount, if `theme` is empty, default to the first theme's `name`
    - When `theme` changes, reset `category` to `""`
    - Update `handleClearFilters` to also reset `theme` to default and `category` to `""`
    - Pass `theme` and `category` to `filterAudio`
    - Accept `themes: ThemeCatalogItem[]` in the hook's options so it can determine the default theme
    - _Requirements: 1.2, 1.3, 3.5, 3.7_

  - [x] 1.4 Add `getCategoriesForTheme` helper function
    - Create a function (in `lib/theme-data.ts` or `lib/audio-filters.ts`) that derives `CategoryCount[]` from a theme name using `getThemeByName` and the `CATEGORIES` map
    - Each entry has `name` (category) and `count` (number of sounds)
    - Return sorted alphabetically by category name
    - _Requirements: 3.2, 3.3_


- [x] 2. Implement new UI components
  - [x] 2.1 Create `ThemeSelector` component at `components/theme-selector.tsx`
    - Use `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem` from `components/ui/dropdown-menu.tsx`
    - Trigger button shows selected theme's `displayName` with `RiPaletteLine` icon
    - List all themes as radio items; selected theme is checked
    - Accept `themes`, `selectedTheme`, `onThemeChange` props as defined in design
    - _Requirements: 1.1, 1.4, 5.1_

  - [x] 2.2 Create `NewThemeButton` component at `components/new-theme-button.tsx`
    - Use `Button` from `components/ui/button.tsx` with `variant="outline"` and `size="sm"`
    - Wrap a Next.js `Link` to `/themes/create` using the `asChild` pattern
    - Display `RiAddLine` icon alongside "New Theme" text
    - _Requirements: 2.1, 2.2, 2.3, 5.3_

  - [x] 2.3 Create `CategoryBar` component at `components/category-bar.tsx`
    - Use `Badge` from `components/ui/badge.tsx` and `useHorizontalScroll` from `hooks/use-horizontal-scroll.ts`
    - Accept `categories: CategoryCount[]`, `selectedCategory: string | null`, `onCategoryChange: (category: string | null) => void`
    - Render badges in a single horizontal scrollable line (no wrapping)
    - Each badge displays category name with count in parentheses, e.g. `Feedback (9)`
    - Active badge uses `variant="default"`, inactive uses `variant="outline"`
    - Clicking active badge deselects (passes `null`), clicking inactive badge selects it
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8_

- [x] 3. Checkpoint
  - Ensure all new components compile without errors, ask the user if questions arise.

- [x] 4. Wire components into pages and modify existing components
  - [x] 4.1 Update `GlobalFilters` component to include `ThemeSelector` and `NewThemeButton`
    - Add `themes: ThemeCatalogItem[]` to `GlobalFiltersProps`
    - Render `ThemeSelector` and `NewThemeButton` alongside the existing `SoundSearch`
    - Pass theme state from `useGlobalFilters` to `ThemeSelector`
    - _Requirements: 1.1, 2.1, 5.1_

  - [x] 4.2 Update `AudioPage` to render `CategoryBar` and remove `SoundsCountTitle`
    - Add `themes: ThemeCatalogItem[]` to `AudioPageProps` and pass to `GlobalFilters`
    - Render `CategoryBar` between `GlobalFilters` and the grid, passing category state from `useGlobalFilters` and derived `CategoryCount[]` from `getCategoriesForTheme`
    - Remove the `SoundsCountTitle` component usage and its surrounding `<div>` wrapper
    - _Requirements: 3.1, 3.9, 1.1_

  - [x] 4.3 Update `app/page.tsx` to pass themes to `AudioPage`
    - Import and call `getAllThemes()` from `lib/theme-data.ts`
    - Pass the themes array to `AudioPage`
    - _Requirements: 1.4_

  - [x] 4.4 Remove "Themes" and "Create" navigation links from `Header`
    - Remove the `<nav>` block containing the "Themes" and "Create" `Link` elements
    - Keep `AppLogo`, `ThemeToggle`, `GithubStartsButton`, and "Generate" link intact
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Checkpoint
  - Ensure all components wire together correctly and the app compiles. Ask the user if questions arise.

- [ ] 6. Property-based and unit tests
  - [ ]* 6.1 Write property test: Theme and category filtering returns only matching items
    - **Property 1: Theme and category filtering returns only matching items**
    - **Validates: Requirements 1.3, 3.4, 3.5**
    - Use `fast-check` with Vitest to generate random arrays of `AudioCatalogItem` with random `meta.theme` and `meta.semanticName` values
    - Pick a random theme, optional category, and optional query
    - Assert all results match the filters and no valid items are missing (no false positives, no false negatives)

  - [ ]* 6.2 Write property test: Category derivation produces the exact unique set
    - **Property 2: Category derivation produces the exact unique set**
    - **Validates: Requirements 3.2**
    - Use `fast-check` to generate random arrays of `ThemeSound` objects with random `category` values
    - Derive categories and assert the result equals the sorted unique set

  - [ ]* 6.3 Write property test: Filtering is a subset operation
    - **Property 3: Filtering is a subset operation**
    - **Validates: Requirements 1.3, 3.5**
    - Use `fast-check` to generate random items and random filter params
    - Assert the result is a strict subset of the input (every returned item exists in the original list, result length ≤ input length)

  - [ ]* 6.4 Write unit tests for ThemeSelector, NewThemeButton, CategoryBar, and Header
    - Test ThemeSelector renders all themes and displays selected theme
    - Test NewThemeButton renders with `RiAddLine` icon and links to `/themes/create`
    - Test CategoryBar renders badges with correct counts and toggle behavior
    - Test Header no longer renders "Themes" and "Create" links
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 3.2, 3.3, 3.6, 4.1, 4.2_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `Button` component must be installed via shadcn CLI before creating `NewThemeButton`
- The existing `Button` import in `audio-grid.tsx` (`@/registry/audx/ui/button`) is separate from the shadcn/ui `Button` in `components/ui/`
- Property tests validate the pure `filterAudio` and `getCategoriesForTheme` functions
- URL state via `nuqs` ensures theme/category selections are shareable and bookmarkable
