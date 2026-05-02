# Implementation Plan: Auth Integration

## Overview

Integrate the existing Better Auth system into audx so that generated themes and sounds are persisted to PostgreSQL with user ownership, unauthenticated users are prompted to log in, a profile page surfaces user content, single-sound generation uploads to Vercel Blob for authenticated users, and rate limits protect API costs. Implementation uses the existing `protectedProcedure` in tRPC, `requireAuth`/`requireUnauth` helpers, and the Better Auth client SDK.

## Tasks

- [x] 1. Add Prisma schema models and set up test infrastructure
  - [x] 1.1 Add `GeneratedTheme` and `GeneratedSound` models to `prisma/schema.prisma`
    - Add `GeneratedTheme` model with fields: `id` (cuid), `name`, `prompt`, `blobIndexUrl`, `assetCount`, `createdAt`, `userId` FK
    - Add `@@unique([userId, name])` constraint and `@@map("generated_theme")`
    - Add `GeneratedSound` model with fields: `id` (cuid), `prompt`, `blobUrl`, `duration` (Float), `sizeKb` (Int), `createdAt`, `userId` FK
    - Add `@@map("generated_sound")`
    - Add `generatedThemes GeneratedTheme[]` and `generatedSounds GeneratedSound[]` relations to the `User` model
    - Run `bunx prisma generate` to regenerate the Prisma client
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 1.2 Set up Vitest and fast-check in the root project
    - Add `vitest`, `fast-check`, and `@testing-library/react` as devDependencies
    - Create `vitest.config.ts` at the project root with path alias support (`@/*`)
    - Add a `test` script to root `package.json` (`vitest --run`)
    - _Requirements: (infrastructure for testing)_

- [x] 2. Implement rate limiter
  - [x] 2.1 Create `lib/rate-limiter.ts`
    - Implement `checkRateLimit(ip: string, limit: number, windowMs: number): RateLimitResult`
    - Use an in-memory `Map<string, { count: number; resetAt: number }>` keyed by IP
    - Return `{ allowed: boolean; remaining: number; limit: number }`
    - Reset counter when current time exceeds `resetAt`
    - _Requirements: 6.1, 6.2_

  - [ ]* 2.2 Write property test for rate limiter — per-IP independent limits
    - **Property 5: Rate limiter enforces per-IP independent limits**
    - For any two distinct IPs and limit L, exhausting L requests on one IP blocks it while the other IP retains its full allowance
    - Use `fast-check` with minimum 100 iterations
    - Test file: `tests/properties/rate-limiter.property.test.ts`
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 2.3 Write unit tests for rate limiter
    - Test: authenticated users bypass rate limit (pass-through, not checked)
    - Test: window reset after expiry
    - Test: fallback key when IP is missing
    - Test file: `tests/unit/rate-limiter.test.ts`
    - _Requirements: 6.3_

- [x] 3. Implement tRPC routers for profile, theme, and sound data
  - [x] 3.1 Create theme router at `trpc/routers/theme.ts`
    - `create`: `protectedProcedure` with Zod-validated `CreateThemeInput` → creates `GeneratedTheme` record, returns it; catches unique constraint violation and throws `CONFLICT` (409)
    - `list`: `protectedProcedure` → returns all `GeneratedTheme` records for the user
    - `getByName`: `protectedProcedure` with string input → returns single theme or throws `NOT_FOUND`
    - _Requirements: 1.1, 1.4, 8.1_

  - [x] 3.2 Create sound router at `trpc/routers/sound.ts`
    - `create`: `protectedProcedure` with Zod-validated `CreateSoundInput` → creates `GeneratedSound` record
    - `list`: `protectedProcedure` → returns all `GeneratedSound` records for the user
    - _Requirements: 2.1, 8.2_

  - [x] 3.3 Create profile router at `trpc/routers/profile.ts`
    - `getProfile`: `protectedProcedure` → returns user info (name, email, image) plus all themes (id, name, createdAt, assetCount) and sounds (id, prompt, createdAt, duration)
    - _Requirements: 5.1, 5.2, 5.3, 8.3_

  - [x] 3.4 Register new routers in `trpc/routers/_app.ts`
    - Import and add `theme`, `sound`, and `profile` routers to `appRouter`
    - Remove the placeholder `getUsers` route
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 3.5 Write property test for theme record creation round-trip
    - **Property 1: Theme record creation round-trip**
    - For any valid theme input, creating and reading back a `GeneratedTheme` returns identical fields
    - Use `fast-check` with minimum 100 iterations, mock Prisma client
    - Test file: `tests/properties/theme-router.property.test.ts`
    - **Validates: Requirements 1.1**

  - [ ]* 3.6 Write property test for duplicate theme name conflict
    - **Property 2: Duplicate theme name per user returns conflict**
    - Creating a theme with the same (userId, name) pair fails; same name with different userId succeeds
    - Use `fast-check` with minimum 100 iterations
    - Test file: `tests/properties/theme-router.property.test.ts`
    - **Validates: Requirements 1.4**

  - [ ]* 3.7 Write property test for sound record creation round-trip
    - **Property 3: Sound record creation round-trip**
    - For any valid sound input, creating and reading back a `GeneratedSound` returns identical fields
    - Use `fast-check` with minimum 100 iterations, mock Prisma client
    - Test file: `tests/properties/sound-router.property.test.ts`
    - **Validates: Requirements 2.1**

  - [ ]* 3.8 Write property test for profile query completeness
    - **Property 4: Profile query returns all user-generated content**
    - For any user with N themes and M sounds, profile query returns exactly N themes and M sounds with matching fields
    - Use `fast-check` with minimum 100 iterations
    - Test file: `tests/properties/profile-router.property.test.ts`
    - **Validates: Requirements 5.2, 5.3**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Modify API routes for auth-awareness and blob upload
  - [x] 5.1 Modify `/api/generate-sound/route.ts` for auth and rate limiting
    - Check session via `auth.api.getSession({ headers })`
    - If unauthenticated: check rate limit by IP → if exceeded return 429 → otherwise generate and return audio binary only
    - If authenticated: generate audio → upload to Vercel Blob via `put()` → create `GeneratedSound` record via Prisma → return audio binary
    - Audio binary is always returned regardless of auth status
    - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3, 6.1, 6.3_

  - [x] 5.2 Modify `/api/save-theme/route.ts` for auth and DB persistence
    - Check session via `auth.api.getSession({ headers })`
    - If unauthenticated: return 401 `{ error: "Authentication required to save themes" }`
    - If authenticated: run existing blob upload flow → create `GeneratedTheme` record via Prisma with userId → check unique constraint for 409
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.3 Modify `/api/generate-theme/route.ts` for auth gating on full generation
    - Check session via `auth.api.getSession({ headers })`
    - If unauthenticated and request has >10 sounds (full generation): return 403 `{ error: "Sign in to generate full themes" }`
    - If unauthenticated and ≤10 sounds (preview): allow through
    - If authenticated: allow all requests
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 5.4 Write unit tests for API route auth behavior
    - Test: unauthenticated sound generation returns audio without DB write (Req 2.3)
    - Test: unauthenticated sound generation skips blob upload (Req 3.2)
    - Test: audio binary returned regardless of auth status (Req 3.3)
    - Test: unauthenticated users can preview themes ≤10 sounds (Req 7.1)
    - Test: unauthenticated users blocked from full theme generation >10 sounds (Req 7.2)
    - Test: authenticated users can do both preview and full generation (Req 7.3)
    - Test: `protectedProcedure` returns 401 without session (Req 8.4)
    - Test file: `tests/unit/api-routes.test.ts`
    - _Requirements: 2.3, 3.2, 3.3, 7.1, 7.2, 7.3, 8.4_

- [x] 6. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement client-side UI components
  - [x] 7.1 Create `LoginPromptBanner` component at `components/login-prompt-banner.tsx`
    - Client component using `authClient.useSession()` from `lib/auth-client.ts`
    - Renders a dismissible banner with message and link to `/login`
    - Renders nothing when a session exists
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 Create `HeaderAuthNav` client component at `components/header-auth-nav.tsx`
    - Uses `authClient.useSession()` to check auth state
    - Authenticated: shows user name/avatar + link to `/profile` + sign out button
    - Unauthenticated: shows "Log in" link
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 7.3 Update `components/header.tsx` to include `HeaderAuthNav`
    - Replace or augment the existing static nav area with the new `HeaderAuthNav` component
    - Keep the "Generate" link accessible for all users
    - _Requirements: 11.1, 11.2_

  - [x] 7.4 Add `LoginPromptBanner` to generation pages
    - Add `LoginPromptBanner` to `app/themes/create/page.tsx` at the top of the page content
    - Add `LoginPromptBanner` to `app/generate/page.tsx` at the top of the page content
    - _Requirements: 4.1, 4.2_

  - [x] 7.5 Update `useThemeEditor` hook to gate `approvePreview` behind auth
    - In `approvePreview`, check auth state via `authClient.useSession()` or accept auth state as a parameter
    - If unauthenticated, set error state with a login prompt message instead of making the API call
    - _Requirements: 7.2_

  - [ ]* 7.6 Write unit tests for LoginPromptBanner and HeaderAuthNav
    - Test: LoginPromptBanner renders for unauthenticated users (Req 4.1, 4.2)
    - Test: LoginPromptBanner hidden for authenticated users (Req 4.4)
    - Test: LoginPromptBanner link points to `/login` (Req 4.3)
    - Test: Header shows profile link when authenticated (Req 11.1)
    - Test: Header shows login link when unauthenticated (Req 11.2)
    - Test file: `tests/unit/ui-components.test.tsx`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 11.1, 11.2_

- [-] 8. Implement profile page and auth page guards
  - [x] 8.1 Create profile page at `app/profile/page.tsx`
    - Server component that calls `requireAuth()` for redirect guard
    - Renders a `ProfileContent` client component that fetches data via tRPC `profile.getProfile`
    - Displays user name, email, list of themes (name, date, asset count), and list of sounds (prompt, date, duration)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Create `ProfileContent` client component at `components/profile-content.tsx`
    - Uses `useTRPC` to call `profile.getProfile`
    - Renders user info section, themes list, and sounds list
    - Handles loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 8.3 Verify auth page guards on login and signup pages
    - Confirm `/login` page calls `requireUnauth()` (already in place)
    - Confirm `/signup` page calls `requireUnauth()` (already in place)
    - Confirm `/profile` page calls `requireAuth()` (added in 8.1)
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 8.4 Write unit tests for profile page data display
    - Test: Profile page displays user name and email (Req 5.1)
    - Test file: `tests/unit/profile.test.tsx`
    - _Requirements: 5.1_

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–5)
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout — all implementation tasks use TypeScript
- Vitest and fast-check need to be added to root `devDependencies` (they currently only exist in the CLI package)
- The existing `protectedProcedure` in `trpc/init.ts` and auth helpers in `lib/auth-utils.ts` are reused as-is

## Agent Execution Rules (CRITICAL)

1. **NO intermediate testing**: Do NOT run linting (`bun run lint`), building (`bun run build`), type checking (`tsc --noEmit`), or any verification commands between tasks. Only run these at the very last task (Task 10). Just write the code and move on.
2. **Terminal output not visible? Move on**: If you execute a terminal command and cannot see the output, that is a known bug. Do NOT retry the command. Do NOT try alternative approaches to see the output. Simply move to the next step.
3. **Avoid commands requiring user confirmation**: If a command is not in your auto-approved list and requires user confirmation, defer it to the final task (Task 10) or use an alternative command from the auto-allowed list. Do not block on user confirmation mid-execution — time should not be wasted waiting.
