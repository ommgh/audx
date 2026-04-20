# Implementation Plan: Frontend Redesign

## Overview

This plan implements the audx frontend redesign in incremental steps: first cleaning up CSS and removing animations, then migrating icons and primitives, and finally restructuring the landing page. Each step builds on the previous to ensure no broken intermediate states.

## Tasks

- [x] 1. Clean up globals.css — remove unused CSS blocks
  - Remove the `@keyframes eq` block and `.eq-bar-mini` / `.eq-bar-playing` rules
  - Remove the `@keyframes fade-up` block and `.stagger-fade-up` rule
  - Remove the `[data-eq-paused] .hero-eq-bar` rule
  - Remove the `@media (prefers-reduced-motion: reduce)` block
  - Remove the `body::after` grain texture overlay block
  - Retain: `@import` directives, `@custom-variant dark`, `@theme inline`, `:root`/`.dark` variables, `@layer base`, scrollbar utilities, `@keyframes blink-caret`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 2. Remove animations from components
  - [x] 2.1 Remove `stagger-fade-up` class and `animationDelay` style props from all components
    - Files: `components/hero.tsx`, `components/sounds-page.tsx`, `components/global-fiters.tsx`, `components/sound-detail-page.tsx`, `components/app-hero.tsx`
    - _Requirements: 1.7, 5.1_
  - [x] 2.2 Remove `hover:scale-*` and `active:scale-*` classes from all components
    - Files: `components/sound-card.tsx`, `components/sound-detail-page.tsx` (RelatedAudioCard), `components/copy-button.tsx`
    - _Requirements: 5.2, 5.7_
  - [ ] 2.3 Remove `animate-ping` and `animate-spin` from `components/sound-control.tsx`
    - Remove the ping span and `animate-spin` on Loader2
    - _Requirements: 5.3_
  - [ ] 2.4 Remove the `MiniSoundEqualizer` animated rendering from `components/sound-card.tsx` and `components/sound-detail-page.tsx`
    - Remove the `<MiniSoundEqualizer>` usage (or replace with static bars if needed for layout)
    - _Requirements: 5.6_
  - [ ] 2.5 Remove `HeroBars` component usage from `components/hero.tsx` and remove the blur circle div
    - _Requirements: 5.5, 6.6_

- [ ] 3. Remove Footer and unused components
  - [ ] 3.1 Remove `<Footer />` import and render from `app/layout.tsx`
    - _Requirements: 6 (Glossary: Footer)_
  - [ ] 3.2 Delete component files: `components/hero-bars.tsx`, `components/footer.tsx`, `components/app-hero.tsx`, `components/empty-sponsors.tsx`
    - _Requirements: 5.5, 6 (Glossary: Footer)_

- [ ] 4. Checkpoint — Ensure the app builds cleanly
  - Run `next build` and verify no TypeScript or import errors. Ask the user if questions arise.

- [ ] 5. Migrate icons from lucide-react to @remixicon/react
  - [ ] 5.1 Migrate `components/theme-toggle.tsx` — replace `Moon`/`Sun` with `RiMoonLine`/`RiSunLine`, use `size` prop, remove scale/rotate transitions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.7_
  - [ ] 5.2 Migrate `components/github-button.tsx` — replace `Github` with `RiGithubLine`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.3 Migrate `components/hero-installation-code.tsx` — replace `Copy`/`Check` with `RiFileCopyLine`/`RiCheckLine`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.4 Migrate `components/sound-search.tsx` — replace `Search` with `RiSearchLine`, update placeholder to "Search audio..."
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.7_
  - [ ] 5.5 Migrate `components/sound-control.tsx` — replace `Loader2`/`Play`/`Square` with `RiLoader4Line`/`RiPlayFill`/`RiStopFill`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.6 Migrate `components/sound-download-button.tsx` — replace `Download` with `RiDownloadLine`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.7 Migrate `components/copy-button.tsx` — replace `Check` with `RiCheckLine`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.8 Migrate `components/sound-detail.tsx` — replace `ArrowUpRight`/`Clock`/`HardDrive`/`Scale`/`Tag` with Remix equivalents
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.9 Migrate `components/sound-detail-page.tsx` — replace `ArrowLeft`/`Clock`/`HardDrive`/`Scale`/`Tag` with Remix equivalents
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 5.10 Migrate `components/generate-sound.tsx` — replace `Download`/`Loader2`/`Sparkles` with Remix equivalents
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Replace hardcoded colours with semantic tokens
  - [ ] 6.1 Fix `components/copy-button.tsx` — replace `border-green-500/30`, `bg-green-500/10`, `text-green-600`, `dark:text-green-400` with `border-primary/30`, `bg-primary/10`, `text-primary`
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ] 6.2 Fix `components/hero-installation-code.tsx` — replace `text-green-500` (copy state) with `text-primary`
    - _Requirements: 2.1, 2.2, 2.4_

- [ ] 7. Migrate @radix-ui/react-slot in clickable-with-sound.tsx
  - Replace `import { Slot } from "@radix-ui/react-slot"` with a native approach (e.g. `React.cloneElement` or callback pattern) to attach the onClick handler to the child element
  - _Requirements: 4.1, 4.2_

- [ ] 8. Checkpoint — Ensure the app builds and all icons render correctly
  - Run `next build` and verify no TypeScript errors. Verify no remaining `lucide-react` imports outside `node_modules`. Ask the user if questions arise.

- [ ] 9. Redesign the landing page layout
  - [ ] 9.1 Update `components/header.tsx` — remove `AppMenu` import and render
    - _Requirements: 6.1, 6.2_
  - [ ] 9.2 Update `components/hero.tsx` — remove decorative elements, ensure heading text matches wireframe ("Customisable UI audio. Copy. Paste. Play." with primary/muted-foreground styling), keep subtitle and HeroInstallationCode
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  - [ ] 9.3 Update `components/global-fiters.tsx` — remove animation classes, ensure search is positioned between hero and grid
    - _Requirements: 6.7, 6.8_
  - [ ] 9.4 Update `components/sounds-page.tsx` — remove `stagger-fade-up` and animation delays, ensure component order is Hero → GlobalFilters → SoundGrid with SoundDetail drawer
    - _Requirements: 6.8, 6.9, 6.10_

- [ ] 10. Final cleanup
  - [ ] 10.1 Remove `lucide-react` from `package.json` dependencies
    - _Requirements: 3.1_
  - [ ] 10.2 Remove `@radix-ui/react-slot` from `package.json` dependencies (keep `@radix-ui/react-label` if still used by shadcn components in `components/ui/`)
    - _Requirements: 4.1_
  - [ ] 10.3 Delete `components/mini-sound-equalizer.tsx` if no longer imported anywhere
    - _Requirements: 5.6_

- [ ] 11. Final checkpoint — Full build verification
  - Run `next build` and confirm zero errors. Verify no remaining lucide-react or @radix-ui/react-slot imports in app/component code. Ask the user if questions arise.

## Notes

- No property-based tests — the testing strategy is static analysis + build verification (per design)
- Each checkpoint runs `next build` to catch import/type errors incrementally
- The `components/ui/` directory is managed by shadcn CLI and excluded from migration requirements
- The `registry/` directory is excluded from migration requirements per Requirement 4
