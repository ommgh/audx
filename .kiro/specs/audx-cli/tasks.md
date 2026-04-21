# Implementation Plan: audx-cli

## Overview

Build the `audx` CLI as a standalone npm package in the `package/` directory. The implementation follows a bottom-up approach: types and core services first, then commands, then code generation, wiring everything together at the end. Tests are interleaved with implementation to catch errors early.

## Tasks

- [x] 1. Set up package scaffolding and shared types
  - [x] 1.1 Initialize the `package/` directory with `package.json`, `tsconfig.json`, and project structure
    - Create `package/package.json` with `name: "audx"`, `bin` entry pointing to `dist/index.js`, dependencies on `commander` and `zod`
    - Create `package/tsconfig.json` configured for Node.js 18+ with ESM output
    - Create directory structure: `src/commands/`, `src/core/`, `src/codegen/`, `tests/properties/`, `tests/unit/`, `tests/integration/`
    - Add `vitest` and `fast-check` as dev dependencies
    - Create a `vitest.config.ts` for the package
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 1.2 Define shared TypeScript types in `src/types.ts`
    - Define `AudxConfig` type and `audxConfigSchema` Zod schema with all fields: `$schema`, `soundDir`, `libDir`, `registryUrl`, `packageManager`, `aliases`, `installedSounds`
    - Define `ThemeConfig` type and `themeConfigSchema` Zod schema with `activeTheme` and `themes` fields
    - Define `SEMANTIC_SOUND_NAMES` const array with all 16 names: success, error, warning, info, click, back, enter, delete, copy, paste, scroll, hover, toggle, notify, complete, loading
    - Define `SemanticSoundName` type as union from the const array
    - Define `RegistryItem`, `RegistryFile`, `RegistryCatalog`, `AliasMap`, `GenerateSoundParams`, `PackageManager` types
    - _Requirements: 5.2, 11.1_

- [x] 2. Implement ConfigManager and validation
  - [x] 2.1 Implement `src/core/config.ts` — ConfigManager
    - Implement `read(projectRoot)`: read `audx.config.json`, parse JSON, validate with Zod schema
    - Implement `write(projectRoot, config)`: serialize config to JSON with 2-space indent, write to `audx.config.json`
    - Implement `validate(raw)`: parse unknown input through `audxConfigSchema`, throw on invalid
    - Implement `exists(projectRoot)`: check if `audx.config.json` exists
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]\* 2.2 Write property test for config round-trip (Property 1)
    - **Property 1: Config serialization round-trip**
    - Generate random valid `AudxConfig` objects, serialize to JSON, parse back, assert deep equality
    - **Validates: Requirements 11.4**

  - [ ]\* 2.3 Write property test for config validation rejects invalid configs (Property 15)
    - **Property 15: Config validation rejects invalid configs**
    - Generate JSON objects missing required fields, assert validator rejects with correct missing field names
    - **Validates: Requirements 11.1, 11.3**

  - [ ]\* 2.4 Write unit tests for ConfigManager
    - Test `read` with valid config file
    - Test `read` with invalid JSON (parse error)
    - Test `read` with missing required fields
    - Test `write` creates file with correct content
    - Test `exists` returns true/false correctly
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 3. Implement PackageManagerDetector and AliasResolver
  - [x] 3.1 Implement `src/core/package-manager.ts` — detect package manager from lock files
    - Implement `detectPackageManager(projectRoot)` checking for lock files in precedence order: `bun.lock` → `pnpm-lock.yaml` → `yarn.lock` → `package-lock.json` → default `npm`
    - Return `PackageManager` type
    - _Requirements: 2.2_

  - [ ]\* 3.2 Write property test for package manager detection precedence (Property 3)
    - **Property 3: Package manager detection precedence**
    - Generate random combinations of lock files, assert detection follows the defined precedence order
    - **Validates: Requirements 2.2**

  - [x] 3.3 Implement `src/core/alias-resolver.ts` — AliasResolver
    - Implement `loadFromTsConfig(projectRoot)`: read `tsconfig.json`, extract `compilerOptions.paths`, return `AliasMap`
    - Implement `resolveImport(aliasMap, sourceFilePath, targetModulePath)`: resolve a target module path to an aliased or relative import path
    - Implement `computeRelativePath(sourceFilePath, targetModulePath)`: compute relative path between two files, strip extensions
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]\* 3.4 Write property test for alias resolution round-trip (Property 2)
    - **Property 2: Alias resolution round-trip**
    - Generate random tsconfig path alias mappings and file paths, assert resolving and computing back produces the original path
    - **Validates: Requirements 12.4**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement RegistryClient and FileWriter
  - [x] 5.1 Implement `src/core/registry.ts` — RegistryClient
    - Implement `fetchItem(registryUrl, name)`: GET `{registryUrl}/r/{name}.json`, parse response, return `RegistryItem`
    - Implement `fetchCatalog(registryUrl)`: GET `{registryUrl}/r/registry.json`, parse response, return `RegistryCatalog`
    - Implement `generateSound(registryUrl, params)`: POST `{registryUrl}/api/generate-sound`, return raw audio `Buffer`
    - Handle HTTP errors: throw with sound name and status code for non-200 responses
    - Handle network errors: throw with registry URL and connection message
    - _Requirements: 3.1, 3.7, 4.1, 4.5, 8.1_

  - [x] 5.2 Implement `src/core/file-writer.ts` — FileWriter with import rewriting
    - Implement `writeRegistryFile(file, targetDir, aliasMap, config)`: determine target path from file type, write content with rewritten imports, return written path
    - Implement `rewriteImports(content, sourceFilePath, aliasMap, config)`: find `@/lib/` and `@/hooks/` import patterns, rewrite using alias map or relative paths
    - Route files by type: `registry:lib` → `libDir`, `registry:hook` → hooks dir sibling to `libDir`, sound files → `soundDir`
    - Skip writing dependency files that already exist (idempotent)
    - _Requirements: 3.2, 3.3, 3.5, 12.2, 12.3_

  - [ ]\* 5.3 Write property test for import rewriting correctness (Property 4)
    - **Property 4: Import rewriting correctness**
    - Generate TypeScript source with `@/lib/` and `@/hooks/` imports and various alias configs, assert rewritten paths resolve correctly
    - **Validates: Requirements 3.3, 12.2, 12.3**

  - [ ]\* 5.4 Write property test for file routing by registry type (Property 5)
    - **Property 5: File routing by registry type**
    - Generate registry items with varying file types, assert files are routed to correct directories
    - **Validates: Requirements 3.2**

  - [ ]\* 5.5 Write property test for dependency installation idempotence (Property 6)
    - **Property 6: Dependency installation idempotence**
    - Generate sets of installed files and registry items, assert applying add twice produces same state as once
    - **Validates: Requirements 3.5**

- [x] 6. Implement ThemeManager
  - [x] 6.1 Implement `src/core/theme-manager.ts` — ThemeManager
    - Implement `read(projectRoot)`: read `audx.themes.json`, parse, validate with Zod
    - Implement `write(projectRoot, config)`: serialize and write `audx.themes.json`
    - Implement `exists(projectRoot)`: check if theme config exists
    - Implement `setActiveTheme(config, themeName)`: return new config with updated `activeTheme`
    - Implement `mapSound(config, semanticName, soundPath)`: return new config with updated mapping in active theme
    - Implement `createTheme(config, themeName)`: return new config with new theme entry, all 16 semantic names mapped to `null`
    - Implement `removeSoundMappings(config, soundName)`: return new config with all references to the sound set to `null`
    - All mutation methods return new `ThemeConfig` (immutable pattern)
    - _Requirements: 5.1, 5.3, 6.1, 6.3, 6.6, 9.3_

  - [ ]\* 6.2 Write property test for theme mutation correctness (Property 9)
    - **Property 9: Theme mutation correctness**
    - Test: setActiveTheme updates only `activeTheme`; mapSound updates only the target mapping; createTheme adds entry with all 16 names as `null` and leaves existing themes unchanged
    - **Validates: Requirements 6.1, 6.3, 6.6**

  - [ ]\* 6.3 Write property test for remove updates config and theme mappings (Property 13)
    - **Property 13: Remove updates config and theme mappings**
    - Generate installed sounds and theme configs, assert removal clears the sound entry and nullifies theme references while preserving everything else
    - **Validates: Requirements 9.2, 9.3**

- [x] 7. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement ThemeCodegen
  - [x] 8.1 Implement `src/codegen/theme-codegen.ts` — generate `sound-theme.ts`
    - Implement `generate(themeConfig, aliasMap, config)`: produce TypeScript source string
    - Generated file exports: `SemanticSoundName` type union, `soundThemes` object, `play(name)` function, `setSoundTheme(themeName)` function
    - Import paths use resolved aliases from the alias map
    - `play` function no-ops when semantic name has no mapped sound (null)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]\* 8.2 Write property test for theme code generation correctness (Property 10)
    - **Property 10: Theme code generation correctness**
    - Generate random theme configs and alias maps, assert generated source contains `SemanticSoundName` type, `soundThemes` object, `play` function, `setSoundTheme` function, and correct import paths
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.7**

- [x] 9. Implement utility functions for generate command
  - [x] 9.1 Implement kebab-case name derivation and base64 encoding helpers
    - Implement `deriveKebabName(prompt)`: extract first three words, lowercase, join with hyphens, strip special characters
    - Implement `encodeAudioToDataUri(buffer)`: encode raw bytes as `data:audio/mpeg;base64,...` data URI
    - Implement `decodeDataUriToBuffer(dataUri)`: decode base64 portion back to bytes
    - These can live in a `src/core/utils.ts` or inline in the generate command
    - _Requirements: 8.3, 8.5_

  - [ ]\* 9.2 Write property test for kebab-case name derivation (Property 11)
    - **Property 11: Kebab-case name derivation**
    - Generate random non-empty prompt strings, assert derived name is valid kebab-case with at most three segments
    - **Validates: Requirements 8.3**

  - [ ]\* 9.3 Write property test for base64 audio encoding round-trip (Property 12)
    - **Property 12: Base64 audio encoding round-trip**
    - Generate random byte buffers, encode as data URI, decode back, assert identical to original
    - **Validates: Requirements 8.5**

- [x] 10. Implement CLI commands — init, add, list
  - [x] 10.1 Implement `src/commands/init.ts` — `audx init` command
    - Check for `package.json` existence, error if missing
    - Prompt for confirmation if `audx.config.json` already exists
    - Detect package manager via `detectPackageManager`
    - Load alias map via `loadFromTsConfig`
    - Create default `AudxConfig` with detected values and write via ConfigManager
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 10.2 Implement `src/commands/add.ts` — `audx add <sounds...>` command
    - Accept one or more sound names as variadic arguments
    - Validate config exists, read config
    - For each sound: fetch registry item, write files via FileWriter, update `installedSounds` in config
    - Prompt on file conflicts (existing files)
    - Handle HTTP errors with sound name and status code
    - Skip dependency files that already exist
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]\* 10.3 Write property test for install updates config manifest (Property 7)
    - **Property 7: Install updates config manifest**
    - Generate sound names and existing config, assert `installedSounds` contains new entry with correct paths and valid ISO timestamp, and previous entries are unchanged
    - **Validates: Requirements 3.6, 8.6**

  - [x] 10.4 Implement `src/commands/list.ts` — `audx list` command
    - Fetch catalog via RegistryClient
    - Display formatted table with name, description, duration, format, sizeKb, license, tags
    - Support `--tag <tag>` filter: include only items whose `meta.tags` contains the tag
    - Support `--search <query>` filter: case-insensitive match on name, description, or tags
    - Handle fetch failures with error message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 10.5 Write property test for list filtering correctness (Property 8)
    - **Property 8: List filtering correctness**
    - Generate random catalog items with tags and descriptions, assert tag filter returns exactly matching items, search filter returns exactly case-insensitive matches
    - **Validates: Requirements 4.3, 4.4**

- [x] 11. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement CLI commands — remove, diff, update, generate
  - [x] 12.1 Implement `src/commands/remove.ts` — `audx remove <sounds...>` command
    - Accept one or more sound names as variadic arguments
    - Validate config exists, read config
    - For each sound: delete sound module file, update `installedSounds`, update theme mappings via ThemeManager
    - Preserve shared dependency files still referenced by other installed sounds
    - Error if sound is not installed, listing installed sounds
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]\* 12.2 Write property test for shared dependency preservation on remove (Property 14)
    - **Property 14: Shared dependency preservation on remove**
    - Generate sets of installed sounds sharing dependency files, assert removing one sound preserves shared deps still referenced by others
    - **Validates: Requirements 9.6**

  - [x] 12.3 Implement `src/commands/diff.ts` — `audx diff` command
    - Read config, iterate installed sounds
    - For each: fetch current registry item, compare file content against local files
    - Display changed sound names or "all up to date" message
    - Continue on individual fetch failures with warning
    - _Requirements: 10.1, 10.2, 10.3, 10.7_

  - [x] 12.4 Implement `src/commands/update.ts` — `audx update [sound-name]` command
    - If sound name provided, update only that sound; otherwise update all with differences
    - Fetch registry item, overwrite local files, update timestamp in config
    - Continue on individual fetch failures with warning
    - _Requirements: 10.4, 10.5, 10.6, 10.7_

  - [x] 12.5 Implement `src/commands/generate.ts` — `audx generate "<prompt>"` command
    - Accept prompt as argument, optional `--name` and `--duration` flags
    - Validate config exists
    - Derive kebab-case name from prompt if `--name` not provided
    - POST to generation API via RegistryClient
    - Encode response as base64 data URI, create Sound_Module file, write to `soundDir`
    - Update `installedSounds` in config
    - Handle API errors
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 13. Implement CLI commands — theme subcommands
  - [x] 13.1 Implement `src/commands/theme.ts` — all theme subcommands
    - `audx theme init`: create `audx.themes.json` with default theme, prompt if exists
    - `audx theme set <theme-name>`: set active theme, error if theme doesn't exist
    - `audx theme map <semantic-name> <sound-name>`: map semantic name to installed sound path in active theme, validate semantic name and sound installation
    - `audx theme create <theme-name>`: add new theme with all 16 names mapped to `null`
    - `audx theme list`: display all themes, indicate active theme
    - `audx theme generate`: generate `sound-theme.ts` via ThemeCodegen, write to `libDir`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1_

- [x] 14. Wire up CLI entry point
  - [x] 14.1 Implement `src/index.ts` — Commander.js program setup
    - Create Commander program with name `audx`, version from `package.json`, description
    - Register all commands: `init`, `add`, `list`, `remove`, `diff`, `update`, `generate`, `theme` (with subcommands)
    - Display help when invoked without subcommand
    - Add shebang line `#!/usr/bin/env node`
    - Ensure all errors write to stderr, normal output to stdout
    - Exit code 0 for success, 1 for user errors, 2 for network errors
    - _Requirements: 1.3, 1.5, 1.6_

  - [ ]\* 14.2 Write unit tests for command integration
    - Test `init` creates config with correct defaults
    - Test `init` fails without `package.json`
    - Test `add` fails without config
    - Test `remove` fails for non-installed sound
    - Test `list` displays formatted output
    - Test `theme init` creates correct default structure
    - Test `theme list` shows active indicator
    - Test `diff` shows up-to-date message when no changes
    - _Requirements: 1.5, 2.1, 2.6, 3.8, 4.2, 5.1, 6.7, 9.4, 10.3_

- [x] 15. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 15 universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript, Commander.js, Zod, vitest, and fast-check as specified in the design
