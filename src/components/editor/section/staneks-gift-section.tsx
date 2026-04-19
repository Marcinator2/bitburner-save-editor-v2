import { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";

export default observer(function StaneksGiftSection() {
  const ctx = useContext(FileContext);
  const raw = (ctx.save?.data as any)?.StaneksGiftSave;
  if (!raw) return <span className="text-gray-500">No Stanek's Gift data.</span>;

  const gift = raw.data as { fragments: unknown[]; storedCycles: number; isBonusCharging: boolean };

  const setStoredCycles = useCallback(
    (val: string) => {
      const n = Number(val);
      if (!isNaN(n) && n >= 0) raw.data.storedCycles = n;
    },
    [raw]
  );

  const toggleBonusCharging = useCallback(() => {
    raw.data.isBonusCharging = !raw.data.isBonusCharging;
  }, [raw]);

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="rounded border border-gray-700 shadow shadow-green-700 p-4 flex flex-col gap-3">
        <span className="text-lg font-bold text-gray-100">Charge Storage</span>
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-sm">Stored Cycles (1 cycle ≈ 200 ms offline time)</span>
          <input
            className="bg-transparent w-48 rounded border border-gray-600 px-2 py-1 outline-none focus:border-green-700"
            type="number"
            min={0}
            value={gift.storedCycles}
            onChange={(e) => setStoredCycles(e.currentTarget.value)}
          />
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="accent-green-600 w-4 h-4"
            checked={gift.isBonusCharging}
            onChange={toggleBonusCharging}
          />
          <span className="text-gray-300">Bonus Charging active</span>
        </label>
      </div>

      <div className="rounded border border-gray-700 p-4">
        <span className="text-sm font-bold text-gray-300">
          Fragments placed: {gift.fragments?.length ?? 0}
        </span>
        {gift.fragments?.length > 0 ? (
          <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-64">
            {JSON.stringify(gift.fragments, null, 2)}
          </pre>
        ) : (
          <p className="mt-1 text-gray-500 text-sm italic">No fragments placed on the board.</p>
        )}
      </div>
    </div>
  );
});
