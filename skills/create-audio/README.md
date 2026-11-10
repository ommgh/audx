# create-audio

Cursor agent skill that produces a `SoundDefinition` for [@litlab/audx](../../package/core) from any input — a natural-language prompt, an audio file the user shares, or both.

The skill follows the [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) layout: each rule is its own short markdown file in `rules/`, and a build step compiles them into a single `SKILL.md` that Cursor autoloads.

## Layout

```
metadata.json     # name, version, organization, abstract
README.md         # this file
SKILL.md          # GENERATED entry point Cursor reads
test-cases.json   # GENERATED LLM eval cases
rules/
  _sections.md    # section metadata (titles, order, descriptions)
  _template.md    # copy this to add a new rule
  pipeline-*.md   # procedural steps (input routing, emit, render)
  interpret-*.md  # FFT analysis sub-steps (audio path)
  event-*.md      # one per UI event class (prompt path)
  mood-*.md       # one per mood adjective (prompt path)
  layer-*.md      # layering patterns (shared)
  effect-*.md     # effect recipes (shared)
  validate-*.md   # output checks (shared)
src/
  build.mjs       # rules/*.md -> SKILL.md
  validate.mjs    # frontmatter + section prefix + example shape
  extract-tests.mjs # rule examples -> test-cases.json
  analyze.py      # FFT helpers reused by interpret-* rules
```

`SKILL.md` is generated, not hand-edited.

## Workflow

```bash
# Add or edit a rule under rules/, then:
bun run --cwd skills/create-audio build       # rebuild SKILL.md
bun run --cwd skills/create-audio validate    # check frontmatter + examples
bun run --cwd skills/create-audio extract-tests  # rebuild test-cases.json
```

## Adding a new rule

1. Copy `rules/_template.md` to `rules/<prefix>-<short-name>.md`.
2. Pick the prefix that matches the section (see `rules/_sections.md`).
3. Fill in the frontmatter and content.
4. For prompt-path rules, include a concrete `prompt` and `example` so it contributes a test case.
5. Run `pnpm dev` to rebuild and validate.

## Sections

Filename prefix → section. Defined once in [rules/_sections.md](rules/_sections.md).

| Prefix       | Section                                            |
| ------------ | -------------------------------------------------- |
| `pipeline-`  | Generation pipeline                                |
| `interpret-` | FFT analysis when the input is audio               |
| `event-`     | UI event recipes (prompt path)                     |
| `mood-`      | Mood / adjective vocabulary (prompt path)          |
| `layer-`     | Layering patterns (shared)                         |
| `effect-`    | Effect recipes (shared)                            |
| `validate-`  | Output validation (shared)                         |

## Source surface

The skill is grounded in real shapes from the codebase:

- [`package/core/src/types.ts`](../../package/core/src/types.ts) — full `SoundDefinition` surface.
- [`package/core/schemas/theme.schema.json`](../../package/core/schemas/theme.schema.json) — JSON Schema (`#/$defs/SoundDefinition`) used by `validate-schema-conformance`.
- [`package/core/src/offline.ts`](../../package/core/src/offline.ts) — `renderToWav` for previews and round-trip checks.
- [`package/core/src/catalog.ts`](../../package/core/src/catalog.ts) — the 43 semantic sound names every built-in theme ships.
- [`scripts/sounds/themes/`](../../scripts/sounds/themes) — the built-in themes (minimal, playful, mechanical, retro), written as worked examples of the `event-*` and `mood-*` recipes.
