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
