# Requirements Document

## Introduction

This feature replaces the local filesystem-based persistence of user-generated themes with Vercel Blob storage. Currently, the `/api/save-theme` endpoint writes generated theme files to the server's local filesystem, which is ephemeral in Vercel's serverless environment. By uploading theme assets to Vercel Blob, each generated theme becomes instantly accessible via public URLs, enabling the CLI to fetch and install user-generated themes without a manual rebuild or redeploy step. The two pre-configured themes (minimal, playful) remain unchanged in the local registry. The theme detail page (`/themes/[name]`) is removed since only built-in themes exist as browsable pages.

## Glossary

- **Save_Theme_API**: The Next.js API route at `/api/save-theme` that receives generated theme data and persists it
- **Blob_Storage**: Vercel Blob storage service (`@vercel/blob`) used to store user-generated theme assets with public URLs
- **Theme_Pack**: A complete set of generated sound assets and a theme definition for a single user-generated theme
- **Theme_Definition**: A JSON object describing a theme's name, display name, description, author, and semantic-name-to-sound mappings
- **Sound_Asset**: A single generated audio file (MP3 base64) associated with a semantic sound name within a theme
- **Registry_Item_JSON**: A JSON file conforming to the CLI's `RegistryItem` schema, fetchable via HTTP, containing file content and metadata for a single sound asset
- **Theme_Registry_Index**: A JSON manifest listing all sound assets belonging to a user-generated theme, enabling the CLI to discover and install them
- **CLI**: The `@litlab/audx` command-line tool that fetches and installs registry items via HTTP
- **Built_In_Theme**: One of the two pre-configured themes (minimal, playful) that ship with the local registry and remain unchanged
- **Blob_URL**: A publicly accessible URL returned by the Vercel Blob `put()` API after uploading a file
- **Save_Success_Component**: The React component (`components/theme-editor/save-success.tsx`) that displays CLI install commands after a theme is saved
- **Theme_Persistence_Module**: The server-side module (`lib/theme-persistence.ts`) responsible for building and storing theme assets
- **Theme_Detail_Page**: The dynamic route at `/themes/[name]/page.tsx` that displays details for a single theme

## Requirements

### Requirement 1: Upload Sound Assets to Blob Storage

**User Story:** As a theme creator, I want my generated sound assets uploaded to Blob storage, so that each sound is accessible via a public URL without requiring a server redeploy.

#### Acceptance Criteria

1. WHEN the Save_Theme_API receives a valid theme save request, THE Theme_Persistence_Module SHALL upload each Sound_Asset to Blob_Storage as a Registry_Item_JSON file
2. WHEN a Sound_Asset is uploaded to Blob_Storage, THE Theme_Persistence_Module SHALL receive a Blob_URL for that asset
3. WHEN uploading a Sound_Asset, THE Theme_Persistence_Module SHALL construct a Registry_Item_JSON containing the TypeScript module source (with inline base64 data URI), metadata (duration, format, sizeKb, license, tags, semanticName, theme), and file path information
4. IF the Blob_Storage upload fails for any Sound_Asset, THEN THE Save_Theme_API SHALL return an HTTP 500 response with a descriptive error message
5. THE Theme_Persistence_Module SHALL upload each Registry_Item_JSON to a path following the pattern `themes/{themeName}/{assetName}.json` within Blob_Storage

### Requirement 2: Upload Theme Registry Index to Blob Storage

**User Story:** As a CLI user, I want a theme registry index stored in Blob storage, so that the CLI can discover all sounds belonging to a user-generated theme.

#### Acceptance Criteria

1. WHEN all Sound_Assets for a Theme_Pack have been uploaded, THE Theme_Persistence_Module SHALL upload a Theme_Registry_Index JSON file to Blob_Storage
2. THE Theme_Registry_Index SHALL contain the theme name, display name, description, author, and a list of all asset entries with their Blob_URLs and metadata
3. THE Theme_Persistence_Module SHALL upload the Theme_Registry_Index to the path `themes/{themeName}/index.json` within Blob_Storage
4. THE Theme_Registry_Index SHALL include a mappings object that maps each semantic sound name to its corresponding Blob_URL for the Registry_Item_JSON

### Requirement 3: Return Blob URLs in Save Response

**User Story:** As a frontend developer, I want the save API to return the Blob URLs for the saved theme, so that the UI can construct accurate CLI install commands.

#### Acceptance Criteria

1. WHEN a Theme_Pack is saved successfully, THE Save_Theme_API SHALL return a JSON response containing the Theme_Registry_Index Blob_URL
2. WHEN a Theme_Pack is saved successfully, THE Save_Theme_API SHALL return the theme name and the total count of uploaded assets in the response
3. IF a theme with the same name already exists in Blob_Storage, THEN THE Save_Theme_API SHALL return an HTTP 409 response with an error message indicating the theme already exists

### Requirement 4: Update Save Success UI with Blob-Based Install Commands

**User Story:** As a theme creator, I want the post-save UI to show working CLI commands that reference my theme's Blob URL, so that I can immediately install the theme in my project.

#### Acceptance Criteria

1. WHEN a theme is saved, THE Save_Success_Component SHALL display CLI commands that use the Theme_Registry_Index Blob_URL as the registry source
2. THE Save_Success_Component SHALL accept and display the Theme_Registry_Index Blob_URL provided by the save API response
3. THE Save_Success_Component SHALL remove the "View Theme" link that previously navigated to the Theme_Detail_Page

### Requirement 5: Remove Theme Detail Page

**User Story:** As a maintainer, I want the theme detail page removed, so that the codebase does not contain unused routes for user-generated themes.

#### Acceptance Criteria

1. THE application SHALL remove the `/themes/[name]/page.tsx` route file
2. WHEN a user navigates to `/themes/{name}`, THE application SHALL return a 404 response
3. THE application SHALL remove any navigation links that reference the `/themes/[name]` route from other components

### Requirement 6: Preserve Built-In Themes

**User Story:** As a user of built-in themes, I want the minimal and playful themes to remain unchanged, so that existing functionality is not disrupted.

#### Acceptance Criteria

1. THE Theme_Persistence_Module SHALL NOT modify the local registry files for Built_In_Themes (minimal.json, playful.json)
2. THE Theme_Persistence_Module SHALL NOT modify the registry.json file when saving user-generated themes
3. THE application SHALL continue to serve Built_In_Theme data from local JSON imports in the theme-data module

### Requirement 7: Remove Local Filesystem Writes for User-Generated Themes

**User Story:** As a platform operator, I want user-generated theme persistence to use only Blob storage, so that the save flow works correctly in Vercel's serverless environment.

#### Acceptance Criteria

1. THE Theme_Persistence_Module SHALL NOT write Sound_Asset files to the local filesystem when saving a user-generated theme
2. THE Theme_Persistence_Module SHALL NOT write theme definition JSON files to the local `registry/audx/themes/` directory
3. THE Theme_Persistence_Module SHALL NOT append entries to the local `registry.json` file

### Requirement 8: Duplicate Theme Name Detection via Blob Storage

**User Story:** As a theme creator, I want the system to prevent me from overwriting an existing theme, so that previously generated themes are not lost.

#### Acceptance Criteria

1. WHEN the Save_Theme_API receives a save request, THE Save_Theme_API SHALL check Blob_Storage for an existing Theme_Registry_Index at `themes/{themeName}/index.json`
2. IF a Theme_Registry_Index already exists for the given theme name, THEN THE Save_Theme_API SHALL return an HTTP 409 response
3. IF no Theme_Registry_Index exists for the given theme name, THEN THE Save_Theme_API SHALL proceed with the upload

### Requirement 9: Propagate Blob URL Through Theme Editor State

**User Story:** As a frontend developer, I want the theme editor state machine to carry the Blob URL from the save response to the success screen, so that accurate install commands are displayed.

#### Acceptance Criteria

1. WHEN the save API returns successfully, THE use_theme_editor hook SHALL store the Theme_Registry_Index Blob_URL in the editor state
2. WHEN the editor transitions to the "saved" phase, THE theme editor component SHALL pass the Theme_Registry_Index Blob_URL to the Save_Success_Component
