# Requirements Document

## Introduction

Refinements to the theme generation flow at `/themes/create`. Four areas of change: removing cost/credit estimation logic from all theme editor components and state, redesigning the PreviewPlayer component from a list to a responsive grid of category cards, redesigning the ThemeReview component to use a hybrid view with collapsible category accordions containing sound grids, and improving API request throttling to prevent rate limiting when generating 67 sounds against the ElevenLabs API. Sound effect generation duration is fixed to 1 second for all theme generation.

## Glossary

- **Theme_Editor**: The orchestrator component (`ThemeEditor`) and its child components that manage the full theme creation flow at `/themes/create`.
- **Use_Theme_Editor_Hook**: The `useThemeEditor` React hook that manages all state, actions, and computed values for the theme editor flow.
- **Prompt_Form**: The form component (`PromptForm`) where users enter a theme name, prompt, and initiate preview generation.
- **Preview_Player**: The component (`PreviewPlayer`) that displays generated preview sounds and allows the user to approve or reject them before full generation.
- **Theme_Review**: The component (`ThemeReview`) that displays all generated sounds after full generation, allowing playback, retry, and save.
- **Generation_Progress**: The component (`GenerationProgress`) that shows real-time progress during sound generation.
- **Cost_Estimate**: The `CostEstimate` type and `estimateCost()` function from `lib/credit-cost.ts` used to compute credit costs.
- **PREVIEW_SOUNDS**: The array of 10 representative sound names (one per category) used for the preview generation phase.
- **SOUND_PROMPT_TEMPLATES**: The record mapping each semantic sound name to its prompt template, category, UX context, duration range, and default duration.
- **Category_Card**: A UI card element in the Preview_Player grid that groups a single preview sound under its category heading.
- **Sound_Grid**: A responsive grid layout used inside Theme_Review category sections to display individual sounds as grid items.
- **Generate_Page**: The `/generate` page and its `useSoundGenerator` hook, which has independent duration control and is not affected by these changes.
- **Generate_Theme_Route**: The API route handler (`app/api/generate-theme/route.ts`) that processes theme generation requests, calls the ElevenLabs sound generation API, and streams results back via SSE.
- **Inter_Request_Delay**: A configurable pause (in milliseconds) inserted between consecutive ElevenLabs API calls within the server-side generation pipeline to avoid triggering rate limits.
- **Estimated_Time**: A time estimate displayed in the Generation_Progress component to inform users how long the full generation is expected to take.

## Requirements

### Requirement 1: Remove Cost Estimation from Theme Editor Hook

**User Story:** As a developer maintaining the theme editor, I want cost estimation logic removed from the theme editor hook, so that the codebase is simpler and the UI no longer displays cost information.

#### Acceptance Criteria

1. THE Use_Theme_Editor_Hook SHALL NOT export `previewCost` or `fullCost` computed values.
2. THE Use_Theme_Editor_Hook SHALL NOT import `CostEstimate` type or `estimateCost` function from `lib/credit-cost.ts`.
3. THE Use_Theme_Editor_Hook SHALL NOT compute cost estimates using `PREVIEW_SOUNDS` durations or `SEMANTIC_SOUND_NAMES` durations.
4. WHEN the `useThemeEditor` return type is consumed by Theme_Editor, THE Theme_Editor SHALL NOT destructure or pass `previewCost` or `fullCost` to child components.

### Requirement 2: Remove Cost Display from Prompt Form

**User Story:** As a user creating a theme, I want the prompt form to focus on theme creation without cost information, so that the interface is cleaner.

#### Acceptance Criteria

1. THE Prompt_Form SHALL NOT accept a `previewCost` prop of type `CostEstimate`.
2. THE Prompt_Form SHALL NOT import the `CostEstimate` type from `lib/credit-cost.ts`.
3. THE Prompt_Form SHALL NOT render a cost label string containing credits or dollar amounts.
4. THE Prompt_Form SHALL render the "Generate Preview" submit button without an adjacent cost estimate.

### Requirement 3: Remove Cost Display from Preview Player

**User Story:** As a user reviewing preview sounds, I want the preview player to focus on sound playback without cost information, so that the interface is cleaner.

#### Acceptance Criteria

1. THE Preview_Player SHALL NOT accept a `fullCost` prop of type `CostEstimate`.
2. THE Preview_Player SHALL NOT import the `CostEstimate` type from `lib/credit-cost.ts`.
3. THE Preview_Player SHALL NOT render a "Full generation cost" label or any cost-related text.

### Requirement 4: Fix Theme Generation Duration to 1 Second

**User Story:** As a user creating a theme, I want all theme-generated sounds to use a consistent 1-second duration, so that the preview and full generation produce uniform sound lengths.

#### Acceptance Criteria

1. WHEN the Use_Theme_Editor_Hook sends sound generation requests via `fetchSSE`, THE Use_Theme_Editor_Hook SHALL set the `duration` field to `1` for every sound in the request payload.
2. WHEN the Use_Theme_Editor_Hook retries a failed sound via `retrySound`, THE Use_Theme_Editor_Hook SHALL set the `duration` field to `1` for the retry request payload.
3. THE Use_Theme_Editor_Hook SHALL NOT use `template.defaultDuration` or any per-sound duration value when constructing theme generation requests.
4. THE Generate_Page SHALL continue to use its own `durationSeconds` state from `useSoundGenerator` without modification.

### Requirement 5: Redesign Preview Player as Responsive Grid

**User Story:** As a user reviewing preview sounds, I want to see them in a responsive grid of category cards, so that I can quickly scan and play each preview sound.

#### Acceptance Criteria

1. THE Preview_Player SHALL render preview sounds as a responsive grid layout instead of a vertical list of collapsible accordion sections.
2. WHEN the viewport width accommodates multiple columns, THE Preview_Player SHALL display Category_Card items in a multi-column grid (at least 2 columns on medium screens, at least 3 columns on large screens).
3. WHEN the viewport is narrow (mobile), THE Preview_Player SHALL display Category_Card items in a single-column layout.
4. THE Preview_Player SHALL render each Category_Card with a category name header and the sound name with a play button inside the card.
5. WHEN a preview sound has status "completed", THE Preview_Player SHALL render a play button that plays the sound audio on activation.
6. WHEN a preview sound has status "failed", THE Preview_Player SHALL render a retry button that triggers `onRetrySound` with the sound's semantic name.
7. THE Preview_Player SHALL render "Try Again" and "Approve & Generate Full Theme" action buttons below the grid.

### Requirement 6: Redesign Theme Review with Hybrid Grid Layout

**User Story:** As a user reviewing all generated sounds, I want category sections to remain collapsible while individual sounds within each category are displayed in a grid, so that I can efficiently browse and play sounds.

#### Acceptance Criteria

1. THE Theme_Review SHALL render top-level categories as collapsible accordion sections (preserving existing expand/collapse behavior).
2. WHEN a category section is expanded, THE Theme_Review SHALL render the sounds within that category as a responsive Sound_Grid instead of a vertical list.
3. WHEN the viewport width accommodates multiple columns, THE Sound_Grid SHALL display sound items in a multi-column grid (at least 2 columns on medium screens, at least 3 columns on large screens).
4. WHEN the viewport is narrow (mobile), THE Sound_Grid SHALL display sound items in a single-column layout.
5. WHEN a sound has status "completed", THE Theme_Review SHALL render a play button, duration label, and estimated file size for that sound.
6. WHEN a sound has status "failed", THE Theme_Review SHALL render a retry button that triggers `onRetrySound` with the sound's semantic name.
7. THE Theme_Review SHALL continue to display summary statistics (sounds generated count, failed count, generation time) above the category sections.
8. THE Theme_Review SHALL render the "Save Theme" button below the category sections with the existing enable/disable logic based on completion count.

### Requirement 7: Rate-Limit-Safe API Request Throttling

**User Story:** As a user generating a full 67-sound theme, I want the server-side generation pipeline to throttle requests to the ElevenLabs API, so that the generation completes reliably without being rate-limited or banned.

#### Acceptance Criteria

1. THE Generate_Theme_Route SHALL limit concurrent ElevenLabs API requests to a maximum of 2 simultaneous requests (matching the lowest common denominator across ElevenLabs plan tiers).
2. THE Generate_Theme_Route SHALL insert an Inter_Request_Delay of at least 1.5 seconds between completing one ElevenLabs API call and starting the next one within the concurrency pool.
3. WHEN the ElevenLabs API returns HTTP 429 (rate limit exceeded), THE Generate_Theme_Route SHALL respect the `retry-after` response header if present, or wait a minimum of 5 seconds before retrying.
4. WHEN the ElevenLabs API returns HTTP 429, THE Generate_Theme_Route SHALL use exponential backoff with a base delay of 2 seconds for subsequent retries on the same sound, up to the existing MAX_RETRIES limit.
5. THE Generate_Theme_Route SHALL NOT change behavior for single-sound retry requests (1 sound in the payload), preserving the existing retry logic for individual sound retries from the UI.

### Requirement 8: Display Estimated Generation Time in Progress View

**User Story:** As a user waiting for theme generation, I want to see an estimated time remaining so that I know the process will take a while and can plan accordingly.

#### Acceptance Criteria

1. THE Generation_Progress component SHALL display an estimated total generation time message (e.g., "This may take a few minutes") when the generation starts.
2. THE Generation_Progress component SHALL display an elapsed time counter that updates in real-time during generation, showing how long the generation has been running.
3. THE Generation_Progress component SHALL compute and display an estimated time remaining based on the current progress rate (completed sounds / elapsed time × remaining sounds).
4. WHEN fewer than 2 sounds have completed, THE Generation_Progress component SHALL display "Estimating…" instead of a numeric time remaining, to avoid inaccurate early estimates.
