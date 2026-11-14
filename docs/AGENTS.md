# Documentation project instructions

## About this project

- Run `npx mint@latest instructions` before any Mintlify task for current CLI guidance
- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

## Terminology

- The product is "audx" (lowercase). The npm package is `@litlab/audx`.
- A "sound" is one semantic UI sound such as `click`; a "theme" is a full set of sounds (`minimal`, `playful`, `mechanical`, `retro`).
- A "sound definition" is the JSON that describes a sound; a "patch" is a theme loaded at runtime.
- Write CLI commands as `npx @litlab/audx <command>`.

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

- Source of truth is `package/core/src` in this repo. Don't document behavior that isn't in the code.
- Don't document the audx.site web app internals (auth, payments, editor implementation).
