# Implementation Plan: Theme Editor Refinements

## Overview

Incremental changes to the theme editor flow: remove cost estimation logic from the hook and propagate removal through the component tree, hardcode duration to 1, redesign PreviewPlayer to a responsive grid, convert ThemeReview inner lists to grids, add inter-request delay and improved 429 handling to the API route, update schema limits, and add elapsed/estimated time to GenerationProgress. Final step runs lint + build to verify everything compiles cleanly.

## Tasks

- [x] 1. Remove cost estimation from useThemeEditor hook and hardcode duration
  - [x] 1.1 Remove cost imports, computed values, and fix duration in `hooks/use-theme-editor.ts`
    - Remove `import { type CostEstimate, estimateCost } from "@/lib/credit-cost"`
    - Remove `previewCost` and `fullCost` `useMemo` computations
    - Remove `previewCost` and `fullCost` from the return object and return type annotation
    - In `fetchSSE`, change `duration: template?.defaultDuration ?? 0.3` to `duration: 1`
    - In `retrySound`, change `duration: template.defaultDuration` to `duration: 1`
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_

- [x] 2. Update ThemeEditor orchestrator to stop passing removed props
  - [x] 2.1 Remove cost prop destructuring and passing in `components/theme-editor/theme-editor.tsx`
    - Remove `previewCost` and `fullCost` from the destructured `useThemeEditor()` return
    - Remove `previewCost` prop from `<PromptForm>` in the `idle` phase case
    - Remove `fullCost` prop from `<PreviewPlayer>` in the `preview-ready` phase case
    - Remove `previewCost` and `fullCost` from `PhaseRenderer` props (update the type accordingly)
    - Pass `startTime={state.startTime}` to both `<GenerationProgress>` renders (previewing and generating phases)
    - _Requirements: 1.4, 8.1_

- [x] 3. Remove cost display from PromptForm
  - [x] 3.1 Clean up cost-related code in `components/theme-editor/prompt-form.tsx`
    - Remove `previewCost: CostEstimate` from `PromptFormProps` interface
    - Remove `import type { CostEstimate } from "@/lib/credit-cost"`
    - Remove `costLabel` variable
    - Remove the `<p>` element rendering "Preview cost: {costLabel}"
    - Remove `previewCost` from the destructured props
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Redesign PreviewPlayer as responsive grid
  - [x] 4.1 Rewrite `components/theme-editor/preview-player.tsx` with grid layout
    - Remove `fullCost: CostEstimate` from `PreviewPlayerProps` and `import type { CostEstimate }`
    - Remove `expandedCategories` state and `toggleCategory` callback
    - Remove `costLabel` variable and cost paragraph
    - Remove the `groupByCategory` function and accordion-based rendering
    - Render preview sounds as a flat responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`
    - Each grid item is a `CategoryCard` with: category name header (capitalized), sound name, play button (completed), retry button (failed), or status indicator (pending/generating)
    - Keep "Try Again" and "Approve & Generate Full Theme" action buttons below the grid
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 5. Redesign ThemeReview with inner grid layout
  - [x] 5.1 Convert inner sound lists to responsive grids in `components/theme-editor/theme-review.tsx`
    - Keep the collapsible category accordion at the top level (preserve expand/collapse)
    - Replace the inner vertical list of `ReviewSoundRow` with a responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`
    - Each grid item is a bordered card with: sound name + status indicator, play button (completed), duration label + estimated file size (completed), retry button (failed)
    - Keep summary stats and Save button unchanged
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 6. Add elapsed time and estimated time to GenerationProgress
  - [x] 6.1 Update `components/theme-editor/generation-progress.tsx` with time tracking
    - Add `startTime: number | null` to `GenerationProgressProps`
    - Add a `useEffect` with a 1-second interval that computes elapsed time as `Date.now() - startTime`
    - Display "This may take a few minutes" informational message below the progress bar
    - Display elapsed time counter (e.g., "Elapsed: 1m 23s")
    - Compute estimated time remaining: `(total - done) * (elapsed / done)` where `done = completed + failed`
    - When `done < 2`, display "Estimating…" instead of a numeric time remaining
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Checkpoint — Verify UI changes
  - Ensure all component changes are consistent, ask the user if questions arise.

- [x] 8. Add inter-request delay and improved 429 handling to API route
  - [x] 8.1 Update throttling logic in `app/api/generate-theme/route.ts`
    - Add `const INTER_REQUEST_DELAY_MS = 1500` constant
    - In `processSound`, after the try/catch and before `release()`, add `if (soundJobs.length > 1) { await sleep(INTER_REQUEST_DELAY_MS); }` to insert delay between consecutive requests
    - Update the 429 handler in `generateSingleSound` to use exponential backoff: `const backoffMs = Math.pow(2, attempt) * 2000` and `const waitMs = Math.max(headerMs, backoffMs, 5000)`
    - Preserve existing behavior for single-sound retry requests (1 sound in payload)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Update schema limits
  - [x] 9.1 Update `lib/generate-theme-schema.ts` array max and save schema max
    - Change `sounds` array `.max(65)` to `.max(67)` in `generateThemeRequestSchema`
    - Change `sounds` array `.max(65)` to `.max(67)` in `saveThemeRequestSchema`
    - _Requirements: 7.1_

- [x] 10. Final verification — lint and build
  - Run `bun run lint` and `bun run build` to verify everything compiles and passes linting
  - Fix any errors that arise
  - _Requirements: all_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `/generate` page and `useSoundGenerator` hook are not modified (Requirement 4.4)
- `lib/credit-cost.ts` is not modified — it may be used elsewhere

## Agent Execution Rules (CRITICAL)

1. **NO intermediate testing**: Do NOT run linting (`bun run lint`), building (`bun run build`), type checking (`tsc --noEmit`), or any verification commands between tasks. Only run these at the very last task (Task 10). Just write the code and move on.
2. **Terminal output not visible? Move on**: If you execute a terminal command and cannot see the output, that is a known bug. Do NOT retry the command. Do NOT try alternative approaches to see the output. Simply move to the next step.
3. **Avoid commands requiring user confirmation**: If a command is not in your auto-approved list and requires user confirmation, defer it to the final task (Task 10) or use an alternative command from the auto-allowed list. Do not block on user confirmation mid-execution — time should not be wasted waiting.
