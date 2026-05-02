# Requirements Document

## Introduction

This feature refactors the audx sound distribution system from a flat, manually-mapped naming scheme (`soundname-theme-001`) to a semantic, theme-driven architecture. The current system requires users to manually map all 67 sounds one-by-one via `audx theme map` commands and suffers from bundle bloat when switching themes. The new system introduces config-driven theme selection during `audx init`, semantic sound naming (just `click`, not `click-minimal-001`), theme-organized registry directories, in-place theme switching, and bulk install — eliminating the manual mapping workflow entirely.

## Glossary

- **CLI**: The `@litlab/audx` command-line tool distributed via npm
- **Registry**: The server-side collection of sound assets served as JSON files from `audx.site/r/`
- **Registry_Source**: The local `registry/audx/audio/` directory containing TypeScript sound modules used to build the Registry
- **Config**: The `audx.config.json` file in the user's project root that stores CLI settings
- **Theme**: A named collection of sound variants (e.g., "minimal", "playful") that provides one audio file per Semantic_Sound_Name
- **Semantic_Sound_Name**: A purpose-based identifier for a sound (e.g., "click", "success", "error") without theme or version suffixes
- **Sound_Module**: A TypeScript file exporting an `AudioAsset` object with an inline base64 data URI
- **Build_Script**: The `scripts/build-registry-items.ts` script that generates `public/r/*.json` files from `registry.json`
- **Theme_Pack**: The complete set of all Semantic_Sound_Names for a given Theme, installable in a single command
- **Sound_Dir**: The directory in the user's project where sound files are written (default: `assets/audio/`)
- **Website**: The Next.js application at audx.site that serves the browsable catalog and Registry

## Requirements

### Requirement 1: Registry Source Restructure

**User Story:** As a maintainer, I want the registry source files organized into theme subdirectories with semantic names, so that the codebase is clean and the naming convention is consistent.

#### Acceptance Criteria

1. THE Registry_Source SHALL organize sound files into the directory structure `registry/audx/audio/{theme}/{semantic-name}/{semantic-name}.ts`
2. WHEN a Sound_Module file exists in the Registry_Source, THE Sound_Module SHALL use only the Semantic_Sound_Name as its filename without theme suffixes or version numbers
3. THE Registry_Source SHALL contain one subdirectory per Theme at the path `registry/audx/audio/{theme}/`
4. WHEN the Registry_Source is restructured, THE Registry_Source SHALL preserve all existing audio data (base64 content) from the current flat structure without loss
5. THE Registry_Source SHALL remove the legacy flat-structured sound directories (e.g., `click-minimal-001/`) after migration to the new theme-based structure
6. THE Registry_Source SHALL remove the legacy non-themed sounds (e.g., `back-001`, `click-001`, `scroll-001`).

### Requirement 2: Registry Manifest and Build Script Update

**User Story:** As a maintainer, I want the registry manifest and build script to support the new theme-based directory structure, so that registry JSON files are generated correctly for the new URL scheme.

#### Acceptance Criteria

1. THE `registry.json` manifest SHALL define each themed sound item with the name format `audio/{theme}/{semantic-name}` (e.g., `audio/minimal/click`)
2. THE Build_Script SHALL read source files from the new `registry/audx/audio/{theme}/{semantic-name}/` directory structure
3. THE Build_Script SHALL output registry item JSON files to `public/r/audio/{theme}/{semantic-name}.json`
4. WHEN the Build_Script generates a registry item JSON, THE Build_Script SHALL include `theme` and `semanticName` fields in the item metadata
5. THE Build_Script SHALL generate a registry catalog at `public/r/registry.json` that includes all themed sound items
6. IF the Build_Script encounters a missing source file, THEN THE Build_Script SHALL log an error message containing the file path and continue processing remaining items

### Requirement 3: Config Schema Update with Theme Field

**User Story:** As a developer, I want the `audx.config.json` to include a theme field, so that the CLI knows which theme to use when installing sounds.

#### Acceptance Criteria

1. THE Config SHALL include a `theme` field of type string that specifies the active Theme name
2. THE Config SHALL use `assets/audio` as the default value for the `soundDir` field instead of `src/sounds`
3. THE Config SHALL validate the `theme` field as a non-empty string using Zod schema validation
4. WHEN the Config is read and the `theme` field is missing, THE CLI SHALL report a validation error instructing the user to run `audx init`
5. THE Config SHALL remove the `installedSounds` record's nested `files` array in favor of a flat list of installed Semantic_Sound_Names

### Requirement 4: Init Command with Theme Selection

**User Story:** As a developer, I want `audx init` to ask me which theme to use, so that I can configure my project's sound theme upfront without manual mapping.

#### Acceptance Criteria

1. WHEN the user runs `audx init`, THE CLI SHALL prompt the user to select a Theme from a list of available themes
2. WHEN the user selects a Theme, THE CLI SHALL write the selected theme name to the `theme` field in `audx.config.json`
3. WHEN the user runs `audx init`, THE CLI SHALL set `soundDir` to `assets/audio` by default
4. WHEN `audx.config.json` already exists, THE CLI SHALL prompt the user for confirmation before overwriting
5. IF the user cancels the overwrite prompt, THEN THE CLI SHALL exit without modifying the existing Config
6. WHEN the user runs `audx init`, THE CLI SHALL detect the package manager and write it to the Config
7. WHEN the user runs `audx init` and no `package.json` exists, THE CLI SHALL exit with an error message stating that `audx init` must be run inside a Node.js project

### Requirement 5: Add Command with Theme-Aware Fetching

**User Story:** As a developer, I want `audx add click` to automatically fetch the correct themed version of the sound, so that I don't need to specify the theme name in every command.

#### Acceptance Criteria

1. WHEN the user runs `audx add <semantic-name>`, THE CLI SHALL read the `theme` field from the Config to determine which Theme variant to fetch
2. WHEN the CLI fetches a sound, THE CLI SHALL request the registry URL `{registryUrl}/r/audio/{theme}/{semantic-name}.json`
3. WHEN the CLI writes a Sound_Module file, THE CLI SHALL write it to `{soundDir}/{semantic-name}.ts` using only the Semantic_Sound_Name

4. WHEN a sound is successfully added, THE CLI SHALL record the Semantic_Sound_Name in the `installedSounds` list in the Config
5. IF the registry returns an HTTP error, THEN THE CLI SHALL display an error message containing the sound name and HTTP status code
6. WHEN the Config does not exist, THE CLI SHALL exit with an error message instructing the user to run `audx init`

### Requirement 6: Theme Switch Command

**User Story:** As a developer, I want `audx theme set playful` to switch all my installed sounds to the new theme in-place, so that I can change themes without bundle bloat or manual re-mapping.

#### Acceptance Criteria

1. WHEN the user runs `audx theme set <theme-name>`, THE CLI SHALL update the `theme` field in the Config to the specified theme name
2. WHEN the user runs `audx theme set <theme-name>`, THE CLI SHALL iterate over all entries in `installedSounds` and fetch the new theme variant for each Semantic_Sound_Name
3. WHEN the CLI fetches a new theme variant, THE CLI SHALL overwrite the existing Sound_Module file at `{soundDir}/{semantic-name}.ts` with the new theme's content
4. WHEN all sounds are successfully switched, THE CLI SHALL display a summary showing the number of sounds updated and the new theme name
5. IF the registry returns an HTTP error for a specific sound during theme switching, THEN THE CLI SHALL log a warning for that sound and continue processing remaining sounds
6. WHEN the Config does not exist, THE CLI SHALL exit with an error message instructing the user to run `audx init`

### Requirement 7: Bulk Install Command

**User Story:** As a developer, I want `audx install minimal pack` to install all 67 semantic sounds for a theme at once, so that I can quickly set up a complete sound library.

#### Acceptance Criteria

1. WHEN the user runs `audx install <theme-name> pack`, THE CLI SHALL fetch and install all Semantic_Sound_Names defined in the `SEMANTIC_SOUND_NAMES` list for the specified Theme
2. WHEN the CLI performs a bulk install, THE CLI SHALL write each Sound_Module to `{soundDir}/{semantic-name}.ts`
3. WHEN the CLI performs a bulk install, THE CLI SHALL overwrite any existing Sound_Module files without prompting
4. WHEN the bulk install completes, THE CLI SHALL update the Config `theme` field to the specified theme name
5. WHEN the bulk install completes, THE CLI SHALL record all installed Semantic_Sound_Names in the `installedSounds` list
6. WHEN the bulk install completes, THE CLI SHALL display a summary showing the total number of sounds installed
7. IF the registry returns an HTTP error for a specific sound during bulk install, THEN THE CLI SHALL log a warning for that sound and continue installing remaining sounds

### Requirement 8: Remove Deprecated Theme Mapping Workflow

**User Story:** As a developer, I want the manual theme mapping commands removed, so that the CLI surface is clean and I'm not confused by deprecated workflows.

#### Acceptance Criteria

1. THE CLI SHALL remove the `audx theme map` subcommand
2. THE CLI SHALL remove the `audx theme create` subcommand
3. THE CLI SHALL remove the `audx theme init` subcommand
4. THE CLI SHALL remove the `audx theme generate` subcommand
5. THE CLI SHALL remove the `audx theme list` subcommand
6. THE CLI SHALL remove the `audx.themes.json` file handling from all commands
7. THE CLI SHALL remove the `ThemeManager` module (`package/src/core/theme-manager.ts`)
8. THE CLI SHALL remove the `ThemeCodegen` module (`package/src/codegen/theme-codegen.ts`)
9. WHEN the user runs `audx theme`, THE CLI SHALL display help showing only the `set` subcommand

### Requirement 9: Update and Diff Commands Adaptation

**User Story:** As a developer, I want the `update` and `diff` commands to work with the new theme-based registry URLs, so that I can keep my sounds current.

#### Acceptance Criteria

1. WHEN the user runs `audx diff`, THE CLI SHALL check each installed Semantic_Sound_Name against the registry URL `{registryUrl}/r/audio/{theme}/{semantic-name}.json`
2. WHEN the user runs `audx update`, THE CLI SHALL fetch updated content from the registry URL `{registryUrl}/r/audio/{theme}/{semantic-name}.json` for each installed sound
3. WHEN the user runs `audx update <semantic-name>`, THE CLI SHALL update only the specified sound from the current theme
4. WHEN the `diff` command detects changes, THE CLI SHALL display the list of Semantic_Sound_Names that have available updates
5. IF the registry returns an HTTP error for a specific sound during diff or update, THEN THE CLI SHALL log a warning for that sound and continue processing remaining sounds

### Requirement 10: List Command Adaptation

**User Story:** As a developer, I want the `list` command to show sounds organized by theme, so that I can browse what's available in my current theme.

#### Acceptance Criteria

1. WHEN the user runs `audx list`, THE CLI SHALL display sounds from the registry catalog filtered to the current theme specified in the Config
2. WHEN the user runs `audx list --theme <theme-name>`, THE CLI SHALL display sounds filtered to the specified theme
3. THE CLI SHALL display each sound using its Semantic_Sound_Name in the list output
4. WHEN no sounds match the filter criteria, THE CLI SHALL display a message stating no sounds were found

### Requirement 11: Remove Command Adaptation

**User Story:** As a developer, I want the `remove` command to work with semantic sound names, so that I can uninstall sounds cleanly.

#### Acceptance Criteria

1. WHEN the user runs `audx remove <semantic-name>`, THE CLI SHALL delete the file at `{soundDir}/{semantic-name}.ts`
2. WHEN the user runs `audx remove <semantic-name>`, THE CLI SHALL remove the Semantic_Sound_Name from the `installedSounds` list in the Config
3. IF the specified Semantic_Sound_Name is not in the `installedSounds` list, THEN THE CLI SHALL display an error message listing the currently installed sounds
4. WHEN the sound file does not exist on disk but is listed in `installedSounds`, THE CLI SHALL still remove the entry from the Config and display a success message

### Requirement 12: Website Catalog Adaptation

**User Story:** As a user browsing audx.site, I want to see sounds organized by theme with semantic names, so that I can find and preview sounds intuitively.

#### Acceptance Criteria

1. THE Website SHALL display sounds grouped by Theme on the browse page
2. THE Website SHALL display each sound using its Semantic_Sound_Name as the primary label
3. WHEN a user views a sound detail page, THE Website SHALL show the install command as `npx audx add <semantic-name>`
4. WHEN a user views a sound detail page, THE Website SHALL show the import pattern as `import { <semanticName>Audio } from "@/assets/audio/<semantic-name>"`
5. THE Website audio data builder SHALL read the updated `registry.json` manifest and correctly parse the new item name format `audio/{theme}/{semantic-name}`

### Requirement 13: Generate Command Adaptation

**User Story:** As a developer, I want the `generate` command to write generated sounds to the new `assets/audio/` directory using semantic names, so that generated sounds are consistent with the new structure.

#### Acceptance Criteria

1. WHEN the user runs `audx generate <prompt>`, THE CLI SHALL write the generated Sound_Module to `{soundDir}/{name}.ts`
2. WHEN the user runs `audx generate <prompt> --name <name>`, THE CLI SHALL use the provided name as the Semantic_Sound_Name
3. WHEN a sound is generated, THE CLI SHALL record the name in the `installedSounds` list in the Config
4. THE generated Sound_Module SHALL use the same `AudioAsset` type import pattern as registry-installed sounds

### Requirement 14: Cleanup of Deprecated Artifacts

**User Story:** As a maintainer, I want all deprecated code, files, and references removed, so that the codebase is clean and maintainable.

#### Acceptance Criteria

1. THE codebase SHALL remove the `ThemeConfig` and `themeConfigSchema` types from `package/src/types.ts`
2. THE codebase SHALL remove the `removeSoundMappings` function references from the remove command
3. THE codebase SHALL remove the legacy `audx.themes.json` file handling from all modules
4. THE codebase SHALL update the `SEMANTIC_SOUND_NAMES` list to remain the single source of truth for valid sound names
5. THE codebase SHALL remove the `registryDependencies` pattern from themed sound registry items since each sound is self-contained with its dependencies
