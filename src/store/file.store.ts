import { Buffer } from "buffer";
import { Bitburner } from "bitburner.types";
import { makeAutoObservable } from "mobx";

export class FileStore {
  _file: File;
  save: Bitburner.SaveData;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);

    // @ts-ignore
    window.store = this;
  }

  get file() {
    return this._file;
  }

  get ready() {
    return !!this.save;
  }

  get player() {
    return {
      data: this.save.data.PlayerSave.data,
      updatePlayer: this.updatePlayer,
    };
  }

  updatePlayer = (updates: Partial<Bitburner.PlayerSaveObject["data"]>) => {
    Object.assign(this.save.data.PlayerSave.data, updates);
  };

  get corporation() {
    if (!this.save) return null;
    const corp = (this.save.data.PlayerSave.data as any)?.corporation;
    if (!corp) return null;
    return {
      data: corp.data as Record<string, any>,
      updateCorporation: this.updateCorporation,
      updateCorporationUpgrade: this.updateCorporationUpgrade,
      toggleCorporationUnlock: this.toggleCorporationUnlock,
      updateCorporationDivision: this.updateCorporationDivision,
    };
  }

  updateCorporation = (updates: Record<string, unknown>) => {
    const corp = (this.save.data.PlayerSave.data as any).corporation;
    Object.assign(corp.data, updates);
  };

  updateCorporationUpgrade = (upgradeName: string, level: number) => {
    const corp = (this.save.data.PlayerSave.data as any).corporation;
    corp.data.upgrades[upgradeName].level = level;
  };

  toggleCorporationUnlock = (unlockName: string) => {
    const corp = (this.save.data.PlayerSave.data as any).corporation;
    const unlocks: string[] = corp.data.unlocks.data;
    const idx = unlocks.indexOf(unlockName);
    if (idx >= 0) unlocks.splice(idx, 1);
    else unlocks.push(unlockName);
  };

  updateCorporationDivision = (divisionName: string, updates: Record<string, unknown>) => {
    const corp = (this.save.data.PlayerSave.data as any).corporation;
    const pairs: [string, any][] = corp.data.divisions.data;
    const div = pairs.find(([n]) => n === divisionName);
    if (div) Object.assign(div[1].data, updates);
  };

  get factions() {
    const joinedSet = new Set(this.save.data.PlayerSave.data.factions ?? []);
    const invitedSet = new Set(this.save.data.PlayerSave.data.factionInvitations ?? []);

    // Bitburner only writes factions with non-zero rep/favor/discovery into FactionsSave.
    // We must also include every faction the player has joined or been invited to,
    // even when they have no entry in FactionsSave (rep=0, favor=0).
    const knownNames = new Set([
      ...Object.keys(this.save.data.FactionsSave),
      ...joinedSet,
      ...invitedSet,
    ]);

    const raw = this.save.data.FactionsSave as Record<string, Bitburner.FactionsSaveObject>;

    const data: [string, Bitburner.FactionView][] = Array.from(knownNames)
      .map((name): [string, Bitburner.FactionView] => {
        const f = raw[name] ?? {};
        return [
          name,
          {
            name,
            playerReputation: f.playerReputation ?? 0,
            favor: f.favor ?? 0,
            discovery: f.discovery ?? "unknown",
            isMember: joinedSet.has(name),
            alreadyInvited: invitedSet.has(name) || joinedSet.has(name),
          },
        ];
      })
      .sort((a, b) => b[1].playerReputation - a[1].playerReputation);

    return {
      data,
      updateFaction: this.updateFaction,
    };
  }

  updateFaction = (faction: string, updates: Partial<Bitburner.FactionView>) => {
    const raw = (this.save.data.FactionsSave as Record<string, Bitburner.FactionsSaveObject>);
    if (!raw[faction]) raw[faction] = {};

    if (updates.playerReputation !== undefined) raw[faction].playerReputation = updates.playerReputation;
    if (updates.favor !== undefined) raw[faction].favor = updates.favor;
    if (updates.discovery !== undefined) raw[faction].discovery = updates.discovery;

    if (updates.isMember !== undefined) {
      if (updates.isMember) {
        this.updatePlayer({ factions: Array.from(new Set([...this.player.data.factions, faction])) });
      } else {
        this.updatePlayer({ factions: this.player.data.factions.filter((f) => f !== faction) });
      }
    }
    if (updates.alreadyInvited !== undefined) {
      if (updates.alreadyInvited && !(updates.isMember ?? false)) {
        this.updatePlayer({
          factionInvitations: Array.from(new Set([...this.player.data.factionInvitations, faction])),
        });
      } else {
        this.updatePlayer({ factionInvitations: this.player.data.factionInvitations.filter((f) => f !== faction) });
      }
    }
  };

  get servers() {
    return {
      data: Object.entries(this.save.data.AllServersSave as Record<string, any>)
        .filter(([, s]) => typeof s === "object" && s !== null && "ctor" in s && "data" in s)
        .sort(([a], [b]) => a.localeCompare(b)),
      updateServer: this.updateServer,
    };
  }

  updateServer = (hostname: string, updates: Record<string, unknown>) => {
    Object.assign((this.save.data.AllServersSave as Record<string, any>)[hostname].data, updates);
  };

  get companies() {
    return {
      data: Object.entries(this.save.data.CompaniesSave as Record<string, Bitburner.CompanySaveObject>)
        .filter(([, c]) => typeof c === "object" && c !== null)
        .sort(([a], [b]) => a.localeCompare(b)),
      updateCompany: this.updateCompany,
    };
  }

  updateCompany = (name: string, updates: Bitburner.CompanySaveObject) => {
    const raw = this.save.data.CompaniesSave as Record<string, Bitburner.CompanySaveObject>;
    if (!raw[name]) raw[name] = {};
    Object.assign(raw[name], updates);
  };

  get stocks() {
    return {
      data: Object.entries(this.save.data.StockMarketSave as Record<string, any>).sort(
        ([a], [b]) => a.localeCompare(b)
      ),
      updateStock: this.updateStock,
    };
  }

  updateStock = (symbol: string, updates: Record<string, unknown>) => {
    Object.assign((this.save.data.StockMarketSave as Record<string, any>)[symbol].data, updates);
  };

  get settings() {
    return {
      data: this.save.data.SettingsSave as unknown as Record<string, unknown>,
      updateSetting: this.updateSetting,
    };
  }

  updateSetting = (key: string, value: unknown) => {
    (this.save.data.SettingsSave as any)[key] = value;
  };

  // Track which format the original file used so we can round-trip correctly
  _isBase64Format = false;
  _isGzFormat = false;

  clearFile = () => {
    this._file = undefined;
    this.save = undefined;
    this.error = null;
    this._isBase64Format = false;
    this._isGzFormat = false;
  };

  uploadFile = async (file: File) => {
    this.clearFile();
    this._file = file;
    try {
      await this.processFile();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    }
  };

  processFile = async () => {
    // Read as bytes so we can detect gzip magic bytes (1f 8b)
    const buffer = await this.file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let text: string;
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      // Gzip-compressed backup — decompress via native DecompressionStream
      this._isGzFormat = true;
      const stream = new DecompressionStream("gzip");
      const response = new Response(new Blob([bytes]).stream().pipeThrough(stream));
      text = await response.text();
    } else {
      this._isGzFormat = false;
      text = new TextDecoder().decode(bytes);
    }

    // Detect format: new Bitburner (v2+) saves as plain JSON,
    // old Bitburner saves as base64-encoded JSON.
    let rawData: Bitburner.RawSaveData;
    const trimmed = text.trim();
    if (trimmed.startsWith("{")) {
      rawData = JSON.parse(trimmed);
      this._isBase64Format = false;
    } else {
      rawData = JSON.parse(Buffer.from(trimmed, "base64").toString());
      this._isBase64Format = true;
    }

    if (rawData.ctor !== "BitburnerSaveObject") {
      throw new Error("Invalid save file");
    }

    const data: any = {};

    // Parse all keys from the file (not just known ones) to avoid data loss
    for (const key of Object.keys(rawData.data)) {
      const val = rawData.data[key as keyof typeof rawData.data];
      if (!val) {
        data[key] = null;
      } else {
        try {
          data[key] = JSON.parse(val as string);
        } catch {
          data[key] = val; // keep raw if not JSON
        }
      }
    }

    this.setSaveData({
      ctor: Bitburner.Ctor.BitburnerSaveObject,
      data,
    });

    if (!this.save.data.PlayerSave.data.exploits.includes(Bitburner.Exploit.EditSaveFile)) {
      console.info("Applying EditSaveFile exploit!");
      this.save.data.PlayerSave.data.exploits.push(Bitburner.Exploit.EditSaveFile);
    }

    console.info("File processed...");
  };

  downloadFile = async () => {
    const rawData: Partial<Bitburner.RawSaveData> = {
      ctor: Bitburner.Ctor.BitburnerSaveObject,
    };

    const data: any = {};

    // Serialize ALL keys present in the save (preserves unknown/future keys)
    const saveData = this.save.data as Record<string, unknown>;
    Object.keys(saveData).forEach((key) => {
      if (saveData[key] === null || saveData[key] === undefined) {
        data[key] = "";
      } else {
        data[key] = JSON.stringify(saveData[key]);
      }
    });

    rawData.data = data;

    // Round-trip in the same format as the original file.
    // v2 (plain JSON): Bitburner expects plain JSON back.
    // v1 (base64): Bitburner expects base64-encoded JSON.
    let outputData: string;
    if (this._isBase64Format) {
      outputData = Buffer.from(JSON.stringify(rawData)).toString("base64");
    } else {
      outputData = JSON.stringify(rawData);
    }

    // Build the download blob — recompress as gzip if the original was a .gz backup
    let blob: Blob;
    if (this._isGzFormat) {
      const stream = new CompressionStream("gzip");
      const response = new Response(new Blob([outputData]).stream().pipeThrough(stream));
      blob = await response.blob();
    } else {
      blob = new Blob([outputData], { type: "application/json" });
    }

    const blobUrl = window.URL.createObjectURL(blob);

    // Trick to start a download
    const downloadLink = document.createElement("a");
    downloadLink.style.display = "none";
    downloadLink.href = blobUrl;
    // Regex tolerates any prefix before "itburnerSave_" and optional .gz suffix
    const match = this.file.name.match(/itburnerSave_(?<ts>\d+)_(?<bn>BN.+?)(?:-H4CKeD)*?(?:\.json|\.json\.gz|\.gz)/);
    const bn = match?.groups?.bn ?? "BN1x0";
    const ext = this._isGzFormat ? ".json.gz" : ".json";

    downloadLink.download = `bitburnerSave_${
      Math.floor(Date.now() / 1000) // Seconds, not milliseconds
    }_${bn}-H4CKeD${ext}`;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    downloadLink.remove();

    window.URL.revokeObjectURL(blobUrl);
  };

  setSaveData = (save: typeof this.save) => {
    this.save = save;
  };
}

export default new FileStore();
