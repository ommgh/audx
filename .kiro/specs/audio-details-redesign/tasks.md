# Implementation Plan: Audio Details Redesign

## Overview

Refactor the audio browsing experience: remove the drawer modal in favor of direct Link navigation, simplify install instructions to React-only, redesign the sound detail page layout per wireframe, and add a Generate button to the header. All changes are UI-level — no backend or data model changes.

## Tasks

- [x] 1. Remove drawer modal and convert AudioCard to Link navigation
  - [x] 1.1 Update `components/sound-card.tsx`: replace `<button>` with Next.js `<Link href={/sound/${item.name}}>`, remove `onSelect` prop from interface and usage, keep `onPreviewStart`/`onPreviewStop`
    - _Requirements: 1.1_
  - [x] 1.2 Update `components/sound-grid.tsx`: remove `useAudioSelection` hook import and `handleSelect` usage, remove `onSelect` prop from `<AudioCard>`
    - _Requirements: 1.3_
  - [x] 1.3 Update `components/sounds-page.tsx`: remove dynamic import of `SoundDetail` and remove `<SoundDetail>` from render output
    - _Requirements: 1.2_
  - [x] 1.4 Delete `components/sound-detail.tsx` (drawer modal wrapper) and `components/ui/drawer.tsx` (vaul drawer primitive)
    - _Requirements: 1.2_

- [x] 2. Simplify install instructions to React-only
  - [x] 2.1 Simplify `lib/install-method.ts`: reduce `InstallMethod` type to just `"shadcn"`, remove `INSTALL_METHODS` array and `INSTALL_METHOD_LABELS` map
    - _Requirements: 3.1_
  - [x] 2.2 Simplify `lib/audio-snippets.ts`: remove `method` parameter from `getAudioSnippets`, remove `shadcn-vue` and `manual` cases, remove `SetupStep` type and `AUDIO_ENGINE_SOURCE`/`AUDIO_TYPES_SOURCE` constants
    - _Requirements: 3.3_
  - [x] 2.3 Update `components/sound-install-instructions.tsx`: remove `InstallMethodSwitcher` import and state, remove manual setup rendering (`ManualStepBlock`, `useAudioFileContent`), always use `"shadcn"` method — just render PackageManagerSwitcher + install command + usage code
    - _Requirements: 3.1, 3.2_
  - [x] 2.4 Delete `components/install-method-switcher.tsx`
    - _Requirements: 3.1_

- [x] 3. Redesign sound detail page layout and add Generate button
  - [x] 3.1 Redesign `components/sound-detail-page.tsx` per wireframe: back button (`<`) top-left linking to `/`, two-column section with large sound visualization (left) + name/description (right), install command block with PackageManagerSwitcher + copy button, PlayerStrip at the bottom
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.2 Update `components/header.tsx`: add a "Generate" button/link with `RiSparklingLine` icon, styled `bg-foreground text-background`, linking to `/generate`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Cleanup unused code
  - [x] 4.1 Evaluate and delete `hooks/use-sound-selection.ts` if no other component imports it (was only used by drawer flow)
    - _Requirements: 1.3_

- [x] 5. Final checkpoint — verify and test
  - Ensure the app builds without errors (`next build`)
  - Ensure all modified components render correctly
