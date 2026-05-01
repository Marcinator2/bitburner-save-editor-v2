# Bitburner Save Editor v2 — Project Guidelines

## Overview

Web app for editing Bitburner save files (`.json`, `.json.gz`, `.gz`).
Target version: **Bitburner 2.8.1**. Live at [marcinator2.github.io/bitburner-save-editor-v2](https://marcinator2.github.io/bitburner-save-editor-v2/).

## Tech Stack

- **Vite** + **React 19** + **TypeScript 5**
- **MobX** (`makeAutoObservable`) for state management — no Redux, no Context API
- **Tailwind CSS** for styling — no separate CSS files except `index.css`
- **Ramda** for functional helpers

## Architecture

```
src/
  store/file.store.ts        # Central MobX store (FileStore) — single source of truth
  components/
    editor/
      section/               # One file per tab: *-section.tsx
      inputs/                # Reusable input components
    file-loader.tsx          # File upload / drag & drop
  bitburner.types.ts         # Bitburner types (SaveData, PlayerSaveObject, …)
  util/                      # Helper functions (compression, conversion, etc.)
```

- New editor tabs → new `*-section.tsx` in `src/components/editor/section/` + entry in `section/index.tsx`
- Save data must only be accessed via `FileStore` methods, never mutated directly except via `Object.assign` as in `updatePlayer`

## Types

- Bitburner types live in `src/bitburner.types.ts` (namespace `Bitburner`)
- Files in `bitburner-src-stable/` are reference only — do not import from them
- For missing types: use `as any` with a TODO comment, no type casting without reason

## Language

- Everything in **English**: variable names, comments, commit messages, UI labels, and Markdown files (`.md`)

## Code Style

- Functional components with TypeScript, no class components
- Props interfaces defined directly above the component (no separate `types.ts` per component)
- Tailwind classes inline, no `cn()`/`clsx()` except for conditional classes
- Neon green color scheme: primarily `text-green-400`, `border-green-800`, `bg-black`

## Build & Dev

```bash
npm install
npm run dev      # development server
npm run build    # tsc --noEmit + vite build
./start.sh       # shorthand for dev
```

## Conventions

- File format detection and roundtrip (gzip ↔ JSON ↔ base64) is handled in `FileStore`
- The `EditSaveFile` exploit is automatically applied when loading a save
- RAM values for servers are always powers of two (1–1048576 GB)

## Skill Level Calculation

Bitburner always recalculates skill levels from `exp` on load:

```
skill = calculateSkill(exp, mults.<stat> × currentNodeMults.<StatLevelMultiplier>)
```

The editor must therefore calculate the inverse when setting a level:

```
exp = calculateExp(desiredLevel, mults.<stat> × bnMult)
```

- `mults.<stat>` = augmentation multiplier from `data.mults` (v2) or `data.<stat>_mult` (v1)
- `bnMult` = BitNode multiplier from `src/util/bitnode-mults.ts` (source: `BitNode.tsx::getBitNodeMultipliers`)
- BN12 is dynamic: `bnMult = 1 / 1.02^(sf12Level + 1)` — `sf12Level` from `data.sourceFiles`
- Intelligence always has `bnMult = 1` (no BitNode skill multiplier)
- **Not** accounted for: augmentations (they modify `mults` at runtime, but are already reflected in the save)
