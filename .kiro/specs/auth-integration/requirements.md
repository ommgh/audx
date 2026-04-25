# Requirements Document

## Introduction

Integrate the existing Better Auth authentication system into the audx application so that generated themes and sounds are persisted to the PostgreSQL database with user ownership, unauthenticated users are prompted to log in before saving, a profile page displays user-generated content, the single-sound generation API uploads to blob storage with user linking, and rate limits are enforced for unauthenticated users. All server-side authorization is enforced via tRPC `protectedProcedure`; page-level redirects use `requireAuth`/`requireUnauth` as UX helpers only.

## Glossary

- **App**: The audx Next.js web application
- **Auth_System**: The Better Auth instance configured in `lib/auth.ts` with Prisma adapter
- **Auth_Client**: The client-side Better Auth SDK configured in `lib/auth-client.ts`
- **Protected_Procedure**: The tRPC procedure middleware in `trpc/init.ts` that verifies a valid session and rejects unauthorized requests with a 401
- **Require_Auth**: The server-side UX helper in `lib/auth-utils.ts` that redirects unauthenticated users to `/login`
- **Require_Unauth**: The server-side UX helper in `lib/auth-utils.ts` that redirects authenticated users away from auth pages
- **Theme**: A collection of 65 AI-generated sound assets identified by a kebab-case name, stored in blob storage
- **Sound**: A single AI-generated audio file produced by the ElevenLabs API
- **Blob_Storage**: Vercel Blob storage used to persist generated audio asset files
- **Database**: The PostgreSQL database accessed via Prisma, containing User, Session, Account, and Verification models
- **Theme_Record**: A database row storing theme metadata (name, prompt, blob index URL, user reference)
- **Sound_Record**: A database row storing single-sound metadata (prompt, blob URL, user reference)
- **Unauthenticated_User**: A visitor without an active session
- **Authenticated_User**: A visitor with a valid session managed by Auth_System
- **Profile_Page**: The `/profile` page displaying user information and generated content
- **Theme_Create_Page**: The `/themes/create` page for generating themes
- **Sound_Generate_Page**: The `/generate` page for generating single sounds
- **Login_Prompt_Banner**: A UI banner displayed to Unauthenticated_User on generation pages, linking to `/login`
- **Rate_Limiter**: Server-side logic that tracks and restricts generation requests from Unauthenticated_User

## Requirements

### Requirement 1: Theme Metadata Database Storage

**User Story:** As a developer, I want theme metadata stored in the Database with a reference to the Blob_Storage URL, so that themes are linked to user accounts and queryable.

#### Acceptance Criteria

1. WHEN an Authenticated_User saves a Theme, THE App SHALL create a Theme_Record in the Database containing the theme name, theme prompt, blob index URL, asset count, and the user ID of the Authenticated_User
2. WHEN a Theme is saved, THE App SHALL continue to upload sound assets to Blob_Storage and store the resulting blob index URL in the Theme_Record
3. THE Theme_Record SHALL include a foreign key reference to the User model in the Database
4. IF a Theme_Record with the same name already exists for the same user, THEN THE App SHALL return a 409 conflict error

### Requirement 2: Sound Metadata Database Storage

**User Story:** As a developer, I want single-sound metadata stored in the Database with a reference to the Blob_Storage URL, so that generated sounds are linked to user accounts.

#### Acceptance Criteria

1. WHEN an Authenticated_User generates a Sound, THE App SHALL create a Sound_Record in the Database containing the prompt text, blob URL, duration, file size, and the user ID of the Authenticated_User
2. THE Sound_Record SHALL include a foreign key reference to the User model in the Database
3. WHEN a Sound is generated for an Unauthenticated_User (within rate limits), THE App SHALL return the audio without creating a Sound_Record

### Requirement 3: Single Sound Blob Storage Upload

**User Story:** As a developer, I want the `/api/generate-sound` endpoint to upload generated audio to Blob_Storage, so that single sounds are persisted the same way theme sounds are.

#### Acceptance Criteria

1. WHEN the `/api/generate-sound` endpoint generates audio for an Authenticated_User, THE App SHALL upload the audio file to Blob_Storage and include the blob URL in the Sound_Record
2. WHEN the `/api/generate-sound` endpoint generates audio for an Unauthenticated_User, THE App SHALL return the audio directly without uploading to Blob_Storage
3. THE App SHALL return the audio binary in the response regardless of authentication status

### Requirement 4: Login Prompt Banner on Generation Pages

**User Story:** As a visitor, I want to see a prompt to log in on generation pages, so that I know I can save my generated audio by creating an account.

#### Acceptance Criteria

1. WHILE an Unauthenticated_User is viewing the Theme_Create_Page, THE App SHALL display a Login_Prompt_Banner at the top of the page content
2. WHILE an Unauthenticated_User is viewing the Sound_Generate_Page, THE App SHALL display a Login_Prompt_Banner at the top of the page content
3. WHEN an Unauthenticated_User clicks the login link in the Login_Prompt_Banner, THE App SHALL navigate to `/login`
4. WHILE an Authenticated_User is viewing the Theme_Create_Page or Sound_Generate_Page, THE App SHALL NOT display the Login_Prompt_Banner

### Requirement 5: Profile Page

**User Story:** As an authenticated user, I want a profile page showing my account info and generated content, so that I can review and access my themes and sounds.

#### Acceptance Criteria

1. THE Profile_Page SHALL display the Authenticated_User name and email address
2. THE Profile_Page SHALL list all Theme_Records belonging to the Authenticated_User, showing theme name, creation date, and asset count
3. THE Profile_Page SHALL list all Sound_Records belonging to the Authenticated_User, showing prompt text, creation date, and duration
4. WHEN an Unauthenticated_User navigates to the Profile_Page, THE App SHALL redirect to `/login` using Require_Auth
5. THE Profile_Page SHALL retrieve user data using Protected_Procedure via tRPC

### Requirement 6: Rate Limiting for Unauthenticated Sound Generation

**User Story:** As a platform operator, I want to limit how many sounds unauthenticated users can generate, so that API costs are controlled.

#### Acceptance Criteria

1. WHILE an Unauthenticated_User has already generated 2 sounds via `/api/generate-sound`, THE App SHALL reject further generation requests with a 429 status and a message indicating the limit has been reached
2. THE Rate_Limiter SHALL track Unauthenticated_User generation count using IP address or a fingerprint mechanism
3. WHILE an Authenticated_User is using `/api/generate-sound`, THE Rate_Limiter SHALL NOT apply the 2-sound limit

### Requirement 7: Rate Limiting for Unauthenticated Theme Generation

**User Story:** As a platform operator, I want unauthenticated users limited to theme preview only, so that full theme generation requires an account.

#### Acceptance Criteria

1. WHILE an Unauthenticated_User is on the Theme_Create_Page, THE App SHALL allow generating a theme preview (10 sounds, one per category)
2. WHEN an Unauthenticated_User attempts to confirm full theme generation (approve preview), THE App SHALL block the request and prompt the user to log in
3. WHILE an Authenticated_User is on the Theme_Create_Page, THE App SHALL allow both preview generation and full theme generation without restriction

### Requirement 8: tRPC Protected Procedures for Data Access

**User Story:** As a developer, I want all authenticated data operations to go through tRPC protected procedures, so that authorization is enforced at the API layer.

#### Acceptance Criteria

1. THE App SHALL use Protected_Procedure for all tRPC routes that create, read, or modify Theme_Records
2. THE App SHALL use Protected_Procedure for all tRPC routes that create, read, or modify Sound_Records
3. THE App SHALL use Protected_Procedure for the tRPC route that retrieves profile data
4. IF a request to a Protected_Procedure lacks a valid session, THEN THE App SHALL return a 401 UNAUTHORIZED error

### Requirement 9: Auth Page Guards

**User Story:** As a user, I want auth pages to behave correctly based on my session state, so that I am not shown login forms when already logged in.

#### Acceptance Criteria

1. WHEN an Authenticated_User navigates to `/login`, THE App SHALL redirect to `/` using Require_Unauth
2. WHEN an Authenticated_User navigates to `/signup`, THE App SHALL redirect to `/` using Require_Unauth
3. WHEN an Unauthenticated_User navigates to the Profile_Page, THE App SHALL redirect to `/login` using Require_Auth

### Requirement 10: Prisma Schema for Generated Content

**User Story:** As a developer, I want Prisma models for themes and sounds, so that generated content is stored in a structured and queryable format.

#### Acceptance Criteria

1. THE Database schema SHALL include a GeneratedTheme model with fields: id, name, prompt, blobIndexUrl, assetCount, createdAt, and a userId foreign key referencing User
2. THE Database schema SHALL include a GeneratedSound model with fields: id, prompt, blobUrl, duration, sizeKb, createdAt, and a userId foreign key referencing User
3. THE GeneratedTheme model SHALL enforce a unique constraint on the combination of userId and name
4. THE User model SHALL include relations to GeneratedTheme and GeneratedSound models

### Requirement 11: Header Navigation Auth State

**User Story:** As a user, I want the header to reflect my authentication state, so that I can access my profile or log in.

#### Acceptance Criteria

1. WHILE an Authenticated_User is viewing any page, THE App SHALL display a profile link or avatar in the header navigation
2. WHILE an Unauthenticated_User is viewing any page, THE App SHALL display a login link in the header navigation
3. WHEN an Authenticated_User clicks the profile link in the header, THE App SHALL navigate to the Profile_Page
