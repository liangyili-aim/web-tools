# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Three standalone Python CLI scripts at the repo root (`emailchk`, `ipchk`, `pwdgen` — extensionless, executable, stdlib only) and a Vue 3 web app in `my-web-tools/` that re-implements the same tools in the browser. The web app is deployed to GitHub Pages; all processing is client-side with no backend.

## Commands

All npm commands must be run from `my-web-tools/`, not the repo root.

```bash
cd my-web-tools
npm install
npm run dev       # Vite dev server
npm run build     # production build to my-web-tools/dist
npm run preview   # serve the production build
```

There is no test runner, linter, or formatter configured.

The Python CLIs run directly (`./emailchk`, `./ipchk`, `./pwdgen`); they are meant to be copied into `/usr/local/bin`.

## Architecture

- **Each tool exists twice.** The Python script is the original; `my-web-tools/src/utils/{email,ip,pwd}Utils.js` is its JavaScript port. When changing a tool's logic (extraction regexes, normalization, character sets, validation limits), update both implementations so they stay consistent — recent history shows fixes being applied to each side in separate commits.
- **Views vs. utils.** `src/views/*.vue` hold UI and state only (`<script setup>`, Composition API); the pure logic lives in `src/utils/*.js` and is imported by the matching view. Adding a tool means: a util module, a view, a route in `src/router.js`, and a card on `Home.vue`.
- **Python stdlib → JS equivalents** (from `tech-stack`): `ipaddress` → `ipaddr.js`; `secrets` → `crypto.getRandomValues()` (never `Math.random()` for password generation); `csv` → string building + `Blob`/`URL.createObjectURL` download, no CSV library.
- **Email normalization** (both implementations): NFKC normalize, fullwidth → halfwidth, strip zero-width characters, lowercase, then regex-extract. This exists to handle Japanese-input text such as `＠`.
- **Styling:** Tailwind CSS + DaisyUI component classes; the theme is fixed to `corporate` via `data-theme` in `App.vue`.
- **UI text and README are in Japanese.** Keep user-facing strings in Japanese.

## Deployment

`.github/workflows/deploy.yml` builds `my-web-tools` and deploys `dist` to GitHub Pages on every push to `main`.

- `vite.config.js` sets `base: '/web-tools/'` and the router uses `createWebHistory(import.meta.env.BASE_URL)`. The base must match the GitHub repository name.
- SPA fallback for GitHub Pages: the `build` script copies `dist/index.html` to `dist/404.html`, so deep links such as `/web-tools/ip-checker` boot the app and the router resolves the path. Do not add a redirect-script `public/404.html` (an earlier attempt, `5e8f39d`, was reverted).
- DaisyUI classes must appear as full literal strings in source (e.g. `progress-success`); concatenated names like `` `progress-${color}` `` are purged from the production CSS.
