import React, { Component } from "react";

import { Bitburner } from "bitburner.types";
import PlayerSection from "./player-section";
import FactionSection from "./factions-section";
import ServersSection from "./servers-section";
import CompaniesSection from "./companies-section";
import StockMarketSection from "./stockmarket-section";
import SettingsSection from "./settings-section";

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
      case Bitburner.SaveDataKey.VersionSave:
        return <div className="text-gray-300">Game version: {String((this as any)._versionValue ?? "")}<VersionValue /></div>;
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
  return <span>{String((ctx.save?.data as any)?.[Bitburner.SaveDataKey.VersionSave] ?? "")}</span>;
});

const RawJsonView = observer(function RawJsonView({ tab }: { tab: Bitburner.SaveDataKey }) {
  const ctx = useContext(FileContext);
  const raw = (ctx.save?.data as any)?.[tab];
  if (raw === null || raw === undefined) {
    return <span className="text-gray-500">No data for this section.</span>;
  }
  return (
    <pre className="text-xs text-gray-400 overflow-auto max-h-[60vh] bg-gray-900 rounded p-4">
      {JSON.stringify(raw, null, 2)}
    </pre>
  );
});
