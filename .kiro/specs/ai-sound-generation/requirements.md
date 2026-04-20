# Requirements Document

## Introduction

This feature adds an AI-powered sound generation page to the audx project, allowing users to describe a UI sound in natural language and generate custom audio using the ElevenLabs Sound Effects API. The page provides a prompt input with suggestion chips, configurable generation parameters (duration, prompt influence, loop), and inline playback/download of the generated audio. This is Phase 2 of the audx project, extending the existing sound library with on-demand AI generation.

## Glossary

- **Generator_Page**: The dedicated `/generate` page in the audx app where users create AI-generated sounds
- **Prompt_Input**: The text input field where users describe the sound they want to generate
- **Suggestion_Chip**: A clickable tag/pill displayed above the Prompt_Input that pre-fills the input with a common sound description
- **Controls_Bar**: The row of generation parameter controls displayed below the Prompt_Input (duration, prompt influence, loop toggle)
- **Generate_Button**: The submit button that triggers the sound generation API call
- **Audio_Player**: The inline playback UI that appears after a sound is successfully generated, allowing the user to listen to and download the result
- **Generation_API_Route**: The Next.js API route (`/api/generate-sound`) that proxies requests to the ElevenLabs Sound Effects API
- **ElevenLabs_API**: The external ElevenLabs Sound Effects API endpoint (`POST https://api.elevenlabs.io/v1/sound-generation`)
- **Prompt_Influence**: A numeric parameter (0 to 1) controlling the balance between strict prompt adherence and creative variation in the generated audio
- **Duration_Seconds**: An optional numeric parameter specifying the target length of the generated audio in seconds

## Requirements

### Requirement 1: Generate Page Route and Layout

**User Story:** As a user, I want a dedicated page for generating AI sounds, so that I can access the generation tool without leaving the audx app.

#### Acceptance Criteria

1. WHEN a user navigates to `/generate`, THE Generator_Page SHALL render within the existing app layout (Header and Footer)
2. THE Generator_Page SHALL display a heading that communicates the AI sound generation purpose
3. THE Generator_Page SHALL support both light and dark themes consistent with the existing audx theme system

### Requirement 2: Suggestion Chips

**User Story:** As a user, I want to see suggested sound descriptions, so that I can quickly generate common UI sounds without typing a prompt from scratch.

#### Acceptance Criteria

1. THE Generator_Page SHALL display a set of Suggestion_Chip elements above the Prompt_Input
2. WHEN a user clicks a Suggestion_Chip, THE Prompt_Input SHALL be populated with the text of that chip
3. THE Suggestion_Chip set SHALL include UI-relevant sound descriptions (e.g., "Soft click", "Notification chime", "Subtle whoosh", "Error buzz", "Success ding", "Keyboard tap")

### Requirement 3: Prompt Input

**User Story:** As a user, I want to type a natural language description of a sound, so that I can generate custom audio matching my intent.

#### Acceptance Criteria

1. THE Generator_Page SHALL display a Prompt_Input with placeholder text "Describe a sound..."
2. THE Prompt_Input SHALL accept free-form text input up to 500 characters
3. WHEN the Prompt_Input is empty, THE Generate_Button SHALL be visually disabled and non-interactive

### Requirement 4: Generation Controls

**User Story:** As a user, I want to configure generation parameters, so that I can control the duration and creative variation of the generated sound.

#### Acceptance Criteria

1. THE Controls_Bar SHALL display a Duration_Seconds control with a default value of "Auto" (no explicit duration sent to the API)
2. THE Controls_Bar SHALL allow the user to set Duration_Seconds to a value between 0.5 and 22 seconds
3. THE Controls_Bar SHALL display a Prompt_Influence slider with a range of 0 to 1 and a default value of 0.3
4. THE Controls_Bar SHALL display the Prompt_Influence value as a percentage label (e.g., "30%")

### Requirement 5: Sound Generation API Route

**User Story:** As a developer, I want a server-side API route that proxies requests to ElevenLabs, so that the API key is never exposed to the client.

#### Acceptance Criteria

1. WHEN the Generation_API_Route receives a POST request with a valid `text` field, THE Generation_API_Route SHALL forward the request to the ElevenLabs_API with the server-side API key from the `ELEVEN_LABS_API_KEY` environment variable
2. WHEN the ElevenLabs_API returns audio data, THE Generation_API_Route SHALL respond with the MP3 binary and a `Content-Type: audio/mpeg` header
3. IF the `text` field is missing or empty in the request body, THEN THE Generation_API_Route SHALL return a 400 status with a descriptive error message
4. IF the ElevenLabs_API returns an error response, THEN THE Generation_API_Route SHALL return an appropriate error status and message to the client without exposing the API key
5. THE Generation_API_Route SHALL forward optional `duration_seconds` and `prompt_influence` parameters to the ElevenLabs_API when provided

### Requirement 6: Sound Generation Trigger and Loading State

**User Story:** As a user, I want to trigger sound generation and see progress feedback, so that I know the system is working on my request.

#### Acceptance Criteria

1. WHEN the user clicks the Generate_Button with a non-empty prompt, THE Generator_Page SHALL send a POST request to the Generation_API_Route with the prompt text and configured parameters
2. WHILE the Generation_API_Route is processing, THE Generator_Page SHALL display a loading indicator on the Generate_Button and disable the Prompt_Input and Generate_Button
3. WHILE the Generation_API_Route is processing, THE Generator_Page SHALL prevent duplicate submissions

### Requirement 7: Audio Playback and Download

**User Story:** As a user, I want to listen to and download the generated sound, so that I can evaluate and use the result.

#### Acceptance Criteria

1. WHEN the Generation_API_Route returns audio data successfully, THE Generator_Page SHALL display an Audio_Player with play/pause controls
2. THE Audio_Player SHALL allow the user to play back the generated MP3 audio using the Web Audio API or an HTML audio element
3. THE Audio_Player SHALL provide a download button that saves the generated MP3 file to the user's device
4. WHEN a new sound is generated, THE Audio_Player SHALL replace the previously generated audio with the new result

### Requirement 8: Error Handling

**User Story:** As a user, I want clear error feedback when generation fails, so that I can understand what went wrong and try again.

#### Acceptance Criteria

1. IF the Generation_API_Route returns an error, THEN THE Generator_Page SHALL display an error message describing the failure
2. IF a network error occurs during the generation request, THEN THE Generator_Page SHALL display a connectivity error message
3. WHEN an error is displayed, THE Generator_Page SHALL re-enable the Prompt_Input and Generate_Button so the user can retry
