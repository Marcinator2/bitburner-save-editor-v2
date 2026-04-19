import { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { formatNumber } from "util/format";

export default observer(function CompaniesSection() {
  const { companies } = useContext(FileContext);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return companies.data.filter(([name]) => name.toLowerCase().includes(q));
  }, [companies.data, search]);

  const onChange = useCallback(
    (name: string, field: "favor" | "playerReputation", value: string) => {
      const num = Number(value);
      if (!isNaN(num) && num >= 0) companies.updateCompany(name, { [field]: num });
    },
    [companies]
  );

  return (
    <div className="flex flex-col gap-4">
      <input
        className="bg-gray-800 rounded px-3 py-1 w-64 outline-none focus:ring-1 ring-green-700"
        placeholder="Search companies…"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(([name, company]) => (
          <div
            key={name}
            className="rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-2"
          >
            <span className="text-lg font-bold text-gray-100 truncate" title={name}>
              {name}
            </span>
            <div className="flex gap-4 text-sm">
              <label className="flex flex-col gap-0.5">
                <span className="text-gray-400 text-xs">Reputation</span>
                <input
                  className="bg-transparent w-32 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                  type="number"
                  min={0}
                  value={company.playerReputation}
                  onChange={(e) => onChange(name, "playerReputation", e.currentTarget.value)}
                />
              </label>
              <label className="flex flex-col gap-0.5">
                <span className="text-gray-400 text-xs">Favor</span>
                <input
                  className="bg-transparent w-20 rounded border border-gray-600 px-1 py-0.5 outline-none focus:border-green-700"
                  type="number"
                  min={0}
                  value={company.favor}
                  onChange={(e) => onChange(name, "favor", e.currentTarget.value)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
