# Requirements Document

## Introduction

Refine the audx home page to surface theme selection and category filtering directly on the main browse experience. Currently, themes are only accessible via a separate `/themes` page and the sound grid shows all sounds without category-level filtering. This feature replaces the per-theme labeled grid with a theme selector dropdown, a "New Theme" button, and horizontal category badges for filtering — all on the home page. The "Themes" and "Create" navigation items are removed from the header since their functionality moves into the home page controls.

## Glossary

- **Audio_Page**: The main home page component (`components/audio-page.tsx`) that renders the hero, filters, and sound grid.
- **Header**: The site-wide navigation bar component (`components/header.tsx`).
- **Sound_Grid**: The grid component (`components/audio-grid.tsx`) that displays `AudioCatalogItem` cards.
- **Theme_Selector**: A dropdown control that lets the user pick from available themes (e.g., Minimal, Playful).
- **Category_Badge**: A clickable badge (shadcn/ui `Badge` component) representing a sound category (e.g., Feedback, Notification, Interaction).
- **Category_Bar**: A single-line, horizontally scrollable row of Category_Badges displayed above the Sound_Grid.
- **New_Theme_Button**: A button with a "+" icon that navigates the user to `/themes/create`.
- **Theme**: A named collection of semantic-to-audio mappings defined in `lib/theme-data.ts` (e.g., Minimal, Playful).
- **Category**: A grouping label for sounds within a theme (e.g., feedback, notification, interaction, navigation) as defined in the `CATEGORIES` map in `lib/theme-data.ts`.

## Requirements

### Requirement 1: Theme Selector on Home Page

**User Story:** As a user, I want to select a theme from a dropdown on the home page, so that I can browse sounds scoped to a specific theme without navigating away.

#### Acceptance Criteria

1. THE Audio_Page SHALL display a Theme_Selector dropdown above the Sound_Grid, aligned to the right side of the content area.
2. WHEN the Audio_Page loads, THE Theme_Selector SHALL default to the first available theme.
3. WHEN the user selects a theme from the Theme_Selector, THE Sound_Grid SHALL display only the sounds that belong to the selected theme.
4. THE Theme_Selector SHALL list all themes returned by the `getAllThemes` function from `lib/theme-data.ts`.
5. WHEN no sounds match the selected theme combined with the active search query, THE Sound_Grid SHALL display the existing empty state with a "Clear filters" action.

### Requirement 2: New Theme Button

**User Story:** As a user, I want a "New Theme" button next to the theme selector, so that I can quickly navigate to the theme creation page.

#### Acceptance Criteria

1. THE Audio_Page SHALL display a New_Theme_Button immediately to the right of the Theme_Selector.
2. THE New_Theme_Button SHALL display a "+" icon (using Remix Icon `RiAddLine`) alongside the text label.
3. WHEN the user activates the New_Theme_Button, THE Audio_Page SHALL navigate the user to the `/themes/create` route.

### Requirement 3: Category Badge Filtering

**User Story:** As a user, I want to filter sounds by category using badges on the home page, so that I can quickly find sounds in a specific category like Feedback or Notification.

#### Acceptance Criteria

1. THE Audio_Page SHALL display a Category_Bar of Category_Badges above the Sound_Grid, below the theme/search controls.
2. THE Category_Bar SHALL render badges for all unique categories present in the currently selected theme's sounds.
3. Each Category_Badge SHALL display the category name followed by the count of sounds in that category in parentheses, e.g. `Feedback (9)`.
4. THE Category_Bar SHALL be displayed in a single horizontal line that scrolls horizontally when badges overflow the available width, without wrapping to a second line.
4. WHEN no category is selected, THE Sound_Grid SHALL display all sounds for the selected theme.
5. WHEN the user selects a Category_Badge, THE Sound_Grid SHALL display only sounds belonging to that category within the selected theme.
6. WHEN the user selects an already-active Category_Badge, THE Audio_Page SHALL deselect it and show all sounds for the selected theme.
7. WHEN the user selects a different theme from the Theme_Selector, THE Audio_Page SHALL reset the category selection and show all categories for the new theme.
8. THE Category_Badge components SHALL use the shadcn/ui `Badge` component from `components/ui/badge.tsx`.
9. THE Audio_Page SHALL NOT display the `SoundsCountTitle` ("X Audios") above the Sound_Grid. Category counts are shown inline in each Category_Badge instead.

### Requirement 4: Remove Header Navigation Items

**User Story:** As a user, I want a cleaner header now that theme and creation functionality is accessible from the home page, so that the navigation is not redundant.

#### Acceptance Criteria

1. THE Header SHALL NOT display a "Themes" navigation link.
2. THE Header SHALL NOT display a "Create" navigation link.
3. THE Header SHALL continue to display the AppLogo, ThemeToggle, GithubStartsButton, and Generate link.

### Requirement 5: UI Component Usage

**User Story:** As a developer, I want the implementation to use only shadcn/ui components, so that the design system remains consistent.

#### Acceptance Criteria

1. THE Theme_Selector SHALL be implemented using the shadcn/ui dropdown or select component.
2. THE Category_Badge components SHALL be implemented using the shadcn/ui `Badge` component.
3. THE New_Theme_Button SHALL be implemented using the shadcn/ui `Button` component or a styled `Link` element consistent with the existing design system.
