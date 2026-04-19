# Bitburner Save Editor v2

A save editor for [Bitburner](https://github.com/bitburner-official/bitburner-src), forked and modernized from the original archived project (https://github.com/Redmega/bitburner-save-editor).

## Usage

Open the editor, upload your exported Bitburner save file (`.json`, `.json.gz` or `.gz` backups are all supported), edit what you need, then click the download icon in the header to get the modified save — exported in the same format as the original.

### Drag & Drop

You can drag your save file directly onto the upload area.

## Features

### Supported tabs

| Tab | What you can edit |
|---|---|
| **Player** | Money, all stats (hacking, strength, defense, dexterity, agility, charisma, intelligence), Karma, Entropy |
| **Factions** | Reputation, favor, membership, invite status, banned status — with search and sort |
| **Servers** | Admin rights, backdoor, RAM, CPU cores — with search |
| **Companies** | Reputation, favor — with search |
| **Stock Market** | Shares (long/short), average buy/short price |
| **Settings** | All game settings (booleans as dropdowns, numbers/strings as inputs) |
| **Aliases** | View, edit, delete and add terminal aliases |
| **Global Aliases** | Same as Aliases for global scope |
| **Stanek's Gift** | Stored cycles, bonus charging toggle, fragment list |
| **IPvGO** | Stored cycles, per-opponent stats (wins, losses, streaks, nodes, node power, favor) |
| **Last Export Bonus** | View and edit the timestamp, set to now |
| **Version** | Display only |
| **Gangs** | Raw JSON view |

### File formats

- **Bitburner v2** (plain JSON) — default modern format
- **Bitburner v1** (base64-encoded JSON) — legacy format
- **Gzip backups** (`.gz` / `.json.gz`) — auto-detected, round-tripped as gzip

### Automatic exploit

The `EditSaveFile` exploit is automatically applied when loading a save that doesn't have it yet.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- [MobX](https://mobx.js.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
