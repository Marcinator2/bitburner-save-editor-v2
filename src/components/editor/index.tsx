import { MouseEventHandler, useCallback, useContext, useState } from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";

import { Bitburner } from "bitburner.types";
import { FileContext } from "App";
import EditorSection, { CORP_TAB_KEY } from "components/editor/section";

import IconFilter from "icons/filter.svg?react";

const TAB_LABELS: Record<string, string> = {
  [CORP_TAB_KEY]:                            "Corporation",
  [Bitburner.SaveDataKey.PlayerSave]:        "Player",
  [Bitburner.SaveDataKey.FactionsSave]:      "Factions",
  [Bitburner.SaveDataKey.AllServersSave]:    "All Servers",
  [Bitburner.SaveDataKey.CompaniesSave]:     "Companies",
  [Bitburner.SaveDataKey.AliasesSave]:       "Aliases",
  [Bitburner.SaveDataKey.GlobalAliasesSave]: "Global Aliases",
  [Bitburner.SaveDataKey.StockMarketSave]:   "Stock Market",
  [Bitburner.SaveDataKey.SettingsSave]:      "Settings",
  [Bitburner.SaveDataKey.VersionSave]:       "Version",
  [Bitburner.SaveDataKey.AllGangsSave]:      "All Gangs",
  [Bitburner.SaveDataKey.LastExportBonus]:   "Last Export Bonus",
  [Bitburner.SaveDataKey.StaneksGiftSave]:   "Stanek's Gift",
  [Bitburner.SaveDataKey.GoSave]:            "IPvGO",
};

export default observer(function EditorContainer() {
  const fileContext = useContext(FileContext);

  const [isFiltering, setIsFiltering] = useState(false);
  const toggleFiltering = useCallback(() => {
    setIsFiltering((f) => !f);
  }, []);

  const [activeTab, setActiveTab] = useState<Bitburner.SaveDataKey | typeof CORP_TAB_KEY>(Bitburner.SaveDataKey.PlayerSave);
  const onClickTab = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {
    setActiveTab(event.currentTarget.value as Bitburner.SaveDataKey | typeof CORP_TAB_KEY);
    setIsFiltering(false);
  }, []);

  return (
    <div className="h-full w-full mt-4 flex flex-col">
      <nav className="w-full flex flex-wrap gap-1 border-b border-green-900 pb-1 items-center">
          {[...Object.values(Bitburner.SaveDataKey), ...(fileContext.corporation ? [CORP_TAB_KEY] : [])].map((key) => {
            const hasData = fileContext.ready
              ? key === CORP_TAB_KEY
                ? !!fileContext.corporation
                : (() => {
                  const val = (fileContext.save?.data as any)?.[key];
                  if (val === null || val === undefined) return false;
                  if (typeof val === "object" && Object.keys(val).length === 0) return false;
                  return true;
                })()
              : true;

            return (
              <div
                className={clsx(
                  "flex items-center",
                  "border-b-2 border-transparent transition-colors duration-200 ease-in",
                  activeTab === key && "border-green-400 text-green-300",
                  !hasData && "opacity-30"
                )}
                key={key}
              >
                <button
                  property={key}
                  className="px-3 py-1.5 text-sm font-semibold whitespace-nowrap"
                  value={key}
                  onClick={onClickTab}
                  disabled={!hasData}
                  title={!hasData ? "No data in this save file" : undefined}
                >
                  {TAB_LABELS[key] ?? key}
                </button>
                {activeTab === key && hasData && (
                  <button className={clsx(isFiltering && "text-green-700")} onClick={toggleFiltering}>
                    <IconFilter />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

      <div className="w-full h-full flex-1 mt-4 p-4 rounded border border-green-900 shadow-neon" style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
        {fileContext.error && (
          <span className="text-red-400">Error: {fileContext.error}</span>
        )}
        {!fileContext.ready && !fileContext.error && <span>Upload a file to begin...</span>}
        {fileContext.ready && <EditorSection tab={activeTab} isFiltering={isFiltering} />}
      </div>
    </div>
  );
});
