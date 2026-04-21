# Requirements Document

## Introduction

The audx CLI is a standalone npm package (`audx`) that provides a command-line interface for distributing and managing UI sounds. It replaces the current shadcn CLI approach with a purpose-built tool that understands the audx registry format, supports sound themes with semantic naming, and integrates with the ElevenLabs-powered sound generation API. The CLI is built in a `package/` directory at the workspace root and published independently to npm.

## Glossary

- **CLI**: The `audx` command-line interface tool, distributed as an npm package
- **Registry**: The audx sound catalog hosted at `https://audx.site`, serving individual sound items as JSON at `/r/{name}.json` and a full catalog at `/r/registry.json`
- **Registry_Item**: A JSON object conforming to the shadcn registry-item schema, containing name, type, title, description, files (with inline content), author, and meta fields
- **Sound_Module**: A TypeScript file that exports an `AudioAsset` object containing a base64-encoded `dataUri`, name, duration, format, license, and author
- **AudioAsset**: The TypeScript interface defining a sound's data structure: name (string), dataUri (string), duration (number), format ("mp3" | "wav" | "ogg"), license ("CC0" | "OGA-BY" | "MIT"), author (string)
- **Audio_Engine**: A framework-agnostic TypeScript module providing Web Audio API functions: `getAudioContext()`, `decodeAudioData()`, and `playAudio()`
- **Audio_Types**: The TypeScript module defining `AudioAsset`, `UseAudioOptions`, `PlayFunction`, `AudioControls`, and `UseAudioReturn` interfaces
- **Config_File**: The `audx.config.json` file in the user's project root that stores CLI configuration: output directory, registry URL, path aliases, and installed sounds
- **Theme_Config**: A JSON configuration mapping semantic sound names to installed Sound_Module file paths
- **Semantic_Sound_Name**: A predefined vocabulary of UI interaction names (e.g., "success", "error", "click", "back") used to reference sounds by purpose rather than file name
- **Theme**: A named collection of Semantic_Sound_Name-to-Sound_Module mappings (e.g., "minimal", "playful", "retro")
- **Sound_Generation_API**: The ElevenLabs-powered endpoint at `https://audx.site/api/generate-sound` that accepts a text prompt, optional duration (0.5–22s), and optional prompt_influence (0–1), returning audio/mpeg data
- **Path_Alias**: A TypeScript path mapping (e.g., `@/*` → `./*`) defined in the user's `tsconfig.json` that the CLI resolves when writing import statements in generated files
- **Package_Manager**: One of npm, pnpm, yarn, or bun, auto-detected from lock files in the user's project
- **Installed_Sounds_Manifest**: The section of Config_File that tracks which sounds are installed, their versions, and file paths

## Requirements

### Requirement 1: CLI Package Scaffolding

**User Story:** As a developer, I want the audx CLI to be a well-structured npm package in the `package/` directory, so that it can be published to npm and invoked via `npx audx` or installed globally.

#### Acceptance Criteria

1. THE CLI SHALL be structured as a standalone npm package in the `package/` directory with a `bin` entry pointing to the compiled entry point
2. THE CLI SHALL use TypeScript for all source code and compile to JavaScript for distribution
3. THE CLI SHALL use Commander.js as the command-line framework for parsing commands, options, and arguments
4. THE CLI SHALL support Node.js version 18 and above
5. THE CLI SHALL provide a top-level help command displaying all available subcommands and their descriptions
6. WHEN invoked without a subcommand, THE CLI SHALL display the help output

### Requirement 2: Project Initialization

**User Story:** As a developer, I want to initialize audx in my project, so that the CLI knows where to install sounds and how to resolve imports.

#### Acceptance Criteria

1. WHEN the user runs `audx init`, THE CLI SHALL create an `audx.config.json` file in the project root
2. WHEN the user runs `audx init`, THE CLI SHALL detect the project's Package_Manager by checking for lock files (`bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`) in order of precedence
3. WHEN the user runs `audx init`, THE CLI SHALL read the project's `tsconfig.json` to detect Path_Alias configurations
4. THE Config_File SHALL contain the following fields: `$schema`, `soundDir` (default: `src/sounds`), `libDir` (default: `src/lib`), `registryUrl` (default: `https://audx.site`), `packageManager` (auto-detected), `aliases` (resolved from tsconfig), and `installedSounds` (empty object)
5. WHEN a Config_File already exists, THE CLI SHALL prompt the user for confirmation before overwriting
6. IF the project directory does not contain a `package.json`, THEN THE CLI SHALL display an error message stating that `audx init` must be run inside a Node.js project

### Requirement 3: Add Sounds

**User Story:** As a developer, I want to add sounds from the audx registry to my project, so that I can use them in my application.

#### Acceptance Criteria

1. WHEN the user runs `audx add <sound-name>`, THE CLI SHALL fetch the Registry_Item from `{registryUrl}/r/{sound-name}.json`
2. WHEN the Registry_Item is fetched successfully, THE CLI SHALL write each file from the Registry_Item's `files` array into the appropriate project directory based on the file's `type` field: `registry:lib` files go to `libDir`, `registry:hook` files go to a `hooks` directory sibling to `libDir`
3. WHEN writing Sound_Module files, THE CLI SHALL rewrite `@/lib/audio-types` import paths to use the resolved Path_Alias from Config_File or relative paths
4. WHEN the user runs `audx add <name1> <name2> ...`, THE CLI SHALL install all specified sounds in a single operation
5. WHEN a sound has dependency files (Audio_Types, Audio_Engine), THE CLI SHALL install those dependency files only if they do not already exist in the target directory
6. WHEN a sound is installed successfully, THE CLI SHALL update the `installedSounds` section of Config_File with the sound name, installed file paths, and the registry version timestamp
7. IF the Registry_Item fetch returns a non-200 HTTP status, THEN THE CLI SHALL display an error message including the sound name and HTTP status code
8. IF the Config_File does not exist, THEN THE CLI SHALL display an error message instructing the user to run `audx init` first
9. WHEN a sound file already exists at the target path, THE CLI SHALL prompt the user for confirmation before overwriting

### Requirement 4: List Available Sounds

**User Story:** As a developer, I want to browse the available sounds in the audx registry, so that I can discover sounds to add to my project.

#### Acceptance Criteria

1. WHEN the user runs `audx list`, THE CLI SHALL fetch the catalog from `{registryUrl}/r/registry.json`
2. WHEN the catalog is fetched successfully, THE CLI SHALL display each sound item's name, description, duration, format, sizeKb, license, and tags in a formatted table
3. WHEN the user runs `audx list --tag <tag>`, THE CLI SHALL filter the displayed sounds to only those whose `meta.tags` array contains the specified tag
4. WHEN the user runs `audx list --search <query>`, THE CLI SHALL filter the displayed sounds to those whose name, description, or tags contain the query string (case-insensitive)
5. IF the catalog fetch fails, THEN THE CLI SHALL display an error message indicating the registry is unreachable

### Requirement 5: Sound Theme System — Initialization

**User Story:** As a developer, I want to create a sound theme configuration, so that I can reference sounds by semantic purpose (e.g., "success", "error") rather than file names.

#### Acceptance Criteria

1. WHEN the user runs `audx theme init`, THE CLI SHALL create a `audx.themes.json` file in the project root
2. THE Theme_Config SHALL define the Semantic_Sound_Name vocabulary: `success`, `error`, `warning`, `info`, `click`, `back`, `enter`, `delete`, `copy`, `paste`, `scroll`, `hover`, `toggle`, `notify`, `complete`, `loading`
3. THE Theme_Config SHALL contain a `themes` object with a `default` theme entry mapping each Semantic_Sound_Name to `null` (unmapped)
4. WHEN the user runs `audx theme init` and a Theme_Config already exists, THE CLI SHALL prompt the user for confirmation before overwriting

### Requirement 6: Sound Theme System — Mapping and Switching

**User Story:** As a developer, I want to map sounds to semantic names and switch between themes, so that I can change my app's entire sound palette by switching a single theme.

#### Acceptance Criteria

1. WHEN the user runs `audx theme set <theme-name>`, THE CLI SHALL set the `activeTheme` field in Theme_Config to the specified theme name
2. IF the specified theme name does not exist in Theme_Config, THEN THE CLI SHALL display an error listing available theme names
3. WHEN the user runs `audx theme map <semantic-name> <sound-name>`, THE CLI SHALL update the active theme's mapping to associate the Semantic_Sound_Name with the specified installed sound's file path
4. IF the specified Semantic_Sound_Name is not in the defined vocabulary, THEN THE CLI SHALL display an error listing valid semantic names
5. IF the specified sound is not installed, THEN THE CLI SHALL display an error instructing the user to run `audx add <sound-name>` first
6. WHEN the user runs `audx theme create <theme-name>`, THE CLI SHALL add a new theme entry to Theme_Config with all Semantic_Sound_Names mapped to `null`
7. WHEN the user runs `audx theme list`, THE CLI SHALL display all theme names and indicate which theme is active

### Requirement 7: Sound Theme System — Code Generation

**User Story:** As a developer, I want the CLI to generate a type-safe theme provider for my React app, so that I can use `play("success")` in my components.

#### Acceptance Criteria

1. WHEN the user runs `audx theme generate`, THE CLI SHALL generate a `sound-theme.ts` file in the configured `libDir`
2. THE generated `sound-theme.ts` SHALL export a `SemanticSoundName` type union containing all defined Semantic_Sound_Names
3. THE generated `sound-theme.ts` SHALL export a `soundThemes` object mapping each theme name to its Semantic_Sound_Name-to-AudioAsset mappings, importing the corresponding Sound_Modules
4. THE generated `sound-theme.ts` SHALL export a `play(name: SemanticSoundName)` function that plays the sound mapped to the given semantic name in the active theme using the Audio_Engine
5. THE generated `sound-theme.ts` SHALL export a `setSoundTheme(themeName: string)` function that switches the active theme at runtime
6. WHEN a Semantic_Sound_Name has no mapped sound (null) in the active theme, THE `play` function SHALL perform no action and produce no error
7. THE generated code SHALL use the resolved Path_Alias from Config_File for all import statements

### Requirement 8: Sound Generation

**User Story:** As a developer, I want to generate custom sounds via the audx CLI, so that I can create unique UI sounds without leaving my terminal.

#### Acceptance Criteria

1. WHEN the user runs `audx generate "<prompt>"`, THE CLI SHALL send a POST request to the Sound_Generation_API with the prompt text
2. WHEN the user specifies `--name <name>`, THE CLI SHALL use the provided name as the Sound_Module's `name` field and file name
3. WHEN the user does not specify `--name`, THE CLI SHALL derive a kebab-case name from the first three words of the prompt
4. WHEN the user specifies `--duration <seconds>`, THE CLI SHALL include `duration_seconds` in the API request (valid range: 0.5 to 22)
5. WHEN the Sound_Generation_API returns audio data successfully, THE CLI SHALL encode the audio as a base64 data URI, create a Sound_Module file, and install it into the configured `soundDir`
6. WHEN a generated sound is installed, THE CLI SHALL update the `installedSounds` section of Config_File
7. IF the Sound_Generation_API returns an error, THEN THE CLI SHALL display the error message from the response
8. IF the Config_File does not exist, THEN THE CLI SHALL display an error message instructing the user to run `audx init` first

### Requirement 9: Remove Sounds

**User Story:** As a developer, I want to remove installed sounds from my project, so that I can clean up sounds I no longer need.

#### Acceptance Criteria

1. WHEN the user runs `audx remove <sound-name>`, THE CLI SHALL delete the Sound_Module file associated with the specified sound from the project
2. WHEN a sound is removed, THE CLI SHALL remove the sound's entry from the `installedSounds` section of Config_File
3. WHEN a sound is removed, THE CLI SHALL remove any Theme_Config mappings that reference the removed sound, setting them back to `null`
4. IF the specified sound is not in the Installed_Sounds_Manifest, THEN THE CLI SHALL display an error listing currently installed sounds
5. WHEN the user runs `audx remove <name1> <name2> ...`, THE CLI SHALL remove all specified sounds in a single operation
6. THE CLI SHALL not remove shared dependency files (Audio_Types, Audio_Engine) if other installed sounds still depend on them

### Requirement 10: Diff and Update

**User Story:** As a developer, I want to check for updates to my installed sounds, so that I can keep my sound assets current with the registry.

#### Acceptance Criteria

1. WHEN the user runs `audx diff`, THE CLI SHALL fetch the current Registry_Item for each installed sound and compare the fetched file content against the locally installed file content
2. WHEN differences are found, THE CLI SHALL display the sound name and a summary indicating the file has changed
3. WHEN no differences are found for any installed sound, THE CLI SHALL display a message indicating all sounds are up to date
4. WHEN the user runs `audx update`, THE CLI SHALL fetch and overwrite all installed sounds that have differences with the registry version
5. WHEN the user runs `audx update <sound-name>`, THE CLI SHALL fetch and overwrite only the specified sound
6. WHEN a sound is updated, THE CLI SHALL update the version timestamp in the Installed_Sounds_Manifest
7. IF a fetch fails for a specific sound during diff or update, THEN THE CLI SHALL display a warning for that sound and continue processing remaining sounds

### Requirement 11: Configuration File Parsing and Validation

**User Story:** As a developer, I want the CLI to validate my configuration, so that misconfigured projects produce clear error messages.

#### Acceptance Criteria

1. THE CLI SHALL validate the Config_File structure on every command that reads it, checking for required fields: `soundDir`, `libDir`, `registryUrl`, `aliases`
2. IF the Config_File contains invalid JSON, THEN THE CLI SHALL display a parse error with the file path
3. IF the Config_File is missing required fields, THEN THE CLI SHALL display an error listing the missing fields
4. THE Config_File parser SHALL produce the same Config_File object when parsing a serialized and re-parsed Config_File (round-trip property)

### Requirement 12: Path Alias Resolution

**User Story:** As a developer, I want the CLI to correctly resolve TypeScript path aliases in generated files, so that imports work with my project's tsconfig configuration.

#### Acceptance Criteria

1. WHEN writing files, THE CLI SHALL read the user's `tsconfig.json` to extract `compilerOptions.paths` mappings
2. WHEN the user's tsconfig defines `@/*` as a path alias, THE CLI SHALL use `@/lib/audio-types` style imports in generated Sound_Modules
3. WHEN the user's tsconfig does not define path aliases, THE CLI SHALL use relative import paths (e.g., `../lib/audio-types`) in generated Sound_Modules
4. FOR ALL valid tsconfig path configurations, resolving an alias and then computing the relative path from the resolved location back to the alias SHALL produce the original alias (round-trip property)
