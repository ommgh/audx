# Product Overview

audx is an open-source library of customizable UI sound effects for modern web apps. It provides a browsable catalog of audio assets (clicks, scrolls, notifications, etc.) that developers can preview, install, and integrate into their projects with a single command.

The project has two main surfaces:

1. **Website** (audx.site) — A Next.js app where users browse, preview, and get install instructions for audio assets. Includes an AI-powered sound generation feature via ElevenLabs.
2. **CLI** (`@litlab/audx`) — A Node.js CLI tool for managing audio assets locally: init, add, remove, update, diff, list, generate, and theme management.

Audio assets are distributed through a shadcn-compatible registry. Each sound is a TypeScript module containing a base64-encoded data URI, played via the Web Audio API at runtime — no external audio file downloads needed.
