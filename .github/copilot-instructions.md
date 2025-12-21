# Copilot instructions for Workflow-Management

Purpose
- Help AI coding agents be immediately productive in this Vite + React + TypeScript SPA.

Big picture (what to know first)
- This is a frontend-only single-page app using Vite + React + TypeScript.
- App entry: `src/main.tsx` (bootstraps React root). Primary UI lives in `src/App.tsx`.
- Static assets are served from `public/` and `src/assets/`.
- Build flow runs TypeScript build before Vite: `npm run build` -> `tsc -b` then `vite build` (see `package.json`).

Key files to inspect
- `package.json` — scripts: `dev`, `build`, `preview`, `lint`.
- `vite.config.ts` — Vite plugins and dev server config.
- `tsconfig.app.json` and `tsconfig.node.json` — TypeScript project boundaries used by `tsc` and ESLint.
- `eslint.config.js` — project linting rules and any type-aware rules referenced in README.
- `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/App.css` — common modification points.

Developer workflows (concrete commands)
- Start dev server with HMR:
```bash
npm run dev
```
- Build production bundle (runs TypeScript project build first):
```bash
npm run build
```
- Preview a production build locally:
```bash
npm run preview
```
- Run linter across project:
```bash
npm run lint
```

Project-specific patterns & notes
- TypeScript-first build: the `build` script runs `tsc -b` before `vite build`. When changing project references or tsconfig, run `npm run build` to validate type-checked output.
- ESLint may use `tsconfig.app.json` / `tsconfig.node.json` (see `eslint.config.js` and README examples). Prefer editing those configs for type-aware rules.
- No test framework discovered — changes should be validated manually via `npm run dev` or `npm run build`.

Integration points / external deps
- Runtime deps: `react`, `react-dom`.
- Dev-time tooling: `vite`, `@vitejs/plugin-react`, `typescript`, `eslint` and related plugins.
- Static files in `public/` are copied to the build root — update there for favicon/meta assets.

Guidelines for AI edits (concrete, actionable)
- Keep PRs focused and small: tweak one logical area (component, config, or build) per PR.
- When changing build or TypeScript settings, run `npm run build` and fix any `tsc` errors; the repo relies on `tsc -b` as part of the build.
- Edit `vite.config.ts` to add/remove dev plugins or server proxy rules; edit `eslint.config.js` to change lint behavior.
- Before updating dependencies, check `package.json` scripts and devDependencies; prefer minimal dependency bumps.

Examples to look at when implementing features
- Add UI component: create `src/components/<Name>/index.tsx` and a CSS file, import into `src/App.tsx`.
- Add asset: put images in `src/assets/` and reference with `import logo from './assets/logo.png'`.

If something is unclear or you need deeper access (API backends, CI, or infra), ask for the location of the missing files or credentials required. After changes, request the user to run `npm run dev` or `npm run build` locally to verify runtime behavior.

— End of file
