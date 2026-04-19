import { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { FileContext } from "App";
import { formatNumber } from "util/format";

export default observer(function ServersSection() {
  const { servers } = useContext(FileContext);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return servers.data.filter(([hostname]) => hostname.toLowerCase().includes(q));
  }, [servers.data, search]);

  const onChangeRam = useCallback(
    (hostname: string, value: string) => {
      const gb = Number(value);
      if (!isNaN(gb) && gb >= 0) servers.updateServer(hostname, { maxRam: gb });
    },
    [servers]
  );

  const onChangeCores = useCallback(
    (hostname: string, value: string) => {
      const cores = Math.max(1, Math.min(8, Number(value)));
      if (!isNaN(cores)) servers.updateServer(hostname, { cpuCores: cores });
    },
    [servers]
  );

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
              className="rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-2"
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
                  <input
                    className="bg-transparent w-24 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                    type="number"
                    min={0}
                    value={maxRam}
                    onChange={(e) => onChangeRam(hostname, e.currentTarget.value)}
                  />
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
