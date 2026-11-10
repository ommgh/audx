export const accordionDataV0_8_5 = [
  {
    type: "new",
    items: [
      "Added the Visual Audio Editor for precise wave editing",
      "Introduced the Theme Generator to visually customize audio themes",
      "New Library section for managing and viewing user-generated themes",
    ],
  },
  {
    type: "updates",
    items: [
      "Updated the CLI tool to support installing custom created sounds directly",
      "Improved performance when rendering complex audio waveforms",
      "Refined the UI layout to better accommodate the new library features",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Fixed an issue where large audio files could cause memory spikes during playback",
      "Resolved a bug causing the CLI to fail when the output directory contained spaces",
      "Fixed incorrect timeline scaling for long audio tracks",
    ],
    badges: ["cli", "editor", "themes"],
  },
];
export const accordionDataV0_6_0 = [
  {
    type: "new",
    items: [
      "Real-time audio effect previews directly in the playback engine",
      "Multi-track audio support for layering multiple sound sources",
      "Export capabilities for high-quality FLAC and WAV formats",
    ],
  },
  {
    type: "updates",
    items: [
      "Upgraded the audio processing engine for 40% faster rendering",
      "Enhanced timeline zoom behavior to keep playhead centered",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Fixed audio crackling during high-CPU usage scenarios",
      "Corrected track volume sliders occasionally resetting on load",
      "Resolved an issue with MP3 metadata not saving properly on export",
      "Fixed UI stutter when rapidly toggling mute states",
    ],
  },
];
export const accordionDataV0_5_0 = [
  {
    type: "new",
    items: [
      "Complete overhaul of the audio playback engine for lower latency",
      "New preset soundscapes and ambient loops for quick prototyping",
      "Global spectrum analyzer to view frequency bands across all tracks",
      "Shareable project links to collaborate with team members on mixes",
    ],
  },
  {
    type: "updates",
    items: [
      "Smarter audio buffering for uninterrupted playback on low-end devices",
      "Improved EQ interface with more granular control points",
      "Faster waveform rendering when opening projects",
      "Clearer error messages when importing unsupported audio formats",
    ],
  },
  {
    type: "bugfixes",
    items: [
      "Fixed broken project references when moving source files",
      "Corrected UI misalignment in the track effects panel",
      "Resolved lag when applying heavy reverb plugins",
    ],
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
