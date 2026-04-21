# Requirements Document

## Introduction

This feature expands audx's semantic sound vocabulary beyond the current 16 names and delivers two built-in themes ("minimal" and "playful") with real sound assets. It also adds a website-side theme browsing experience where users can preview sounds per theme and get installation instructions. The goal is to establish audx as a comprehensive "design tokens for audio" system — semantic names map to actual sounds through swappable theme configurations.

## Glossary

- **Vocabulary**: The canonical set of semantic sound names recognized by audx (e.g., "success", "click", "open")
- **Semantic_Sound_Name**: A string identifier referencing a sound by its UX purpose rather than its file name
- **Theme**: A named JSON configuration that maps every Semantic_Sound_Name to a concrete sound asset (or null)
- **Theme_Config**: The `audx.themes.json` file that stores all themes and the active theme selection
- **Sound_Asset**: A TypeScript module exporting an AudioAsset with an inline base64 data URI
- **Category**: A grouping of related Semantic_Sound_Names (e.g., "feedback", "navigation", "interaction")
- **Registry**: The master `registry.json` manifest and `public/r/` JSON files that distribute sound assets
- **CLI**: The `@litlab/audx` command-line tool in the `package/` directory
- **Theme_Codegen**: The code generator that produces `sound-theme.ts` from Theme_Config
- **Website**: The Next.js application at audx.site
- **Themes_Page**: The new `/themes` page on the Website for browsing and previewing themes
- **Theme_Detail_Page**: The new `/themes/[name]` page showing all sounds in a single theme

## Requirements

### Requirement 1: Expand Semantic Sound Vocabulary

**User Story:** As a developer, I want a comprehensive set of semantic sound names covering common web and mobile UX patterns, so that I can reference any typical UI sound by purpose without inventing ad-hoc names.

#### Acceptance Criteria

1. THE Vocabulary SHALL include the existing 16 Semantic_Sound_Names: success, error, warning, info, click, back, enter, delete, copy, paste, scroll, hover, toggle, notify, complete, loading
2. THE Vocabulary SHALL add the following Semantic_Sound_Names organized by Category:
   - **Interaction**: tap, press, release, drag, drop, select, deselect, focus, blur
   - **Navigation**: forward, open, close, expand, collapse, tab, swipe
   - **Feedback**: confirm, cancel, deny, undo, redo
   - **Notification**: alert, message, reminder, mention
   - **Transition**: show, hide, slide, fade, pop
   - **Destructive**: clear, remove, trash, shred
   - **Progress**: upload, download, refresh, sync, process
   - **Clipboard**: cut, snapshot
   - **State**: lock, unlock, enable, disable, connect, disconnect
   - **Media**: mute, unmute, record, capture
3. THE Vocabulary SHALL contain no more than 70 total Semantic_Sound_Names
4. WHEN a new Semantic_Sound_Name is added, THE CLI SHALL accept the new name in all commands that reference semantic names without breaking existing configurations
5. THE Vocabulary SHALL be defined as a single source of truth in `package/src/types.ts` via the `SEMANTIC_SOUND_NAMES` array

### Requirement 2: Backward-Compatible Vocabulary Expansion in CLI

**User Story:** As a developer with an existing audx setup, I want the vocabulary expansion to preserve my current theme configuration, so that upgrading does not break my project.

#### Acceptance Criteria

1. WHEN the CLI reads a Theme_Config containing only the original 16 Semantic_Sound_Names, THE CLI SHALL treat the configuration as valid and operate without errors
2. WHEN a Theme_Config is missing newly added Semantic_Sound_Names, THE CLI SHALL treat missing names as unmapped (null) rather than raising a validation error
3. WHEN the `audx theme create` command creates a new theme, THE CLI SHALL initialize all current Vocabulary entries (including new names) to null
4. THE `themeConfigSchema` in `package/src/types.ts` SHALL validate themes permissively, accepting any subset of the Vocabulary as valid keys
5. IF a Theme_Config contains a Semantic_Sound_Name not present in the current Vocabulary, THEN THE CLI SHALL ignore the unrecognized name without error

### Requirement 3: Vocabulary Category Metadata

**User Story:** As a developer, I want semantic sound names organized into categories, so that I can discover and browse sounds by their UX purpose.

#### Acceptance Criteria

1. THE CLI SHALL export a `SEMANTIC_SOUND_CATEGORIES` mapping that groups every Semantic_Sound_Name into exactly one Category
2. THE Category names SHALL be: interaction, navigation, feedback, notification, transition, destructive, progress, clipboard, state, media
3. WHEN a Semantic_Sound_Name is queried, THE CLI SHALL provide its Category through the exported mapping
4. THE Website SHALL use Category metadata to organize sounds in the theme browsing experience

### Requirement 4: Sound Asset Generation for Themes

**User Story:** As a project maintainer, I want to generate real sound assets for each semantic name across both themes, so that themes ship with actual audio rather than empty mappings.

#### Acceptance Criteria

1. THE Registry SHALL contain one Sound_Asset per Semantic_Sound_Name per theme (minimal and playful)
2. WHEN a Sound_Asset is created for the "minimal" theme, THE Sound_Asset SHALL have a duration between 30ms and 300ms and use clean, simple tonal characteristics
3. WHEN a Sound_Asset is created for the "playful" theme, THE Sound_Asset SHALL have a duration between 50ms and 800ms and use richer, more expressive tonal characteristics
4. THE Sound_Asset naming convention SHALL follow the pattern `{semantic-name}-{theme}-001` (e.g., `click-minimal-001`, `click-playful-001`)
5. Each Sound_Asset SHALL be a TypeScript module in `registry/audx/audio/{name}/{name}.ts` exporting an AudioAsset with an inline base64 data URI
6. Each Sound_Asset SHALL be registered in `registry.json` with accurate metadata including duration, format, sizeKb, license, tags, and keywords
7. Each Sound_Asset entry in `registry.json` SHALL include a `meta.theme` field indicating which theme the sound belongs to
8. Each Sound_Asset entry in `registry.json` SHALL include a `meta.semanticName` field indicating which Semantic_Sound_Name the sound fulfills

### Requirement 5: Theme Definition Files

**User Story:** As a developer, I want pre-built "minimal" and "playful" theme definitions available in the registry, so that I can install a complete theme with one command.

#### Acceptance Criteria

1. THE Registry SHALL include a theme definition JSON file for each theme at `registry/audx/themes/{theme-name}.json`
2. Each theme definition file SHALL map every Semantic_Sound_Name in the Vocabulary to the corresponding Sound_Asset path or null
3. THE "minimal" theme definition SHALL map all Vocabulary entries to their corresponding minimal Sound_Assets
4. THE "playful" theme definition SHALL map all Vocabulary entries to their corresponding playful Sound_Assets
5. WHEN a new theme is added in the future, THE theme definition format SHALL require only a new JSON file following the same schema
6. Each theme definition file SHALL include metadata: name, displayName, description, and author

### Requirement 6: Website Themes Browsing Page

**User Story:** As a developer, I want to browse available themes on the audx website, so that I can compare themes and choose one that fits my project's personality.

#### Acceptance Criteria

1. THE Website SHALL provide a `/themes` page listing all available themes
2. WHEN the Themes_Page loads, THE Website SHALL display each theme as a card showing the theme name, description, and the count of mapped sounds
3. WHEN a user clicks a theme card, THE Website SHALL navigate to the Theme_Detail_Page at `/themes/[name]`
4. THE Themes_Page SHALL be accessible from the site header navigation
5. THE Themes_Page SHALL use server-side rendering for initial page load

### Requirement 7: Website Theme Detail Page

**User Story:** As a developer, I want to see all sounds in a theme organized by category and preview each one, so that I can evaluate whether a theme suits my application before installing.

#### Acceptance Criteria

1. THE Theme_Detail_Page SHALL display the theme name, description, and total sound count
2. THE Theme_Detail_Page SHALL organize sounds by Category with collapsible sections
3. WHEN a user clicks a sound entry, THE Website SHALL play the sound using the Web Audio API
4. Each sound entry SHALL display the Semantic_Sound_Name, duration, and file size
5. THE Theme_Detail_Page SHALL provide a "Compare with" control that lets the user select another theme and hear the same Semantic_Sound_Name in both themes side by side
6. THE Theme_Detail_Page SHALL include installation instructions showing the CLI commands to install the theme
7. IF a Semantic_Sound_Name has no mapped Sound_Asset in the theme, THEN THE Theme_Detail_Page SHALL display the entry as "unmapped" with a muted visual style

### Requirement 8: Theme Installation Instructions

**User Story:** As a developer, I want clear installation instructions for each theme, so that I can set up a theme in my project with minimal effort.

#### Acceptance Criteria

1. THE Theme_Detail_Page SHALL display a code block with the CLI commands needed to install the theme
2. THE installation instructions SHALL include commands for: initializing theme config, creating the theme, mapping all sounds, setting the theme as active, and generating the theme file
3. THE installation instructions SHALL adapt to the user's selected package manager (npm, pnpm, yarn, bun)
4. THE Website SHALL provide a "Copy" button for the installation code block
5. WHEN the user switches package manager, THE Website SHALL update the installation commands immediately without a page reload

### Requirement 9: Registry Integration for Theme Assets

**User Story:** As a project maintainer, I want theme sound assets distributed through the existing registry infrastructure, so that the CLI can fetch and install them using the same mechanism as individual sounds.

#### Acceptance Criteria

1. WHEN `bun run registry:build` is executed, THE build script SHALL generate `public/r/*.json` files for all theme Sound_Assets
2. THE Registry SHALL support filtering items by theme via the `meta.theme` field
3. THE Registry SHALL support filtering items by semantic name via the `meta.semanticName` field
4. WHEN the Website loads theme data, THE Website SHALL read from `registry.json` and filter by theme metadata

### Requirement 10: Theme Codegen Compatibility

**User Story:** As a developer, I want the theme code generator to work with the expanded vocabulary, so that my generated `sound-theme.ts` includes all new semantic names.

#### Acceptance Criteria

1. WHEN `audx theme generate` is executed, THE Theme_Codegen SHALL produce a `SemanticSoundName` type union containing all Semantic_Sound_Names present in the active Theme_Config
2. WHEN the Theme_Config contains new Vocabulary entries, THE Theme_Codegen SHALL generate import statements and mappings for all mapped sounds
3. THE generated `play()` function SHALL accept any Semantic_Sound_Name from the expanded Vocabulary
4. THE generated `setSoundTheme()` function SHALL switch between themes that use the expanded Vocabulary
5. IF a Semantic_Sound_Name is mapped to null in a theme, THEN THE generated `play()` function SHALL no-op for that name in that theme
