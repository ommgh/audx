# @litlab/audx

UI sound effects you own as code. Pick a theme, add the sounds you need, and call them like functions. No audio files: every sound is a few hundred bytes of JSON synthesized with the Web Audio API.

Browse and preview every sound at [audx.site](https://audx.site), or hear them in real components at [audx.site/showcase](https://audx.site/showcase). Guides and the full reference live at [docs.audx.site](https://docs.audx.site).

## Quick start

```bash
npx @litlab/audx init
```

`init` creates `audx.json`, installs `@litlab/audx`, and lets you pick a starter set of sounds. They land in `src/sounds/` as plain TypeScript:

```ts
import { click, success, error } from "@/sounds";

click();

try {
  await save();
  success();
} catch {
  error();
}
```

In React, `useSound` respects `<SoundProvider>` mute/volume and the user's reduced-motion preference:

```tsx
import { useSound } from "@litlab/audx/react";
import { click } from "@/sounds";

function SaveButton() {
  const play = useSound(click);
  return <button onClick={play}>Save</button>;
}
```

## Themes

Every first-party theme ships the same 43 semantic sounds, so you can change the personality of your whole app without touching code:

| Theme        | Character                                                   |
| ------------ | ----------------------------------------------------------- |
| `minimal`    | Quiet and precise. Pure sine tones and soft air.            |
| `playful`    | Bouncy and bright. Springy bloops and pentatonic chimes.    |
| `mechanical` | Tactile. Key switches, latches and relays.                  |
| `retro`      | 8-bit. Square waves and bit-crushed noise.                  |

```bash
npx @litlab/audx theme playful   # regenerates every installed sound
```

## CLI

```
npx @litlab/audx <command>

  init                 Set up audx in this project
  add [sounds...]      Add sounds (opens a picker without arguments)
  remove [sounds...]   Remove installed sounds
  list [search]        Browse sounds in your theme (--themes for themes)
  theme [name]         Show or switch the theme of every installed sound
  update               Pull the latest version of installed sounds
  create <name>        Start a custom theme from an existing one
```

Useful flags: `--theme <name|url|./file.json>`, `--all`, `--overwrite`, `--yes` (no prompts, also the default in CI), `--cwd <path>`. Run `npx @litlab/audx <command> --help` for details.

```bash
npx @litlab/audx add click success error      # specific sounds
npx @litlab/audx add --all --theme mechanical  # a whole theme
npx @litlab/audx list feedback                 # search the catalog
npx @litlab/audx update --check                # see what changed upstream
```

### `audx.json`

```json
{
  "$schema": "https://audx.site/schemas/config.json",
  "theme": "minimal",
  "dir": "src/sounds"
}
```

### Sound categories

| Category     | Sounds                                                              |
| ------------ | ------------------------------------------------------------------- |
| Input        | click, tap, press, release, hover, focus, blur, type, tick          |
| Selection    | toggle, enable, disable, select, deselect, tab                      |
| Navigation   | open, close, expand, collapse, back, forward, scroll, slide         |
| Editing      | copy, paste, undo, clear, delete, drag, drop                        |
| Feedback     | success, complete, error, warning, deny, info                       |
| Notification | notify, send, receive, pop                                          |
| Status       | loading, lock, unlock                                               |

`delete` is exported as `deleteSound` because `delete` is a reserved word.

## Custom themes

```bash
npx @litlab/audx create brand --from mechanical
# edit ./audx/themes/brand.json (your editor autocompletes it), then:
npx @litlab/audx theme ./audx/themes/brand.json
```

Themes can also be loaded from any URL: `npx @litlab/audx theme https://example.com/brand.json`.

## Library API

```ts
import { defineSound, setMuted } from "@litlab/audx";

const pop = defineSound({
  source: { type: "sine", frequency: { start: 300, end: 1000 } },
  envelope: { attack: 0.001, decay: 0.04 },
  gain: 0.2,
});

pop();
pop({ volume: 0.5, jitter: { detune: 50 } }); // vary repeats so they feel natural

setMuted(true); // global mute, e.g. from a user setting
```

| Export | Description |
| --- | --- |
| `defineSound(def)` | Returns a playable `Sound`. Safe to call during SSR. |
| `setMuted(bool)` / `isMuted()` | Global mute for everything audx plays |
| `setMasterVolume(v)` | Master volume (0 to 1) |
| `definePatch(json)` / `loadPatch(url)` | Work with a whole theme at runtime |
| `defineSequence(steps)` | Schedule several sounds on a timeline |
| `renderToWav(def, opts)` | Render a sound offline to a WAV blob |
| `sine` / `triangle` / `square` / `sawtooth` / `noise` | One-line shorthands |

From `@litlab/audx/react`: `SoundProvider`, `useSound`, `usePatch`, `useSequence`, `useAnalyser`, `useListener`.

From `@litlab/audx/catalog`: `SOUND_CATALOG` (names, categories, usage notes).

## License

MIT
