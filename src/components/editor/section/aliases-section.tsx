import { useCallback, useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { Bitburner } from "bitburner.types";

interface Props {
  saveKey: Bitburner.SaveDataKey.AliasesSave | Bitburner.SaveDataKey.GlobalAliasesSave;
}

export default observer(function AliasesSection({ saveKey }: Props) {
  const ctx = useContext(FileContext);
  const data = (ctx.save?.data as any)?.[saveKey] as Record<string, string> | null;
  const [newAlias, setNewAlias] = useState("");
  const [newValue, setNewValue] = useState("");

  const update = useCallback(
    (alias: string, value: string) => {
      (ctx.save?.data as any)[saveKey][alias] = value;
    },
    [ctx, saveKey]
  );

  const remove = useCallback(
    (alias: string) => {
      delete (ctx.save?.data as any)[saveKey][alias];
    },
    [ctx, saveKey]
  );

  const add = useCallback(() => {
    if (!newAlias.trim()) return;
    (ctx.save?.data as any)[saveKey][newAlias.trim()] = newValue;
    setNewAlias("");
    setNewValue("");
  }, [ctx, saveKey, newAlias, newValue]);

  const entries = Object.entries(data ?? {});

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {entries.length === 0 && (
        <span className="text-gray-500 italic">No aliases defined.</span>
      )}
      {entries.map(([alias, value]) => (
        <div key={alias} className="flex gap-2 items-center">
          <span className="w-48 font-mono text-green-400 truncate">{alias}</span>
          <span className="text-gray-500">=</span>
          <input
            className="flex-1 bg-transparent rounded border border-gray-600 px-2 py-1 font-mono outline-none focus:border-green-700"
            value={value}
            onChange={(e) => update(alias, e.currentTarget.value)}
          />
          <button
            className="px-2 py-1 rounded bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-300 transition-colors"
            onClick={() => remove(alias)}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 items-center mt-2 border-t border-gray-700 pt-4">
        <input
          className="w-48 bg-transparent rounded border border-gray-600 px-2 py-1 font-mono outline-none focus:border-green-700 placeholder-gray-600"
          placeholder="alias name"
          value={newAlias}
          onChange={(e) => setNewAlias(e.currentTarget.value)}
        />
        <span className="text-gray-500">=</span>
        <input
          className="flex-1 bg-transparent rounded border border-gray-600 px-2 py-1 font-mono outline-none focus:border-green-700 placeholder-gray-600"
          placeholder="command"
          value={newValue}
          onChange={(e) => setNewValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          className="px-3 py-1 rounded bg-gray-800 hover:bg-green-900 text-gray-400 hover:text-green-300 transition-colors"
          onClick={add}
        >
          Add
        </button>
      </div>
    </div>
  );
});
