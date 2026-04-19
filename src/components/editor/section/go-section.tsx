import { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { formatNumber } from "util/format";

interface GoStats {
  favor: number;
  wins: number;
  losses: number;
  nodes: number;
  nodePower: number;
  winStreak: number;
  highestWinStreak: number;
}

export default observer(function GoSection() {
  const ctx = useContext(FileContext);
  const raw = (ctx.save?.data as any)?.GoSave;
  if (!raw) return <span className="text-gray-500">No IPvGO data.</span>;

  const stats: Record<string, GoStats> = raw.storedCycles !== undefined
    ? raw.stats ?? {}  // new format: raw IS the GoSave object
    : raw.stats ?? {};

  const storedCycles: number = raw.storedCycles ?? 0;

  const setStoredCycles = useCallback(
    (val: string) => {
      const n = Number(val);
      if (!isNaN(n) && n >= 0) raw.storedCycles = n;
    },
    [raw]
  );

  const updateStat = useCallback(
    (opponent: string, field: keyof GoStats, val: string) => {
      const n = Number(val);
      if (!isNaN(n)) (raw.stats[opponent] as any)[field] = n;
    },
    [raw]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-gray-700 shadow shadow-green-700 p-4 max-w-sm">
        <span className="text-lg font-bold text-gray-100 block mb-2">IPvGO</span>
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-sm">Stored Cycles (offline bonus)</span>
          <input
            className="bg-transparent w-40 rounded border border-gray-600 px-2 py-1 outline-none focus:border-green-700"
            type="number"
            min={0}
            value={storedCycles}
            onChange={(e) => setStoredCycles(e.currentTarget.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([opponent, s]) => (
          <div
            key={opponent}
            className="rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-2"
          >
            <span className="text-base font-bold text-gray-100">{opponent}</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {(["wins", "losses", "winStreak", "highestWinStreak", "nodes", "nodePower", "favor"] as (keyof GoStats)[]).map((field) => (
                <label key={field} className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs capitalize">{field.replace(/([A-Z])/g, " $1")}</span>
                  <input
                    className="bg-transparent rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    value={s[field]}
                    onChange={(e) => updateStat(opponent, field, e.currentTarget.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
