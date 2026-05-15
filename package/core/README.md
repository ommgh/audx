# @litlab/audx

Declarative audio synthesis for the web. Describe sounds as plain objects, play them with one function call.

## Install

```bash
npm install @litlab/audx
```

## Usage

### Define and play a sound

```ts
import { defineSound, ensureReady } from "@litlab/audx";

const pop = defineSound({
  source: { type: "sine", frequency: { start: 1200, end: 300 } },
  envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
  gain: 0.3,
});

await ensureReady();
pop();
```

### Shorthand helpers

```ts
import { sine, noise } from "@litlab/audx";

const beep = sine(440, 0.1);
const click = noise("white", 0.02);

beep();
click();
```

### Sound patches (React)

```tsx
import { usePatch } from "@litlab/audx/react";

function App() {
  const patch = usePatch("/patches/core.json");

  return (
    <button onClick={() => patch.play("click")} disabled={!patch.ready}>
      Click me
    </button>
  );
}
```

### Sound patches (vanilla)

```ts
import { loadPatch } from "@litlab/audx";

const patch = await loadPatch("/patches/core.json");
patch.play("click");
```

## CLI

```bash
# Browse and install patches from the registry
npx @litlab/audx add

# Install patches from a GitHub repo
npx @litlab/audx add user/repo

# Create a new sound patch
npx @litlab/audx init

# List installed patches
npx @litlab/audx list

# Remove installed patches
npx @litlab/audx remove
```

## Patch authoring

Create a patch JSON file with `npx @litlab/audx init`, then add sound definitions to the `sounds` object:

```json
{
  "$schema": "node_modules/@litlab/audx/schemas/patch.schema.json",
  "name": "my-patch",
  "sounds": {
    "click": {
      "source": { "type": "noise", "color": "white" },
      "filter": { "type": "bandpass", "frequency": 2000 },
      "envelope": { "decay": 0.05 }
    }
  }
}
```

Push it to a GitHub repo. Others can install it with:

```bash
npx @litlab/audx add your-username/your-repo
```

## API

| Export | Description |
|--------|-------------|
| `defineSound(def)` | Create a reusable play function from a sound definition |
| `ensureReady()` | Initialize the audio context (call before first play) |
| `sine(freq, decay)` | Shorthand for sine oscillator |
| `triangle(freq, decay)` | Shorthand for triangle oscillator |
| `square(freq, decay)` | Shorthand for square oscillator |
| `sawtooth(freq, decay)` | Shorthand for sawtooth oscillator |
| `noise(color, decay)` | Shorthand for noise generator |
| `loadPatch(url)` | Load a sound patch from a URL |
| `definePatch(json)` | Create a patch from a JSON object |
| `usePatch(url)` | React hook for loading and playing patches |

## Documentation

Full docs at [audx.site](https://audx.site).

## License

[MIT](https://github.com/ommgh/audio/blob/main/LICENSE)
