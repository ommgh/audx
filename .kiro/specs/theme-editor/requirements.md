# Requirements Document

## Introduction

The Theme Editor is the core differentiator feature for audx. It enables users to describe a mood or style via a text prompt, then uses the ElevenLabs Sound Effects API to generate all 65 semantic sounds in that style as a complete theme pack. Generated packs are saved server-side so other users can browse and install them via the audx CLI. The feature introduces a two-phase generation flow — a 10-sound preview (one per category) to evaluate the style cheaply, followed by full 65-sound generation on confirmation. The existing `/generate` page remains a single-sound tool, while the Theme Editor becomes the full-pack experience at `/themes/create`.

## Glossary

- **Theme_Editor**: The web page and associated backend that lets users create new themes by describing a mood/style and generating sounds via the ElevenLabs API
- **Theme_Prompt**: A user-provided text description of the desired mood/style for a theme (e.g., "warm wooden textures", "futuristic digital")
- **Sound_Prompt**: A per-sound text prompt derived by combining the Theme_Prompt with the semantic name's UX purpose and category context
- **Preview_Generation**: The first phase of theme creation where 10 representative sounds (one per category) are generated to let the user evaluate the style before committing to full generation
- **Full_Generation**: The second phase where all 65 semantic sounds are generated after the user approves the preview
- **Generation_Job**: A server-side record tracking the progress and results of a batch sound generation request
- **Theme_Pack**: A complete set of generated sound assets for all 65 semantic names, saved as a named theme that can be browsed and installed
- **ElevenLabs_API**: The ElevenLabs Sound Effects API at `https://api.elevenlabs.io/v1/sound-generation` used to generate individual sounds
- **Concurrency_Limit**: The maximum number of simultaneous ElevenLabs API requests (2 for free tier, higher for paid tiers)
- **Credit_Cost**: The ElevenLabs credit cost per sound generation (~20 credits/second with explicit duration, ~100 credits without)
- **Semantic_Sound_Name**: A string identifier referencing a sound by its UX purpose (65 total, defined in `SEMANTIC_SOUND_NAMES`)
- **Category**: One of the 10 groupings of semantic sound names (interaction, navigation, feedback, notification, transition, destructive, progress, clipboard, state, media)
- **Theme_Definition**: A JSON file in `registry/audx/themes/` that maps semantic names to sound asset paths
- **Progress_Tracker**: A UI component that displays real-time generation status for each sound in a batch

## Requirements

### Requirement 1: Theme Editor Page

**User Story:** As a developer, I want a dedicated page where I can describe a mood or style and generate a complete sound theme, so that I can create custom-branded audio for my application without manually generating 65 individual sounds.

#### Acceptance Criteria

1. THE Theme_Editor SHALL be accessible at the `/themes/create` URL path
2. THE Theme_Editor SHALL display a text input for the user to enter a Theme_Prompt describing the desired mood/style
3. THE Theme_Editor SHALL display a text input for the user to enter a theme name (used as the identifier for the generated Theme_Pack)
4. THE Theme_Editor SHALL validate that the theme name contains only lowercase letters, numbers, and hyphens
5. THE Theme_Editor SHALL validate that the Theme_Prompt is between 1 and 300 characters
6. THE Theme_Editor SHALL display example Theme_Prompts as clickable suggestion chips (e.g., "warm wooden textures", "futuristic digital", "retro arcade", "soft organic")
7. THE Theme_Editor SHALL be accessible from the site header navigation and from the `/themes` page
8. THE Theme_Editor SHALL use server-side rendering for the initial page shell and client-side interactivity for the generation flow

### Requirement 2: Sound Prompt Engineering

**User Story:** As a developer, I want the system to automatically craft effective per-sound prompts from my high-level mood description, so that each generated sound is both stylistically consistent and appropriate for its semantic purpose.

#### Acceptance Criteria

1. WHEN the user initiates generation, THE Theme_Editor SHALL derive a Sound_Prompt for each Semantic_Sound_Name by combining the Theme_Prompt with the sound's UX purpose and Category context
2. THE Sound_Prompt SHALL include the semantic name's interaction context (e.g., "button click", "navigation back", "error alert") to guide the ElevenLabs_API toward appropriate sound characteristics
3. THE Sound_Prompt SHALL include material or texture descriptors from the Theme_Prompt to maintain stylistic consistency across all sounds in the theme
4. THE Sound_Prompt SHALL be no longer than 500 characters to comply with the ElevenLabs_API text parameter limit
5. THE Theme_Editor SHALL assign a duration between 0.1 and 2.0 seconds for each sound based on its Category and semantic purpose (e.g., clicks: 0.1–0.3s, notifications: 0.5–1.5s, transitions: 0.3–1.0s)

### Requirement 3: Preview Generation (Cost-Saving First Phase)

**User Story:** As a developer, I want to hear a small sample of generated sounds before committing to the full 65-sound generation, so that I can evaluate the style and avoid wasting credits on a theme I do not like.

#### Acceptance Criteria

1. WHEN the user submits a Theme_Prompt, THE Theme_Editor SHALL first generate a Preview_Generation of 10 sounds — one representative sound per Category
2. THE Theme_Editor SHALL select the most representative Semantic_Sound_Name from each Category for the preview (e.g., "click" for interaction, "back" for navigation, "success" for feedback)
3. WHEN the Preview_Generation completes, THE Theme_Editor SHALL display all 10 preview sounds with playback controls organized by Category
4. THE Theme_Editor SHALL display the estimated Credit_Cost for the full 65-sound generation alongside the preview results
5. WHEN the user approves the preview, THE Theme_Editor SHALL proceed to Full_Generation for the remaining 55 sounds
6. WHEN the user rejects the preview, THE Theme_Editor SHALL allow the user to modify the Theme_Prompt and regenerate the preview without additional cost for the rejected sounds
7. IF any preview sound fails to generate, THEN THE Theme_Editor SHALL display an error indicator for that sound and allow the user to retry generation for the failed sound individually

### Requirement 4: Full Theme Generation with Progress Tracking

**User Story:** As a developer, I want to see real-time progress as all 65 sounds are generated, so that I know how long the process will take and can monitor for any failures.

#### Acceptance Criteria

1. WHEN Full_Generation begins, THE Theme_Editor SHALL generate all remaining sounds (those not already generated in the preview) by calling the ElevenLabs_API individually for each sound
2. THE Theme_Editor SHALL limit concurrent ElevenLabs_API requests to a configurable Concurrency_Limit (default: 2) to respect rate limits
3. WHILE Full_Generation is in progress, THE Progress_Tracker SHALL display the status of each sound: pending, generating, completed, or failed
4. WHILE Full_Generation is in progress, THE Progress_Tracker SHALL display the overall progress as a count and percentage (e.g., "32/65 sounds generated — 49%")
5. WHILE Full_Generation is in progress, THE Progress_Tracker SHALL organize sound statuses by Category in collapsible sections
6. IF a sound generation fails, THEN THE Theme_Editor SHALL retry the failed sound up to 2 additional times before marking it as permanently failed
7. WHEN Full_Generation completes, THE Theme_Editor SHALL display a summary showing total sounds generated, total failures, and total generation time
8. THE Theme_Editor SHALL allow the user to retry individually failed sounds after Full_Generation completes

### Requirement 5: Batch Generation API Route

**User Story:** As a frontend developer, I want a backend API that handles batch sound generation with proper rate limiting and error handling, so that the Theme_Editor can generate multiple sounds reliably.

#### Acceptance Criteria

1. THE Website SHALL provide a POST API route at `/api/generate-theme` that accepts a theme name, Theme_Prompt, and a list of sounds to generate (each with semantic name and duration)
2. WHEN the API route receives a valid request, THE API route SHALL call the ElevenLabs_API sequentially for each sound with the configured Concurrency_Limit
3. THE API route SHALL stream progress updates to the client using Server-Sent Events (SSE) so the frontend can display real-time generation status
4. WHEN a sound is successfully generated, THE API route SHALL encode the audio as a base64 data URI and include it in the progress event
5. IF the ElevenLabs_API returns a rate limit error (HTTP 429), THEN THE API route SHALL wait and retry the request after the indicated retry-after period
6. IF the ElevenLabs_API returns a server error (HTTP 5xx), THEN THE API route SHALL retry the request up to 2 times with exponential backoff
7. IF the `ELEVENLABS_API_KEY` environment variable is not set, THEN THE API route SHALL return a 500 error with a descriptive message
8. THE API route SHALL validate the request body using a Zod schema, rejecting invalid theme names, empty prompts, or sounds with out-of-range durations

### Requirement 6: Theme Pack Persistence

**User Story:** As a developer, I want my generated theme to be saved so that other users can browse and install it, so that the community benefits from shared theme packs.

#### Acceptance Criteria

1. WHEN Full_Generation completes successfully (with at least 60 of 65 sounds generated), THE Theme_Editor SHALL save the generated sounds as a Theme_Pack
2. THE Theme_Pack SHALL be saved as a Theme_Definition JSON file in `registry/audx/themes/{theme-name}.json` following the same schema as the existing minimal and playful themes
3. THE Theme_Pack SHALL save each generated sound as a TypeScript module in `registry/audx/audio/{semantic-name}-{theme-name}-001/{semantic-name}-{theme-name}-001.ts` following the existing Sound_Asset format
4. THE Theme_Pack SHALL register each sound asset in `registry.json` with accurate metadata including duration, format, sizeKb, license, tags, theme, and semanticName fields
5. WHEN a Theme_Pack is saved, THE Theme_Editor SHALL run the registry build step to generate `public/r/*.json` files for the new assets
6. IF a theme with the same name already exists, THEN THE Theme_Editor SHALL prompt the user to choose a different name rather than overwriting

### Requirement 7: Generated Sound Playback and Review

**User Story:** As a developer, I want to listen to each generated sound and review the complete theme before it is published, so that I can ensure quality before sharing with the community.

#### Acceptance Criteria

1. WHEN a sound is generated, THE Theme_Editor SHALL provide an inline playback button for that sound using the Web Audio API
2. THE Theme_Editor SHALL display all generated sounds organized by Category with collapsible sections, consistent with the existing Theme_Detail_Page layout
3. WHEN the user clicks a sound entry, THE Theme_Editor SHALL play the sound immediately
4. THE Theme_Editor SHALL display the duration and estimated file size for each generated sound
5. WHILE a sound is playing, THE Theme_Editor SHALL display a visual indicator (pulsing dot) on the active sound entry

### Requirement 8: Cost Estimation and Transparency

**User Story:** As a developer, I want to understand the credit cost before generating sounds, so that I can make informed decisions about when to generate and how to manage my ElevenLabs budget.

#### Acceptance Criteria

1. WHEN the user enters a Theme_Prompt, THE Theme_Editor SHALL display the estimated credit cost for the Preview_Generation (10 sounds)
2. WHEN the preview is approved, THE Theme_Editor SHALL display the estimated credit cost for the remaining Full_Generation (55 sounds)
3. THE Theme_Editor SHALL calculate credit costs using the formula: duration_seconds × 20 credits per sound (with explicit duration)
4. THE Theme_Editor SHALL display the approximate dollar cost alongside credit costs (using the rate of ~$0.07 per generation at business tier as a reference)
5. WHEN Full_Generation completes, THE Theme_Editor SHALL display the actual total credits consumed

### Requirement 9: Sound Prompt Template System

**User Story:** As a developer, I want the prompt engineering to be systematic and predictable, so that generated sounds are consistently high quality across all 65 semantic names.

#### Acceptance Criteria

1. THE Theme_Editor SHALL maintain a prompt template mapping that defines the base UX context for each Semantic_Sound_Name (e.g., click → "short UI button click", success → "positive confirmation chime")
2. THE prompt template mapping SHALL define a recommended duration range for each Semantic_Sound_Name based on its typical UX usage
3. THE Theme_Editor SHALL construct each Sound_Prompt by combining: the base UX context from the template, the user's Theme_Prompt mood/style descriptors, and the Category context
4. THE prompt template mapping SHALL be defined as a TypeScript constant for type safety and maintainability
5. WHEN a Sound_Prompt is constructed, THE Theme_Editor SHALL ensure the combined prompt does not exceed 500 characters by truncating the mood descriptors if necessary

### Requirement 10: Theme Editor Navigation Integration

**User Story:** As a developer, I want the Theme Editor to be easily discoverable from the existing theme browsing experience, so that I can seamlessly move from browsing themes to creating my own.

#### Acceptance Criteria

1. THE `/themes` page SHALL display a prominent "Create Theme" call-to-action that links to the Theme_Editor
2. THE site header navigation SHALL include a link to the Theme_Editor accessible from all pages
3. WHEN a theme is successfully generated and saved, THE Theme_Editor SHALL display a link to the new theme's detail page at `/themes/[name]`
4. WHEN a theme is successfully generated and saved, THE Theme_Editor SHALL display the CLI installation commands for the new theme
