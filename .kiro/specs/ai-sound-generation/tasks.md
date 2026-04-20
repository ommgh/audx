# Implementation Plan: AI Sound Generation

## Overview

Implement the AI sound generation feature as a `/generate` page in the audx app. The implementation follows an incremental approach: shared validation schema first, then the API route, then the client-side hook and UI component, and finally the page route that wires everything together. Property-based tests use `fast-check` with `vitest`.

## Tasks

- [ ] 1. Create the zod validation schema
  - [x] 1.1 Create `lib/generate-sound-schema.ts` with the `generateSoundSchema` zod object and `GenerateSoundInput` type export
    - `text`: non-empty string, max 500 characters
    - `duration_seconds`: optional number in [0.5, 22]
    - `prompt_influence`: optional number in [0, 1]
    - _Requirements: 3.2, 4.2, 4.3, 5.3_

  - [ ]\* 1.2 Write property test for schema validation
    - **Property 2: Request schema validation**
    - Generate random objects with varying `text` lengths (0–1000), `duration_seconds` (−10 to 50), `prompt_influence` (−1 to 2), missing fields, extra fields
    - Assert schema accepts if and only if all fields are valid per constraints
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 3.2, 4.2, 5.3**

  - [ ]\* 1.3 Write property test for prompt influence percentage formatting
    - **Property 3: Prompt influence percentage formatting**
    - Generate random floats in [0, 1]
    - Assert formatted string equals `Math.round(v * 100) + "%"`
    - **Validates: Requirements 4.4**

- [ ] 2. Implement the API route
  - [x] 2.1 Create `app/api/generate-sound/route.ts` with a POST handler
    - Parse and validate request body using `generateSoundSchema`
    - Read `ELEVEN_LABS_API_KEY` from `process.env`; return 500 if missing
    - POST to `https://api.elevenlabs.io/v1/sound-generation` with `xi-api-key` header and JSON body
    - On success: return MP3 binary with `Content-Type: audio/mpeg`
    - On ElevenLabs 4xx/5xx: return 502 with descriptive JSON error
    - On network error: return 502 with connectivity error
    - On validation error: return 400 with specific error message
    - Never include the API key in any error response
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]\* 2.2 Write property test for API key not leaked in error responses
    - **Property 5: API key never leaked in error responses**
    - Generate random ElevenLabs error responses (various status codes, body content including the API key string)
    - Assert the API route's response body does not contain the API key value
    - **Validates: Requirements 5.4**

  - [ ]\* 2.3 Write unit tests for API route
    - Test 400 on missing/empty `text`
    - Test 400 on `text` exceeding 500 characters
    - Test 400 on `duration_seconds` out of range
    - Test 400 on `prompt_influence` out of range
    - Test 500 when `ELEVEN_LABS_API_KEY` is not configured
    - Test successful MP3 response with correct `Content-Type`
    - Test 502 on ElevenLabs 4xx/5xx
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Checkpoint - Ensure schema and API route work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement the client-side hook
  - [x] 4.1 Create `hooks/use-sound-generator.ts` with the `useSoundGenerator` custom hook
    - Manage state: `prompt`, `durationSeconds` (null = Auto), `promptInfluence` (default 0.3), `isGenerating`, `error`, `audioUrl`
    - `generate()`: validate prompt non-empty, set `isGenerating`, POST to `/api/generate-sound`, create blob URL on success, set error on failure
    - Revoke previous blob URL when a new one is created
    - Revoke blob URL on unmount via `useEffect` cleanup
    - Clear error when starting a new generation
    - Prevent duplicate submissions while `isGenerating` is true
    - _Requirements: 6.1, 6.2, 6.3, 7.4, 8.1, 8.2, 8.3_

  - [ ]\* 4.2 Write property test for duplicate submission prevention
    - **Property 6: Duplicate submission prevention**
    - Simulate N generate calls while a generation is in progress
    - Assert exactly one API request is in flight at any time
    - **Validates: Requirements 6.3**

  - [ ]\* 4.3 Write property test for new generation replaces previous audio
    - **Property 7: New generation replaces previous audio**
    - Simulate two consecutive successful generations
    - Assert the audio URL after the second differs from the first
    - **Validates: Requirements 7.4**

- [ ] 5. Implement the GenerateSound UI component
  - [x] 5.1 Create `components/generate-sound.tsx` as a `"use client"` component
    - Render heading section communicating AI sound generation purpose
    - Render suggestion chips from the `SUGGESTION_CHIPS` array as clickable buttons
    - Clicking a chip sets the prompt to that chip's text
    - Render `<Textarea>` for prompt input with placeholder "Describe a sound..." and 500 char max
    - Render controls bar: duration select (Auto + 0.5–22s range) and prompt influence slider (0–1, default 0.3) with percentage label
    - Render Generate button: disabled when prompt is empty or `isGenerating` is true, shows loading indicator during generation
    - Render conditional audio result section: `<audio>` element with play/pause pointed at blob URL, plus download button
    - Render conditional error message
    - Use existing shadcn components (`Button`, `Textarea`, `Label`) and `cn()` utility
    - Support light and dark themes via existing Tailwind theme tokens
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3_

  - [ ]\* 5.2 Write property test for suggestion chip click populates prompt
    - **Property 1: Suggestion chip click populates prompt**
    - For any suggestion chip in the chip set, clicking that chip should result in the prompt value being exactly equal to the chip's text
    - **Validates: Requirements 2.2**

  - [ ]\* 5.3 Write property test for API route forwards valid requests
    - **Property 4: API route forwards valid requests to ElevenLabs**
    - For any valid `GenerateSoundInput`, assert the API route forwards a POST to the correct ElevenLabs URL with the provided parameters and `xi-api-key` header
    - **Validates: Requirements 5.1, 5.5**

  - [ ]\* 5.4 Write unit tests for GenerateSound component
    - Test heading renders
    - Test suggestion chips are rendered
    - Test clicking a chip populates the prompt input
    - Test prompt input has correct placeholder
    - Test generate button is disabled when prompt is empty
    - Test duration control defaults to "Auto"
    - Test prompt influence slider defaults to 0.3 (displayed as "30%")
    - Test loading state shows indicator and disables inputs
    - Test audio player renders after successful generation
    - Test download button is present with correct attributes
    - Test error message displays on API error
    - Test inputs re-enabled after error
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 3.1, 3.3, 4.1, 4.3, 6.2, 7.1, 7.3, 8.1, 8.3_

- [x] 6. Checkpoint - Ensure component and hook work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create the page route and wire everything together
  - [x] 7.1 Create `app/generate/page.tsx` as a server component
    - Import and render `<GenerateSound />` inside a `<main>` wrapper with layout classes matching existing pages (`mx-auto max-w-6xl`)
    - Export `metadata` object for SEO (title, description)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]\* 7.2 Write integration tests for the full generation flow
    - Test: enter prompt → click generate → receive audio → audio player renders
    - Test: API route end-to-end with mocked ElevenLabs
    - _Requirements: 5.1, 6.1, 7.1, 7.2_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- `fast-check` is used for property-based testing with `vitest`
- All code uses TypeScript, Tailwind CSS v4, and existing shadcn components
