# Bitburner Save Editor – Modernisierung

## Ausgangszustand (2021–2022)
| Paket | Alt | Neu |
|---|---|---|
| Bundler | Create React App 5.0.0 | **Vite 6** |
| React | 17.0.2 | **React 19** |
| TypeScript | 4.5.4 | **TypeScript 5** |
| TailwindCSS | 3.0.5 | **Tailwind 3 (latest)** |
| MobX | 6.3.9 | **MobX 6 (latest)** |
| mobx-react-lite | 3.2.2 | **mobx-react-lite 4** |
| @heroicons/react | 1.0.5 (v1 API) | **@heroicons/react 2** |
| clsx | 1.1.1 | **clsx 2** |
| ramda | 0.27.1 | **ramda 0.30** |

---

## Was sich geändert hat

### Bundler: CRA → Vite
Create React App ist seit 2023 offiziell **deprecated** und wird nicht mehr weiterentwickelt.
Vite ist der moderne Standard: deutlich schnellerer Dev-Server (ESM-native), kleinere Builds.

**Entfernte CRA-Dateien** (nicht mehr benötigt):
- `src/react-app-env.d.ts` → ersetzt durch Vite-Typen
- `src/reportWebVitals.ts` → CRA-spezifisch, entfernt
- `src/setupTests.ts` → Test-Setup nicht mehr benötigt
- `public/manifest.json` → CRA PWA-Manifest

**Neue Dateien:**
- `vite.config.ts` – Vite-Konfiguration mit React, SVGR, tsconfig-paths
- `index.html` (Root) – Vites Einstiegspunkt (nicht mehr in `public/`)

> **Manueller Schritt:** Die Datei `public/index.html` kann gelöscht werden.
> Vite verwendet das `index.html` im Projektstamm.

### React 17 → React 19
- `ReactDOM.render()` (deprecated seit React 18) → `createRoot()`
- React 19 bringt verbesserte Server Components, Actions, bessere Hooks-Fehler

### TypeScript 4 → TypeScript 5
- Deutlich schnellere Builds (Project References, verbesserte Incremental Builds)
- Bessere Type-Inference
- `moduleResolution: "bundler"` – korrekte Einstellung für Vite

### SVG-Imports
CRA-spezifisches `{ ReactComponent as X }` funktioniert in Vite nicht direkt.
Mit `vite-plugin-svgr` wird der Import zu:

```ts
// Vorher (CRA)
import { ReactComponent as DownloadIcon } from "icons/download.svg";

// Nachher (Vite + vite-plugin-svgr)
import DownloadIcon from "icons/download.svg?react";
```

### @heroicons/react v1 → v2
Die v1-API (`@heroicons/react/solid`) ist in v2 nicht mehr verfügbar.

```ts
// Vorher (v1)
import { SortAscendingIcon, SortDescendingIcon } from "@heroicons/react/solid";

// Nachher (v2)
import { BarsArrowUpIcon, BarsArrowDownIcon } from "@heroicons/react/24/solid";
```

---

## Neue Projekt-Skripte

```bash
npm run dev       # Dev-Server starten (http://localhost:5173)
npm run build     # Produktions-Build
npm run preview   # Build lokal vorschauen
```

## GitHub Pages Deployment
Für Deployment auf GitHub Pages: `base` in `vite.config.ts` anpassen:
```ts
base: "/bitburner-save-editor/",
```

## Offene Punkte / Zukunft
- [ ] `public/index.html` löschen (durch Root `index.html` ersetzt)
- [ ] Tailwind CSS v4 Migration (Konfiguration zieht in CSS, kein `tailwind.config.js` mehr)
- [ ] `EditorSection` Class Component → funktionale Komponente refactoren
- [ ] Tests mit Vitest einrichten (ersetzt Jest/CRA-Tests)
- [ ] CI/CD Pipeline (z.B. GitHub Actions für `npm run build`)
