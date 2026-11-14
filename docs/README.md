# audx docs

Source for the audx documentation site, built with [Mintlify](https://mintlify.com).

## Develop

```bash
cd docs
npx mint@latest dev        # preview at http://localhost:3000
npx mint@latest validate   # check the build
npx mint@latest broken-links
```

Pages are MDX files; navigation lives in `docs.json`. A page that isn't listed in `docs.json` won't appear in the sidebar.

## Publish

Changes deploy automatically when they are merged to the default branch.
