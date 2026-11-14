export const accordionDataV0_8_5 = [
  {
    type: "new",
    items: [
      "Sound editor on audx.site: tweak any sound with a mixer, XY pad and live waveform preview",
      "Theme generator: shape a whole theme from tone (soft to bold, warm to bright), length, volume, motion and waveform",
      "Save generated themes to your library and reopen them from your profile",
      "Bento page that plays every sound inside live UI components",
      "`audx add` installs a sound you customized on audx.site straight into your project",
    ],
  },
  {
    type: "updates",
    items: [
      "Redesigned the editor layout with a bar visualizer and step matrix",
      "Refreshed hero section and branding on the landing page",
      "New changelog page",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Reworked sounds that were too similar to tell apart",
      "Fixed sign-in redirecting to the wrong URL in production",
    ],
    badges: ["editor", "themes", "cli"],
  },
];
export const accordionDataV0_6_0 = [
  {
    type: "new",
    items: [
      "Preview mixing panel in the editor to audition and balance sounds before you install them",
    ],
  },
  {
    type: "updates",
    items: [
      "CLI now talks about themes instead of patches: `add`, `list`, `remove` and `update` all work on themes",
      "Clearer messages when a file is not a valid theme",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Fixed the library page failing to load saved themes",
      "Fixed layout issues on signed-in pages",
      "Fixed the CLI package build and tests in CI",
    ],
    badges: ["cli", "themes", "editor"],
  },
];
export const accordionDataV0_5_0 = [
  {
    type: "new",
    items: [
      "New synthesis engine: describe a sound as a plain object and play it with `defineSound`, no audio files",
      "Layers, filters, envelopes, LFOs and effects such as reverb, delay and bitcrusher",
      "React bindings: `SoundProvider`, `useSound`, `usePatch`, `useSequence` and `useAnalyser`",
      "Sounds organized by meaning (click, tap, toggle, success) across the minimal and playful themes",
      "create-sound agent skill: generate sound definitions from a prompt or an audio file",
    ],
  },
  {
    type: "updates",
    items: [
      "Rebuilt CLI with `init`, `add`, `list`, `remove`, `update` and `find`, installing from the registry, a GitHub repository or a local path",
      "Offline rendering to WAV with `renderToWav`",
      "Accounts and profiles on audx.site",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Fixed `audx init`",
      "Fixed install commands for each package manager",
      "Fixed play controls on sound cards",
    ],
    badges: ["engine", "react", "cli"],
  },
];
export const accordionDataV0_9_0 = [
  {
    type: "new",
    items: [
      "Four redesigned themes (minimal, playful, mechanical, retro), each with the same 43 semantic sounds",
      "Showcase page: hear every sound inside real components and flip any card to see the code",
      "`audx theme <name>` re-skins every installed sound in one command",
      "Interactive sound picker grouped by category, plus `audx list` with search",
      "`audx create` starts a custom theme from an existing one",
      "Global mute with `setMuted()`, and `useSound(click)` accepts generated sounds directly",
    ],
  },
  {
    type: "updates",
    items: [
      "Sounds are generated into `src/sounds/` as one file per sound with an index barrel",
      "Project config moved to `audx.json` with a JSON schema for autocomplete",
      "Loudness is normalized per role so a click never drowns out an error",
      "No prompts in CI, typo suggestions for sounds, themes and commands, per-command `--help`",
      "`defineSound` is safe to call during server rendering",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Built-in themes are always served fresh instead of from a stale database copy",
      "Sitemap URLs no longer repeat the /audio prefix",
    ],
    badges: ["cli", "themes", "showcase"],
  },
];
