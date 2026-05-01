# Bitburner Save Editor v2 — Project Guidelines

## Projekt-Übersicht

Web-App zum Bearbeiten von Bitburner-Spielständen (`.json`, `.json.gz`, `.gz`).
Zielversion: **Bitburner 2.8.1**. Live unter [marcinator2.github.io/bitburner-save-editor-v2](https://marcinator2.github.io/bitburner-save-editor-v2/).

## Tech Stack

- **Vite** + **React 19** + **TypeScript 5**
- **MobX** (`makeAutoObservable`) für State Management — kein Redux, kein Context-API
- **Tailwind CSS** für Styling — keine separaten CSS-Dateien außer `index.css`
- **Ramda** für funktionale Hilfsfunktionen

## Architektur

```
src/
  store/file.store.ts        # Zentraler MobX-Store (FileStore) – einzige Quelle der Wahrheit
  components/
    editor/
      section/               # Je ein Tab = eine *-section.tsx Datei
      inputs/                # Wiederverwendbare Input-Komponenten
    file-loader.tsx          # Datei-Upload / Drag & Drop
  bitburner.types.ts         # Bitburner-Typen (SaveData, PlayerSaveObject, …)
  util/                      # Hilfsfunktionen (Kompression, Konvertierung etc.)
```

- Neue Editor-Tabs → neue `*-section.tsx` in `src/components/editor/section/` + Eintrag in `section/index.tsx`
- Zugriff auf Save-Daten ausschließlich über `FileStore`-Methoden, nie direkt mutieren außer über `Object.assign` wie in `updatePlayer`

## Typen

- Bitburner-Typen leben in `src/bitburner.types.ts` (Namespace `Bitburner`)
- Typen aus `bitburner-src-stable/` sind Referenz, nicht direkt importieren
- Bei fehlenden Typen: `as any` mit TODO-Kommentar, kein Typ-Casting ohne Grund

## Sprache / Language

- Everything in **English**: variable names, comments, commit messages, UI labels, and Markdown files (`.md`)

## Code-Stil

- Funktionale Komponenten mit TypeScript, keine Klassen-Komponenten
- Props-Interfaces direkt über der Komponente definieren (kein separates `types.ts` pro Komponente)
- Tailwind-Klassen inline, kein `cn()`/`clsx()` außer bei bedingten Klassen
- Neon-Grün-Farbschema: primär `text-green-400`, `border-green-800`, `bg-black`

## Build & Dev

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # tsc --noEmit + vite build
./start.sh       # Kurzform für dev
```

## Konventionen

- Dateiformat-Erkennung und Roundtrip (gzip ↔ JSON ↔ base64) läuft im `FileStore`
- Der `EditSaveFile`-Exploit wird automatisch beim Laden gesetzt
- RAM-Werte bei Servern sind immer Zweierpotenzen (1–1048576 GB)

## Skill-Level-Berechnung

Bitburner berechnet beim Laden ein Skill-Level immer neu aus `exp`:

```
skill = calculateSkill(exp, mults.<stat> × currentNodeMults.<StatLevelMultiplier>)
```

Der Editor muss daher beim Setzen eines Levels das **Gegenstück** rechnen:

```
exp = calculateExp(desiredLevel, mults.<stat> × bnMult)
```

- `mults.<stat>` = Augmentation-Multiplikator aus `data.mults` (v2) bzw. `data.<stat>_mult` (v1)
- `bnMult` = BitNode-Multiplikator aus `src/util/bitnode-mults.ts` (Quelle: `BitNode.tsx::getBitNodeMultipliers`)
- BN12 ist dynamisch: `bnMult = 1 / 1.02^(sf12Level + 1)` — `sf12Level` aus `data.sourceFiles`
- Intelligence hat immer `bnMult = 1` (kein BitNode-Skill-Multiplikator)
- Wird **nicht** berücksichtigt: Augmentations (die verändern `mults` zur Laufzeit, stehen aber schon im Save)
