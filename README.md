# FACTORINODE

FACTORINODE is a node-based factory automation game inspired by Blender's node editor. Place machines, connect typed ports, route materials and power, unlock technologies, and save your factory's progress in the browser.

[Play the current GitHub Pages build](https://forzenacademy.github.io/node/)

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

## Checks

```bash
npm run lint
npm run build
```

## GitHub Pages release

```bash
npm run release
```

The release script creates a production build for the `/node/` path and copies it into `../vectorsaur-live/node`. It expects the GitHub Pages repository to be checked out beside this source repository.

## Project layout

- `app/page.tsx` — game simulation, node graph, menus, persistence, and interactions
- `app/globals.css` — node editor and interface styling
- `components/ui/` — reusable interface components
- `scripts/release-build.mjs` — GitHub Pages release builder
