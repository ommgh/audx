## <img src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1777189809/audx-banner-final_rl6wci.png">


Open-source library of customizable UI sound effects for modern web apps. Browse, preview, and install audio assets — clicks, scrolls, notifications, and more — with a single command.

---

[![skills.sh](https://skills.sh/b/ommgh/audx)](https://skills.sh/ommgh/audx)
[![npm](https://img.shields.io/npm/v/%40litlab%2Faudx)](https://www.npmjs.com/package/@litlab/audx)
[![license](https://img.shields.io/github/license/ommgh/audx)](LICENSE)
[![CI](https://github.com/ommgh/audx/actions/workflows/publish.yml/badge.svg)](https://github.com/ommgh/audx/actions/workflows/publish.yml)
[![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Faudx.site)](https://audx.site)

---

## Quick Start

```bash
# Install the CLI
npm install @litlab/audx

# Initialize in your project
npx @litlab/audx init

# Browse available sounds
npx @litlab/audx list

# Add a sound
npx @litlab/audx add
```


## Development

```bash
bun install
bun run dev           # Start dev server (Turbopack)
bun run build         # Production build
bun run lint          # Biome check (lint + format)
```

### CLI

```bash
cd package
npm install
npm run build         # Compile TypeScript
npm run test          # Run tests (vitest)
```

## Requirements

- Node.js 18+
- Bun (for website development)

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
