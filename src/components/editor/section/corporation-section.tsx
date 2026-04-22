import { useCallback, useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { formatMoney } from "util/format";

const ALL_UNLOCKS: string[] = [
  "Export",
  "Smart Supply",
  "Market Research - Demand",
  "Market Data - Competition",
  "VeChain",
  "Shady Accounting",
  "Government Partnership",
  "Warehouse API",
  "Office API",
];

const ALL_UPGRADES: string[] = [
  "Smart Factories",
  "Smart Storage",
  "DreamSense",
  "Wilson Analytics",
  "Nuoptimal Nootropic Injector Implants",
  "Speech Processor Implants",
  "Neural Accelerators",
  "FocusWires",
  "ABC SalesBots",
  "Project Insight",
];

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const n = Number(draft);
    if (!isNaN(n)) onChange(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">{label}</span>
        <input
          autoFocus
          className="w-32 bg-gray-900 border border-green-700 text-green-300 px-2 py-1 text-sm rounded focus:outline-none focus:border-green-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        />
      </div>
    );
  }

  return (
    <button
      className="flex flex-col gap-1 text-left border border-gray-700 rounded px-3 py-2 hover:border-green-700 hover:bg-gray-800 transition-colors"
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      title="Click to edit"
    >
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-green-300 text-sm font-mono">{value}</span>
    </button>
  );
}

export default observer(function CorporationSection() {
  const { corporation } = useContext(FileContext);

  const setFunds = useCallback((v: number) => corporation!.updateCorporation({ funds: v }), [corporation]);
  const setName = useCallback((v: string) => corporation!.updateCorporation({ name: v }), [corporation]);

  if (!corporation) return null;

  const corp = corporation.data;
  const unlockSet = new Set<string>(corp.unlocks?.data ?? []);
  const upgrades: Record<string, { level: number }> = corp.upgrades ?? {};
  const divisions: [string, any][] = corp.divisions?.data ?? [];

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-green-400 text-lg font-bold tracking-wider uppercase border-b border-green-900 pb-1">
        Corporation
      </h2>

      {/* --- General --- */}
      <section className="flex flex-col gap-3">
        <h3 className="text-green-500 text-sm font-semibold uppercase tracking-wider">General</h3>
        <div className="flex flex-wrap gap-3 items-start">
          {/* Name */}
          <NameField label="Name" value={corp.name ?? ""} onChange={setName} />

          {/* Funds */}
          <button
            className="flex flex-col gap-1 text-left border border-gray-700 rounded px-3 py-2 hover:border-green-700 hover:bg-gray-800 transition-colors"
            onClick={() => {
              const v = window.prompt("New funds:", String(corp.funds));
              if (v !== null) { const n = Number(v); if (!isNaN(n)) setFunds(n); }
            }}
            title="Click to edit"
          >
            <span className="text-xs text-gray-400">Funds</span>
            <span className="text-green-300 text-sm font-mono">{formatMoney(corp.funds ?? 0)}</span>
          </button>

          {/* Public toggle */}
          <div className="flex flex-col gap-1 border border-gray-700 rounded px-3 py-2">
            <span className="text-xs text-gray-400">Public</span>
            <select
              className="bg-gray-900 text-green-300 text-sm border-none focus:outline-none"
              value={corp.public ? "true" : "false"}
              onChange={(e) => corporation.updateCorporation({ public: e.target.value === "true" })}
            >
              <option value="false">Private</option>
              <option value="true">Public</option>
            </select>
          </div>
        </div>
      </section>

      {/* --- Upgrades --- */}
      <section className="flex flex-col gap-3">
        <h3 className="text-green-500 text-sm font-semibold uppercase tracking-wider">Upgrades</h3>
        <div className="flex flex-wrap gap-3">
          {ALL_UPGRADES.map((name) => {
            const current = upgrades[name]?.level ?? 0;
            return (
              <NumField
                key={name}
                label={name}
                value={current}
                onChange={(v) => corporation.updateCorporationUpgrade(name, Math.max(0, Math.floor(v)))}
              />
            );
          })}
        </div>
      </section>

      {/* --- Unlocks --- */}
      <section className="flex flex-col gap-3">
        <h3 className="text-green-500 text-sm font-semibold uppercase tracking-wider">Unlocks</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_UNLOCKS.map((name) => {
            const active = unlockSet.has(name);
            return (
              <button
                key={name}
                onClick={() => corporation.toggleCorporationUnlock(name)}
                className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                  active
                    ? "border-green-500 bg-green-900/30 text-green-300"
                    : "border-gray-700 bg-transparent text-gray-500 hover:border-gray-500"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </section>

      {/* --- Divisions --- */}
      {divisions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-green-500 text-sm font-semibold uppercase tracking-wider">Divisions</h3>
          <div className="flex flex-col gap-4">
            {divisions.map(([divName, divObj]) => {
              const d = divObj?.data ?? {};
              return (
                <div key={divName} className="border border-gray-700 rounded p-3 flex flex-col gap-3">
                  <span className="text-green-400 font-semibold">
                    {divName} <span className="text-gray-500 font-normal text-xs">({d.type})</span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    <NumField
                      label="Research Points"
                      value={d.researchPoints ?? 0}
                      onChange={(v) => corporation.updateCorporationDivision(divName, { researchPoints: v })}
                    />
                    <NumField
                      label="Awareness"
                      value={d.awareness ?? 0}
                      onChange={(v) => corporation.updateCorporationDivision(divName, { awareness: v })}
                    />
                    <NumField
                      label="Popularity"
                      value={d.popularity ?? 0}
                      onChange={(v) => corporation.updateCorporationDivision(divName, { popularity: v })}
                    />
                    <NumField
                      label="Production Mult"
                      value={d.productionMult ?? 1}
                      onChange={(v) => corporation.updateCorporationDivision(divName, { productionMult: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
});

function NameField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onChange(draft); setEditing(false); };

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">{label}</span>
        <input
          autoFocus
          className="bg-gray-900 border border-green-700 text-green-300 px-2 py-1 text-sm rounded focus:outline-none focus:border-green-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        />
      </div>
    );
  }

  return (
    <button
      className="flex flex-col gap-1 text-left border border-gray-700 rounded px-3 py-2 hover:border-green-700 hover:bg-gray-800 transition-colors"
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
    >
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-green-300 text-sm font-mono">{value}</span>
    </button>
  );
}
