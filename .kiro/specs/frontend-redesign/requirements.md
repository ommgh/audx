# Requirements Document

## Introduction

This feature covers a comprehensive frontend redesign of the audx application — a Next.js app for customisable UI audio/sound effects. The redesign involves cleaning up unused CSS, returning to a basic shadcn theme, migrating icon and primitive libraries, removing all animations, and redesigning the landing page to match a new wireframe layout. The goal is a clean, minimal, animation-free UI that relies entirely on shadcn/ui components with the base-lyra style, @remixicon/react icons, and @base-ui/react primitives.

## Glossary

- **App**: The audx Next.js 15 application
- **Global_Stylesheet**: The `app/globals.css` file containing CSS variables, base styles, keyframes, and utility classes
- **Theme_Variables**: The shadcn CSS custom properties (oklch colour tokens, radius, sidebar variables) defined in `:root` and `.dark` selectors within the Global_Stylesheet
- **Base_Layer**: The `@layer base` block in the Global_Stylesheet that applies `border-border`, `outline-ring/50`, `bg-background`, `text-foreground`, and `isolation: isolate`
- **Scrollbar_Utilities**: The `@layer utilities` block in the Global_Stylesheet containing `.scrollbar-hide` and `.scrollbar-thin` classes
- **Blink_Caret_Keyframe**: The `@keyframes blink-caret` CSS animation used by the `hero-installation-code.tsx` component for the CLI cursor
- **Unused_CSS**: CSS blocks in the Global_Stylesheet that are not part of Theme_Variables, Base_Layer, Scrollbar_Utilities, or Blink_Caret_Keyframe — specifically: grain texture overlay, reduced motion section, sponsor marquee, pause hero bars, roadmap scroll, mini EQ bars, staggered entrance animation (`fade-up`), and equalizer animation (`eq`)
- **Shadcn_Component**: A UI component installed via `bunx --bun shadcn@latest add <component>` and located in `components/ui/`
- **Hardcoded_Color**: Any Tailwind colour class that uses a literal colour value (e.g. `text-green-500`, `bg-black/10`, `text-amber-500`) instead of a semantic theme token (e.g. `text-primary`, `bg-muted`)
- **Custom_Font_Style**: Any manually applied font style modification in component code such as `font-display`, hardcoded `font-bold` on brand text, or non-standard font class usage beyond what the shadcn theme provides
- **Lucide_Import**: Any `import` statement referencing the `lucide-react` package
- **Radix_Import**: Any `import` statement referencing `@radix-ui/react-*` packages
- **Remix_Icon**: An icon component from the `@remixicon/react` package
- **Animation_Class**: Any Tailwind or custom CSS class that produces motion — including `animate-*`, `transition-*`, `hover:scale-*`, `active:scale-*`, `stagger-fade-up`, `eq-bar-mini`, `hero-eq-bar`, `animate-ping`, `animate-spin`, and inline `animation:` style properties
- **Landing_Page**: The page rendered at the root URL (`/`) of the App
- **Hero_Section**: The top section of the Landing_Page containing the heading, subtitle, and CLI installation block
- **Hero_CLI_Block**: The `components/hero-installation-code.tsx` component that displays a typewriter-animated CLI install command
- **Search_Section**: The section of the Landing_Page containing the search input with ⌘K shortcut indicator
- **Sound_Card_Grid**: The grid of audio cards displayed below the Search_Section on the Landing_Page
- **Header**: The sticky top navigation bar containing the logo, theme toggle, and GitHub button
- **Footer**: No Footer Remove the Footer from the application

## Requirements

### Requirement 1: Remove Unused CSS from Global Stylesheet

**User Story:** As a developer, I want unused CSS removed from the Global_Stylesheet, so that the codebase contains only the styles that are actively used.

#### Acceptance Criteria

1. THE Global_Stylesheet SHALL retain the `@import "tailwindcss"` and `@import "tw-animate-css"` directives, the `@custom-variant dark` declaration, the `@theme inline` block, the Theme_Variables for `:root` and `.dark`, the Base_Layer, the Scrollbar_Utilities, and the Blink_Caret_Keyframe
2. THE Global_Stylesheet SHALL NOT contain the grain texture overlay (`body::after` block)
3. THE Global_Stylesheet SHALL NOT contain the equalizer animation (`@keyframes eq` and `.eq-bar-mini` rules)
4. THE Global_Stylesheet SHALL NOT contain the staggered entrance animation (`@keyframes fade-up` and `.stagger-fade-up` rules)
5. THE Global_Stylesheet SHALL NOT contain the pause hero bars rule (`[data-eq-paused] .hero-eq-bar`)
6. THE Global_Stylesheet SHALL NOT contain the reduced motion media query (`@media (prefers-reduced-motion: reduce)`)
7. WHEN a CSS block is removed from the Global_Stylesheet, THE App SHALL remove all references to the deleted CSS classes from component files (e.g. `stagger-fade-up`, `eq-bar-mini`, `hero-eq-bar`, `eq-bar-playing`)

### Requirement 2: Return to Basic Shadcn Theme

**User Story:** As a developer, I want the App to use only the shadcn theme system for styling, so that the visual design is consistent and maintainable without manual overrides.

#### Acceptance Criteria

1. THE App SHALL use only semantic theme token classes (e.g. `text-primary`, `bg-muted`, `text-destructive`) for colour styling in all component files
2. THE App SHALL NOT contain Hardcoded_Color classes in any component file (e.g. `text-green-500`, `text-green-600`, `dark:text-green-400`, `bg-green-500/10`, `border-green-500/30`, `bg-black/10`)
3. THE App SHALL NOT contain Custom_Font_Style modifications beyond what the shadcn theme and the font variables configured in `app/layout.tsx` provide
4. WHEN a Hardcoded_Color is found in a component, THE App SHALL replace the Hardcoded_Color with the closest semantic theme token equivalent

### Requirement 3: Migrate from lucide-react to @remixicon/react

**User Story:** As a developer, I want all icons to come from @remixicon/react, so that the App uses a single consistent icon library matching the shadcn configuration.

#### Acceptance Criteria

1. THE App SHALL NOT contain any Lucide_Import in any file
2. WHEN a lucide-react icon is used in a component, THE App SHALL replace the Lucide_Import with an equivalent Remix_Icon import from `@remixicon/react`
3. THE App SHALL use the Remix icon naming convention (`Ri<Name><Style>` e.g. `RiFileCopyLine`, `RiCheckLine`) for all icon references
4. WHEN a Remix_Icon is rendered, THE App SHALL apply sizing via the `size` prop (e.g. `size={16}`) instead of Tailwind `size-*` classes, matching the pixel dimensions of the replaced lucide icon

### Requirement 4: Migrate from @radix-ui to @base-ui/react

**User Story:** As a developer, I want all primitive UI components to use @base-ui/react instead of @radix-ui, so that the App uses the library matching the shadcn base-lyra style configuration.

#### Acceptance Criteria

1. THE App SHALL NOT contain any Radix_Import in any file outside of `components/ui/` and `registry/` directories
2. WHEN a component imports from `@radix-ui/react-slot` (e.g. `Slot`), THE App SHALL replace the import with the equivalent from `@base-ui/react` or an alternative approach compatible with @base-ui
3. THE App SHALL use Shadcn_Components installed via `bunx --bun shadcn@latest add <component>` for all UI primitives rather than importing @radix-ui or @base-ui directly in page or component files

### Requirement 5: Remove All Animations

**User Story:** As a developer, I want all animations removed from the UI, so that the App has a clean, static visual presentation with no motion effects.

#### Acceptance Criteria

1. THE App SHALL NOT contain any `stagger-fade-up` class usage in any component file
2. THE App SHALL NOT contain any `hover:scale-*` or `active:scale-*` Tailwind classes in any component file
3. THE App SHALL NOT contain any `animate-ping` or `animate-spin` class usage in any component file
4. THE App SHALL NOT contain any inline `animation:` style properties in any component file, except for the `blink-caret` animation used in the Hero_CLI_Block
5. THE App SHALL NOT render the `HeroBars` component (the animated equalizer background in the hero section)
6. THE App SHALL NOT render the `MiniSoundEqualizer` component with animated equalizer bars on sound cards
7. WHEN a `transition-*` class is used for colour or opacity changes on interactive elements (hover/focus states), THE App SHALL retain the transition for usability, but SHALL remove any transform-based transitions (scale, translate, rotate)

### Requirement 6: Redesign the Landing Page

**User Story:** As a developer, I want the Landing_Page redesigned to match the wireframe layout, so that the page has a clean, focused structure with header, hero, search, and sound card grid.

#### Acceptance Criteria

1. THE Header SHALL display the "audx" logo on the left side, and a theme toggle (moon/sun icon) and GitHub button on the right side
2. THE Header SHALL NOT display the `AppMenu` navigation component (the `MENU` constant is already empty)
3. THE Hero_Section SHALL display a large heading with the text "Customisable UI audio. Copy. Paste. Play." where "UI audio" is styled with the primary colour and "Copy. Paste. Play." is styled with the muted-foreground colour
4. THE Hero_Section SHALL display a subtitle with the text "Open-source UI sound effects for modern web apps. Install any audio with a single CLI command."
5. THE Hero_Section SHALL display the Hero_CLI_Block component centered below the subtitle
6. THE Hero_Section SHALL NOT display background blur circles or decorative gradient elements
7. THE Search_Section SHALL display a search input with placeholder text "Search audio..." and a ⌘K keyboard shortcut indicator
8. THE Search_Section SHALL be positioned between the Hero_Section and the Sound_Card_Grid
9. THE Sound_Card_Grid SHALL display audio cards in a responsive grid layout below the Search_Section
10. THE Landing_Page SHALL use the existing `SoundDetail` drawer component for audio detail viewing when a card is selected
