import { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { formatMoney, formatNumber } from "util/format";

export default observer(function StockMarketSection() {
  const { stocks } = useContext(FileContext);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    // Only include entries that are actual Stock objects (have ctor + data),
    // not metadata keys like Orders, storedCycles, lastUpdate, ticksUntilCycle
    return stocks.data.filter(([sym, stock]) =>
      typeof stock === "object" && stock !== null && "ctor" in stock && "data" in stock
      && sym.toLowerCase().includes(q)
    );
  }, [stocks.data, search]);

  const onChange = useCallback(
    (symbol: string, field: string, value: string) => {
      const num = Number(value);
      if (!isNaN(num) && num >= 0) stocks.updateStock(symbol, { [field]: num } as any);
    },
    [stocks]
  );

  return (
    <div className="flex flex-col gap-4">
      <input
        className="bg-gray-800 rounded px-3 py-1 w-64 outline-none focus:ring-1 ring-green-700"
        placeholder="Search stocks…"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(([symbol, stock]) => {
          const d = stock.data as any;
          const name: string = d.name ?? symbol;
          const price: number = d.price ?? 0;
          const playerShares: number = d.playerShares ?? 0;
          const playerAvgPx: number = d.playerAvgPx ?? 0;
          const playerShortShares: number = d.playerShortShares ?? 0;
          const playerAvgShortPx: number = d.playerAvgShortPx ?? 0;

          return (
            <div
              key={symbol}
              className="rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-lg font-bold text-gray-100">{name}</span>
                <span className="text-xs text-gray-400">{symbol}</span>
              </div>
              <span className="text-sm text-green-400">{formatMoney(price)}</span>

              <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">Shares (Long)</span>
                  <input
                    className="bg-transparent w-full rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={0}
                    value={playerShares}
                    onChange={(e) => onChange(symbol, "playerShares", e.currentTarget.value)}
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">Avg Buy Price</span>
                  <input
                    className="bg-transparent w-full rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={0}
                    value={playerAvgPx}
                    onChange={(e) => onChange(symbol, "playerAvgPx", e.currentTarget.value)}
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">Shares (Short)</span>
                  <input
                    className="bg-transparent w-full rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={0}
                    value={playerShortShares}
                    onChange={(e) => onChange(symbol, "playerShortShares", e.currentTarget.value)}
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">Avg Short Price</span>
                  <input
                    className="bg-transparent w-full rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={0}
                    value={playerAvgShortPx}
                    onChange={(e) => onChange(symbol, "playerAvgShortPx", e.currentTarget.value)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
