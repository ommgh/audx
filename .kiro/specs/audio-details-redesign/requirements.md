# Requirements Document

## Introduction

Redesign the audio details experience by removing the bottom drawer modal, navigating directly to the sound detail page, redesigning that page layout, simplifying install instructions to React-only, and adding a Generate button to the header.

## Glossary

- **Audio_Card**: A clickable card in the sound grid that represents a single audio item (`components/sound-card.tsx`)
- **Sound_Grid**: The grid layout displaying all Audio_Cards on the home page (`components/sound-grid.tsx`)
- **Sound_Detail_Page**: The `/sound/[name]` route page showing full audio details (`components/sound-detail-page.tsx`)
- **Drawer_Modal**: The bottom drawer (vaul) that currently opens when an Audio_Card is clicked (`components/sound-detail.tsx`)
- **Header**: The sticky top navigation bar (`components/header.tsx`)
- **Install_Instructions**: The component showing package install commands and usage code (`components/sound-install-instructions.tsx`)
- **Package_Manager_Switcher**: Tab switcher for npm/pnpm/yarn/bun (`components/package-manager-switcher.tsx`)
- **Install_Method_Switcher**: Tab switcher for React/Vue/Manual install methods (`components/install-method-switcher.tsx`)
- **Player_Strip**: The audio playback bar with play/stop, waveform, and controls (`components/sound-player.tsx`)

## Requirements

### Requirement 1: Remove Drawer Modal and Navigate Directly

**User Story:** As a user, I want clicking an audio card to navigate directly to the sound detail page, so that I can access full details without an intermediate drawer step.

#### Acceptance Criteria

1. WHEN a user clicks an Audio_Card in the Sound_Grid, THE Audio_Card SHALL navigate to `/sound/[name]` where `[name]` is the audio item's name
2. THE Sounds_Page SHALL render without the Drawer_Modal component
3. THE Sound_Grid SHALL not depend on the `useAudioSelection` hook for drawer-based selection

### Requirement 2: Redesign Sound Detail Page Layout

**User Story:** As a user, I want a clean redesigned sound detail page, so that I can see the sound info, install command, and player in a clear layout.

#### Acceptance Criteria

1. THE Sound_Detail_Page SHALL display a back button ("<") at the top left that navigates to the home page
2. THE Sound_Detail_Page SHALL display a large sound visualization/icon on the left side and the sound name and description on the right side in a horizontal layout
3. THE Sound_Detail_Page SHALL display the Package_Manager_Switcher tabs (npm, pnpm, yarn, bun) with the install command and a copy button below the name/description area
4. THE Sound_Detail_Page SHALL display the Player_Strip at the bottom of the content area with play/stop button, waveform visualization, and controls
5. THE Sound_Detail_Page SHALL use a max-width container with a clean, minimal layout

### Requirement 3: Simplify Install Instructions to React Only

**User Story:** As a user, I want to see only the React (shadcn) install method, so that the install section is simple and uncluttered.

#### Acceptance Criteria

1. THE Install_Instructions SHALL display only the React (shadcn) install method without the Install_Method_Switcher
2. THE Install_Instructions SHALL display the Package_Manager_Switcher (npm/pnpm/yarn/bun) and the corresponding install command directly
3. THE `getAudioSnippets` function SHALL accept only the sound name and package manager parameters, removing the install method parameter

### Requirement 4: Add Generate Button to Header

**User Story:** As a user, I want a Generate button in the header, so that I can quickly navigate to the sound generation page.

#### Acceptance Criteria

1. THE Header SHALL display a "Generate" button with a sparkle icon (RiSparklingLine from remixicon)
2. THE Generate button SHALL use `bg-foreground text-background` styling
3. WHEN a user clicks the Generate button, THE Header SHALL navigate to `/generate`
