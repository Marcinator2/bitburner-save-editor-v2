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

  get factions() {
    return {
      data: Object.entries(this.save.data.FactionsSave)
        .filter(([, f]) => typeof f === "object" && f !== null && "ctor" in f && "data" in f)
        .sort((a, b) => b[1].data.playerReputation - a[1].data.playerReputation),
      updateFaction: this.updateFaction,
    };
  }

  updateFaction = (faction: string, updates: Partial<Bitburner.FactionsSaveObject["data"]>) => {
    Object.assign(this.save.data.FactionsSave[faction].data, updates);

    if (updates.isMember) {
      this.updatePlayer({ factions: Array.from(new Set(this.player.data.factions.concat(faction))) });
    } else {
      this.updatePlayer({ factions: this.player.data.factions.filter((f) => f !== faction) });
    }
    if (updates.alreadyInvited && !updates.isMember) {
      this.updatePlayer({
        factionInvitations: Array.from(new Set(this.player.data.factionInvitations.concat(faction))),
      });
    } else {
      this.updatePlayer({ factionInvitations: this.player.data.factionInvitations.filter((f) => f !== faction) });
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
      data: Object.entries(this.save.data.CompaniesSave as unknown as Record<string, { favor: number; playerReputation: number }>)
        .filter(([, c]) => typeof c === "object" && c !== null && "playerReputation" in c)
        .sort(([a], [b]) => a.localeCompare(b)),
      updateCompany: this.updateCompany,
    };
  }

  updateCompany = (name: string, updates: { favor?: number; playerReputation?: number }) => {
    Object.assign((this.save.data.CompaniesSave as any)[name], updates);
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
