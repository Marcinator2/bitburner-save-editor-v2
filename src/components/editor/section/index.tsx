import React, { Component } from "react";

import { Bitburner } from "bitburner.types";
import PlayerSection from "./player-section";
import FactionSection from "./factions-section";
import ServersSection from "./servers-section";
import CompaniesSection from "./companies-section";
import StockMarketSection from "./stockmarket-section";
import SettingsSection from "./settings-section";
import AliasesSection from "./aliases-section";
import StaneksGiftSection from "./staneks-gift-section";
import GoSection from "./go-section";

interface Props {
  tab: Bitburner.SaveDataKey;
  isFiltering?: boolean;
}

export default class EditorSection extends Component<Props> {
  get component() {
    const { tab, ...restProps } = this.props;
    switch (tab) {
      case Bitburner.SaveDataKey.PlayerSave:
        return <PlayerSection {...restProps} />;
      case Bitburner.SaveDataKey.FactionsSave:
        return <FactionSection {...restProps} />;
      case Bitburner.SaveDataKey.AllServersSave:
        return <ServersSection />;
      case Bitburner.SaveDataKey.CompaniesSave:
        return <CompaniesSection />;
      case Bitburner.SaveDataKey.StockMarketSave:
        return <StockMarketSection />;
      case Bitburner.SaveDataKey.SettingsSave:
        return <SettingsSection />;
      case Bitburner.SaveDataKey.AliasesSave:
        return <AliasesSection saveKey={Bitburner.SaveDataKey.AliasesSave} />;
      case Bitburner.SaveDataKey.GlobalAliasesSave:
        return <AliasesSection saveKey={Bitburner.SaveDataKey.GlobalAliasesSave} />;
      case Bitburner.SaveDataKey.StaneksGiftSave:
        return <StaneksGiftSection />;
      case Bitburner.SaveDataKey.GoSave:
        return <GoSection />;
      case Bitburner.SaveDataKey.LastExportBonus:
        return <LastExportBonusView />;
      case Bitburner.SaveDataKey.VersionSave:
        return <VersionValue />;
      case Bitburner.SaveDataKey.AllGangsSave:
        return <RawJsonView tab={tab} />;
      default:
        return <RawJsonView tab={tab} />;
    }
  }

  render() {
    return this.component;
  }
}

import { useContext } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";

const VersionValue = observer(function VersionValue() {
  const ctx = useContext(FileContext);
  const val = (ctx.save?.data as any)?.[Bitburner.SaveDataKey.VersionSave];
  return <span className="text-gray-300">Game version: {String(val ?? "")}</span>;
});

const LastExportBonusView = observer(function LastExportBonusView() {
  const ctx = useContext(FileContext);
  const raw = (ctx.save?.data as any)?.[Bitburner.SaveDataKey.LastExportBonus];

  const setTs = (val: string) => {
    const n = Number(val);
    if (!isNaN(n)) (ctx.save?.data as any)[Bitburner.SaveDataKey.LastExportBonus] = n;
  };

  const formatted = raw ? new Date(raw).toLocaleString() : "—";

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div className="bg-gray-900 rounded border border-gray-700 shadow shadow-green-700 p-4 flex flex-col gap-2">
        <span className="text-lg font-bold text-gray-100">Last Export Bonus</span>
        <span className="text-gray-400 text-sm">{formatted}</span>
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Timestamp (ms)</span>
          <input
            className="bg-transparent rounded border border-gray-600 px-2 py-1 outline-none focus:border-green-700"
            type="number"
            value={raw ?? 0}
            onChange={(e) => setTs(e.currentTarget.value)}
          />
        </label>
        <button
          className="mt-1 px-3 py-1 rounded bg-gray-800 hover:bg-green-900 text-gray-300 hover:text-green-300 transition-colors text-sm w-fit"
          onClick={() => setTs(String(Date.now()))}
        >
          Set to now
        </button>
      </div>
    </div>
  );
});

const RawJsonView = observer(function RawJsonView({ tab }: { tab: Bitburner.SaveDataKey }) {
  const ctx = useContext(FileContext);
  const raw = (ctx.save?.data as any)?.[tab];
  if (raw === null || raw === undefined || (typeof raw === "object" && Object.keys(raw).length === 0)) {
    return <span className="text-gray-500">No data for this section (may not apply to this save).</span>;
  }
  return (
    <pre className="text-xs text-gray-400 overflow-auto max-h-[60vh] bg-gray-900 rounded p-4">
      {JSON.stringify(raw, null, 2)}
    </pre>
  );
});
