# Design Document: Frontend Redesign

## Overview

This design covers a comprehensive frontend cleanup and redesign of the audx application. The work is divided into six coordinated changes: removing unused CSS, standardising on the shadcn theme system, migrating icons from lucide-react to @remixicon/react, migrating primitives from @radix-ui to @base-ui/react, removing all animations, and redesigning the landing page to a clean wireframe layout.

The changes are largely independent at the file level but share a common goal: a minimal, animation-free, theme-consistent UI built entirely on shadcn/ui components with the base-lyra style.

## Architecture

The application follows a standard Next.js 15 App Router architecture:

```
app/              → Routes and layouts (page.tsx, layout.tsx, globals.css)
components/       → Shared React components
components/ui/    → shadcn/ui primitives (installed via CLI)
hooks/            → Custom React hooks
lib/              → Utility functions, constants, data
registry/         → audx sound registry (published components)
```

The redesign does not change this architecture. It modifies existing files in-place, removes unused components, and simplifies the component tree.

### Key Architectural Decisions

1. **No new dependencies** — @base-ui/react and @remixicon/react are already installed. After migration, lucide-react and @radix-ui packages can be removed from package.json.

2. **shadcn CLI for UI primitives** — All UI components in `components/ui/` are installed via `bunx --bun shadcn@latest add <component>`. Direct imports of @base-ui/react in page/component code are avoided.

3. **Slot → useRender migration** — The `@radix-ui/react-slot` `Slot` component used in `clickable-with-sound.tsx` will be replaced with `@base-ui/react`'s `useRender` hook or a simple callback pattern, since the component only needs to attach an onClick handler to its child.

4. **Footer removal** — The `<Footer />` component is removed from `app/layout.tsx` and the component file can be deleted.

5. **Animation removal is total** — All CSS animations, transitions involving transforms, and animated components (HeroBars, MiniSoundEqualizer with animation) are removed. The only exception is the `blink-caret` keyframe used by the CLI cursor in `hero-installation-code.tsx`.

## Components and Interfaces

### Components to Remove

| Component                       | Reason                                            |
| ------------------------------- | ------------------------------------------------- |
| `components/hero-bars.tsx`      | Animated equalizer background — removed per Req 5 |
| `components/footer.tsx`         | Footer removed from application                   |
| `components/app-hero.tsx`       | Replaced by simplified Hero component             |
| `components/empty-sponsors.tsx` | References removed sponsor functionality          |

### Components to Modify

| Component                               | Changes                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `components/hero.tsx`                   | Remove HeroBars, blur circles, stagger-fade-up classes; update heading/subtitle text per wireframe |
| `components/hero-installation-code.tsx` | Replace lucide-react icons (Copy, Check) with Remix equivalents; remove green hardcoded colours    |
| `components/header.tsx`                 | Remove AppMenu import/render                                                                       |
| `components/theme-toggle.tsx`           | Replace Moon/Sun from lucide with Remix icons; remove scale/rotate transitions                     |
| `components/github-button.tsx`          | Replace Github icon from lucide with Remix equivalent                                              |
| `components/sound-card.tsx`             | Remove MiniSoundEqualizer, hover:scale-_, active:scale-_ classes                                   |
| `components/sound-search.tsx`           | Replace Search icon from lucide; update placeholder to "Search audio..."                           |
| `components/sound-control.tsx`          | Replace Loader2/Play/Square icons; remove animate-ping, animate-spin                               |
| `components/sound-detail.tsx`           | Replace all lucide icons; remove hardcoded colours                                                 |
| `components/sound-detail-page.tsx`      | Replace all lucide icons                                                                           |
| `components/sound-download-button.tsx`  | Replace Download icon                                                                              |
| `components/copy-button.tsx`            | Replace Check icon; remove hardcoded green colours                                                 |
| `components/sound-grid.tsx`             | Remove transition-opacity duration class if transform-based                                        |
| `components/sounds-page.tsx`            | Remove stagger-fade-up; restructure to match wireframe layout                                      |
| `components/global-fiters.tsx`          | Remove stagger-fade-up class                                                                       |
| `components/sound-player.tsx`           | Remove transform-based transitions                                                                 |
| `components/clickable-with-sound.tsx`   | Replace @radix-ui/react-slot Slot with native approach                                             |
| `components/mini-sound-equalizer.tsx`   | Remove eq-bar-mini animation class; render static bars only                                        |
| `app/layout.tsx`                        | Remove Footer import/render                                                                        |
| `app/globals.css`                       | Remove unused CSS blocks (grain, eq, fade-up, hero bars, reduced motion)                           |

### Icon Migration Map

| Lucide Icon    | Remix Icon Replacement |
| -------------- | ---------------------- |
| `Check`        | `RiCheckLine`          |
| `Copy`         | `RiFileCopyLine`       |
| `Search`       | `RiSearchLine`         |
| `Moon`         | `RiMoonLine`           |
| `Sun`          | `RiSunLine`            |
| `Github`       | `RiGithubLine`         |
| `Download`     | `RiDownloadLine`       |
| `Play`         | `RiPlayFill`           |
| `Square`       | `RiStopFill`           |
| `Loader2`      | `RiLoader4Line`        |
| `ArrowUpRight` | `RiArrowRightUpLine`   |
| `ArrowLeft`    | `RiArrowLeftLine`      |
| `Clock`        | `RiTimeLine`           |
| `HardDrive`    | `RiHardDriveLine`      |
| `Scale`        | `RiScales3Line`        |
| `Tag`          | `RiPriceTag3Line`      |
| `Heart`        | `RiHeartLine`          |
| `Sparkles`     | `RiSparklingLine`      |

### Colour Replacement Map

| Hardcoded Colour                                          | Semantic Replacement                 |
| --------------------------------------------------------- | ------------------------------------ |
| `text-green-500`, `text-green-600`, `dark:text-green-400` | `text-primary` (for success states)  |
| `bg-green-500/10`, `border-green-500/30`                  | `bg-primary/10`, `border-primary/30` |
| `bg-black/10`                                             | `bg-muted`                           |

### Landing Page Component Tree (After Redesign)

```
<Layout>
  <Header>
    <AppLogo />           ← logo on left
    <ThemeToggle />       ← right side
    <GithubButton />      ← right side
  </Header>
  <AudioPage>
    <Hero>
      <h1>heading with primary + muted-foreground styling</h1>
      <p>subtitle</p>
      <HeroInstallationCode />
    </Hero>
    <GlobalFilters>       ← Search section
      <SoundSearch />
    </GlobalFilters>
    <main>
      <SoundGrid />       ← Sound card grid
    </main>
    <SoundDetail />       ← Drawer (existing)
  </AudioPage>
</Layout>
```

## Data Models

No data model changes are required. The `AudioCatalogItem` type and audio registry remain unchanged. This redesign is purely presentational.

## Error Handling

No new error handling is required. Existing error boundaries and fallback states remain unchanged. The removal of animations and decorative elements does not introduce new failure modes.

**3. Visual Regression (Optional)**

Screenshot comparison tests to catch unintended visual changes during the migration. Useful for verifying the theme token replacements produce acceptable results.

**4. Build Verification**

- `next build` completes without errors after all changes
- No TypeScript errors from removed/changed imports
- No runtime console errors on page load
