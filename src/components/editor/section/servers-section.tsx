import { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { FileContext } from "App";
import { formatNumber, parseInputNumber } from "util/format";

const RAM_OPTIONS: number[] = [0, ...Array.from({ length: 21 }, (_, i) => 2 ** i)];
// 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, …, 1048576

export default observer(function ServersSection() {
  const { servers } = useContext(FileContext);
  const [search, setSearch] = useState("");
  const [batchRam, setBatchRam] = useState<string>("__none__");
  const [batchCores, setBatchCores] = useState<string>("__none__");

  const purchasedHostnames = useMemo(
    () => servers.data.filter(([, s]) => (s.data as any).purchasedByPlayer).map(([h]) => h),
    [servers.data]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return servers.data.filter(([hostname]) => hostname.toLowerCase().includes(q));
  }, [servers.data, search]);

  const onChangeRam = useCallback(
    (hostname: string, value: string) => {
      if (value === "__custom__") return;
      const gb = Number(value);
      if (!isNaN(gb) && gb >= 0) servers.updateServer(hostname, { maxRam: gb });
    },
    [servers]
  );

  const onChangeCores = useCallback(
    (hostname: string, value: string) => {
      const cores = Math.max(1, Math.min(8, parseInputNumber(value)));
      if (!isNaN(cores)) servers.updateServer(hostname, { cpuCores: cores });
    },
    [servers]
  );

  const applyBatch = useCallback(() => {
    for (const hostname of purchasedHostnames) {
      if (batchRam !== "__none__") {
        const gb = Number(batchRam);
        if (!isNaN(gb) && gb >= 0) servers.updateServer(hostname, { maxRam: gb });
      }
      if (batchCores !== "__none__") {
        const cores = Math.max(1, Math.min(8, Number(batchCores)));
        if (!isNaN(cores)) servers.updateServer(hostname, { cpuCores: cores });
      }
    }
  }, [purchasedHostnames, batchRam, batchCores, servers]);

  const onToggleBackdoor = useCallback(
    (hostname: string, current: boolean) => {
      servers.updateServer(hostname, { backdoorInstalled: !current });
    },
    [servers]
  );

  const onToggleAdmin = useCallback(
    (hostname: string, current: boolean) => {
      servers.updateServer(hostname, { hasAdminRights: !current });
    },
    [servers]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Batch editor for owned servers */}
      {purchasedHostnames.length > 0 && (
        <div className="bg-gray-900 border border-blue-800 rounded p-3 flex flex-col gap-3">
          <span className="text-sm font-semibold text-blue-300">
            Batch-Edit: owned servers ({purchasedHostnames.length})
          </span>
          <div className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-0.5 text-sm">
              <span className="text-gray-400 text-xs">RAM (GB)</span>
              <select
                className="bg-gray-800 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-blue-500"
                value={batchRam}
                onChange={(e) => setBatchRam(e.currentTarget.value)}
              >
                <option value="__none__">— no change —</option>
                {RAM_OPTIONS.map((gb) => (
                  <option key={gb} value={gb}>{gb} GB</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-0.5 text-sm">
              <span className="text-gray-400 text-xs">Cores</span>
              <select
                className="bg-gray-800 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-blue-500"
                value={batchCores}
                onChange={(e) => setBatchCores(e.currentTarget.value)}
              >
                <option value="__none__">— no change —</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <button
              className="px-3 py-1 rounded bg-blue-900 hover:bg-blue-700 text-blue-200 hover:text-white transition-colors text-sm"
              onClick={applyBatch}
            >
              Apply to all owned servers
            </button>
          </div>
        </div>
      )}
      <input
        className="bg-gray-800 rounded px-3 py-1 w-64 outline-none focus:ring-1 ring-green-700"
        placeholder="Search servers…"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(([hostname, server]) => {
          const d = server.data as any;
          const isPurchased: boolean = d.purchasedByPlayer ?? false;
          const hasAdmin: boolean = d.hasAdminRights ?? false;
          const backdoor: boolean = d.backdoorInstalled ?? false;
          const maxRam: number = d.maxRam ?? 0;
          const cores: number = d.cpuCores ?? 1;

          return (
            <div
              key={hostname}
              className="bg-gray-900 rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-2"
            >
              <span className="text-lg font-bold text-gray-100 truncate" title={hostname}>
                {hostname}
              </span>

              <div className="flex gap-2 text-xs">
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded",
                    hasAdmin ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"
                  )}
                  title="Toggle admin rights"
                  style={{ cursor: "pointer" }}
                  onClick={() => onToggleAdmin(hostname, hasAdmin)}
                >
                  {hasAdmin ? "Root" : "No Root"}
                </span>
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded",
                    backdoor ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"
                  )}
                  title="Toggle backdoor"
                  style={{ cursor: "pointer" }}
                  onClick={() => onToggleBackdoor(hostname, backdoor)}
                >
                  {backdoor ? "Backdoor" : "No Backdoor"}
                </span>
                {isPurchased && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">Owned</span>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">RAM (GB)</span>
                  <select
                    className="bg-gray-900 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    value={RAM_OPTIONS.includes(maxRam) ? maxRam : "__custom__"}
                    onChange={(e) => onChangeRam(hostname, e.currentTarget.value)}
                  >
                    {!RAM_OPTIONS.includes(maxRam) && (
                      <option value="__custom__">{maxRam} GB (custom)</option>
                    )}
                    {RAM_OPTIONS.map((gb) => (
                      <option key={gb} value={gb}>{gb} GB</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-gray-400 text-xs">Cores</span>
                  <input
                    className="bg-transparent w-16 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={1}
                    max={8}
                    value={cores}
                    onChange={(e) => onChangeCores(hostname, e.currentTarget.value)}
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
