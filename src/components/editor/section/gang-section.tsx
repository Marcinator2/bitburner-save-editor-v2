import { useContext } from "react";
import { observer } from "mobx-react-lite";

import { FileContext } from "App";
import { Bitburner } from "bitburner.types";
import { formatNumber } from "util/format";

export default observer(function GangSection() {
  const ctx = useContext(FileContext);

  const allGangs = ctx.save?.data?.[Bitburner.SaveDataKey.AllGangsSave];
  const playerGang = ctx.save?.data?.PlayerSave?.data?.gang as Bitburner.GangSaveObject | null;

  if (!allGangs && !playerGang) {
    return <span className="text-gray-500">No gang data in this save file.</span>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Player's own gang */}
      {playerGang?.data && (
        <div>
          <h2 className="text-lg font-bold text-gray-100 mb-3">
            Your Gang — {playerGang.data.facName}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({playerGang.data.isHackingGang ? "Hacking" : "Combat"})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard label="Respect" value={formatNumber(Math.floor(playerGang.data.respect))} />
            <StatCard label="Wanted Level" value={formatNumber(Math.floor(playerGang.data.wanted))} />
            <StatCard label="Members" value={String(playerGang.data.members?.length ?? 0)} />
            <StatCard
              label="Territory"
              value={
                allGangs?.[playerGang.data.facName]
                  ? `${(allGangs[playerGang.data.facName].territory * 100).toFixed(2)}%`
                  : "—"
              }
            />
          </div>

          {/* Members table */}
          {playerGang.data.members && playerGang.data.members.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-1 pr-4">Name</th>
                    <th className="py-1 pr-3">Task</th>
                    <th className="py-1 pr-3 text-right">Respect</th>
                    {playerGang.data.isHackingGang ? (
                      <>
                        <th className="py-1 pr-3 text-right">Hack</th>
                        <th className="py-1 pr-3 text-right">Cha</th>
                      </>
                    ) : (
                      <>
                        <th className="py-1 pr-3 text-right">Str</th>
                        <th className="py-1 pr-3 text-right">Def</th>
                        <th className="py-1 pr-3 text-right">Dex</th>
                        <th className="py-1 pr-3 text-right">Agi</th>
                      </>
                    )}
                    <th className="py-1 pr-3 text-right">Upgrades</th>
                    <th className="py-1 text-right">Augments</th>
                  </tr>
                </thead>
                <tbody>
                  {playerGang.data.members.map((m) => (
                    <tr key={m.data.name} className="border-b border-gray-800 hover:bg-gray-800/40">
                      <td className="py-1 pr-4 text-gray-200 font-medium">{m.data.name}</td>
                      <td className="py-1 pr-3 text-gray-400 text-xs">{m.data.task}</td>
                      <td className="py-1 pr-3 text-right text-gray-300">
                        {formatNumber(Math.floor(m.data.earnedRespect))}
                      </td>
                      {playerGang.data.isHackingGang ? (
                        <>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.hack)}</td>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.cha)}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.str)}</td>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.def)}</td>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.dex)}</td>
                          <td className="py-1 pr-3 text-right text-gray-300">{formatNumber(m.data.agi)}</td>
                        </>
                      )}
                      <td className="py-1 pr-3 text-right text-gray-300">{m.data.upgrades.length}</td>
                      <td className="py-1 text-right text-gray-300">{m.data.augmentations.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All gangs territory / power */}
      {allGangs && Object.keys(allGangs).length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-100 mb-3">All Gangs — Territory &amp; Power</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-1 pr-6">Gang</th>
                  <th className="py-1 pr-6 text-right">Territory</th>
                  <th className="py-1 text-right">Power</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(allGangs)
                  .sort(([, a], [, b]) => b.territory - a.territory)
                  .map(([name, info]) => {
                    const isPlayer = playerGang?.data?.facName === name;
                    return (
                      <tr
                        key={name}
                        className={`border-b border-gray-800 ${isPlayer ? "text-green-400" : "text-gray-300"} hover:bg-gray-800/40`}
                      >
                        <td className="py-1 pr-6 font-medium">
                          {name}
                          {isPlayer && <span className="ml-2 text-xs text-green-600">(yours)</span>}
                        </td>
                        <td className="py-1 pr-6 text-right">{(info.territory * 100).toFixed(2)}%</td>
                        <td className="py-1 text-right">{formatNumber(Math.round(info.power))}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded border border-gray-700 p-3 flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-base font-bold text-gray-100">{value}</span>
    </div>
  );
}
