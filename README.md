# Bitburner Save Editor v2

Try it online: [marcinator2.github.io/bitburner-save-editor-v2](https://marcinator2.github.io/bitburner-save-editor-v2/)

The updated save editor for [Bitburner](https://github.com/bitburner-official/bitburner-src), based on the original archived project by [Redmega](https://github.com/Redmega/bitburner-save-editor).

Created for Bitburner version 2.8.1.

## Usage

Open the editor, upload your exported Bitburner save file (`.json`, `.json.gz` or `.gz` backups are all supported), edit what you need, then click the download icon in the header to get the modified save — exported in the same format as the original.

### Drag & Drop

You can drag your save file directly onto the upload area.

## Features

### Supported tabs

| Tab | What you can edit |
|---|---|
| **Player** | Money, all stats (hacking, strength, defense, dexterity, agility, charisma, intelligence), Karma, Entropy, Augmentations |
| **Factions** | Reputation, favor, membership, invite status, banned status — with search and sort |
| **All Servers** | Admin rights, backdoor, RAM (power-of-2 dropdown), CPU cores — with search; batch-edit all owned servers at once |
| **Companies** | Reputation, favor — with search |
| **Stock Market** | Shares (long/short), average buy/short price |
| **Settings** | All game settings (booleans as dropdowns, numbers/strings as inputs) |
| **Aliases** | View, edit, delete and add terminal aliases |
| **Global Aliases** | Same as Aliases for global scope |
| **Stanek's Gift** | Stored cycles, bonus charging toggle, fragment list |
| **IPvGO** | Stored cycles, per-opponent stats (wins, losses, streaks, nodes, node power, favor) |
| **Last Export Bonus** | View and edit the timestamp, set to now |
| **Version** | Display only |
| **All Gangs** | Raw JSON view |

### Augmentations

The Player tab includes a full augmentation editor:
- Enable/disable individual augmentations via checkboxes
- **Enable all** / **Disable all** buttons
- **NeuroFlux Governor** with stackable level input
- Search and "Show all" toggle (default: only installed augs are shown)
- Queued augmentations (purchased but not yet installed) are highlighted

### All Servers — Batch Edit

Owned (purchased) servers can be edited in bulk:
- Set RAM and/or CPU cores for all owned servers at once
- RAM values are restricted to valid Bitburner power-of-2 options (1–1048576 GB)

### File formats

- **Bitburner v2** (plain JSON) — default modern format
- **Bitburner v1** (base64-encoded JSON) — legacy format
- **Gzip backups** (`.gz` / `.json.gz`) — auto-detected, round-tripped as gzip

### Automatic exploit

The `EditSaveFile` exploit is automatically applied when loading a save that doesn't have it yet.

### UI

- Bitburner-inspired terminal aesthetic with neon green color scheme
- Animated Matrix rain background
- Monospace font throughout

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- [MobX](https://mobx.js.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Development

```bash
npm install
npm run dev
```

Or use the included helper script:

```bash
./start.sh
```

Build:

```bash
npm run build
```
