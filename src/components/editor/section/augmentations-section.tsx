import { useCallback, useContext, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";

const ALL_AUGMENTATIONS: string[] = [
  "NeuroFlux Governor",
  "Augmented Targeting I",
  "Augmented Targeting II",
  "Augmented Targeting III",
  "Synthetic Heart",
  "Synfibril Muscle",
  "Combat Rib I",
  "Combat Rib II",
  "Combat Rib III",
  "Nanofiber Weave",
  "NEMEAN Subdermal Weave",
  "Wired Reflexes",
  "Graphene Bone Lacings",
  "Bionic Spine",
  "Graphene Bionic Spine Upgrade",
  "Bionic Legs",
  "Graphene Bionic Legs Upgrade",
  "Speech Processor Implant",
  "TITN-41 Gene-Modification Injection",
  "Enhanced Social Interaction Implant",
  "BitWire",
  "Artificial Bio-neural Network Implant",
  "Artificial Synaptic Potentiation",
  "Enhanced Myelin Sheathing",
  "Synaptic Enhancement Implant",
  "Neural-Retention Enhancement",
  "DataJack",
  "Embedded Netburner Module",
  "Embedded Netburner Module Core Implant",
  "Embedded Netburner Module Core V2 Upgrade",
  "Embedded Netburner Module Core V3 Upgrade",
  "Embedded Netburner Module Analyze Engine",
  "Embedded Netburner Module Direct Memory Access Upgrade",
  "Neuralstimulator",
  "Neural Accelerator",
  "Cranial Signal Processors - Gen I",
  "Cranial Signal Processors - Gen II",
  "Cranial Signal Processors - Gen III",
  "Cranial Signal Processors - Gen IV",
  "Cranial Signal Processors - Gen V",
  "Neuronal Densification",
  "Neuroreceptor Management Implant",
  "Nuoptimal Nootropic Injector Implant",
  "Speech Enhancement",
  "FocusWire",
  "PC Direct-Neural Interface",
  "PC Direct-Neural Interface Optimization Submodule",
  "PC Direct-Neural Interface NeuroNet Injector",
  "PCMatrix",
  "ADR-V1 Pheromone Gene",
  "ADR-V2 Pheromone Gene",
  "The Shadow's Simulacrum",
  "Hacknet Node CPU Architecture Neural-Upload",
  "Hacknet Node Cache Architecture Neural-Upload",
  "Hacknet Node NIC Architecture Neural-Upload",
  "Hacknet Node Kernel Direct-Neural Interface",
  "Hacknet Node Core Direct-Neural Interface",
  "Neurotrainer I",
  "Neurotrainer II",
  "Neurotrainer III",
  "HyperSight Corneal Implant",
  "LuminCloaking-V1 Skin Implant",
  "LuminCloaking-V2 Skin Implant",
  "HemoRecirculator",
  "SmartSonar Implant",
  "Power Recirculation Core",
  "QLink",
  "The Red Pill",
  "SPTN-97 Gene Modification",
  "ECorp HVMind Implant",
  "CordiARC Fusion Reactor",
  "SmartJaw",
  "Neotra",
  "Xanipher",
  "nextSENS Gene Modification",
  "OmniTek InfoLoad",
  "Photosynthetic Cells",
  "BitRunners Neurolink",
  "The Black Hand",
  "Unstable Circadian Modulator",
  "CRTX42-AA Gene Modification",
  "Neuregen Gene Modification",
  "CashRoot Starter Kit",
  "NutriGen Implant",
  "INFRARET Enhancement",
  "DermaForce Particle Barrier",
  "Graphene BrachiBlades Upgrade",
  "Graphene Bionic Arms Upgrade",
  "BrachiBlades",
  "Bionic Arms",
  "Social Negotiation Assistant (S.N.A)",
  "violet Congruity Implant",
  "Hydroflame Left Arm",
  "BigD's Big ... Brain",
  "Z.O.Ë.",
  // Bladeburner
  "EsperTech Bladeburner Eyewear",
  "EMS-4 Recombination",
  "ORION-MKIV Shoulder",
  "Hyperion Plasma Cannon V1",
  "Hyperion Plasma Cannon V2",
  "GOLEM Serum",
  "Vangelis Virus",
  "Vangelis Virus 3.0",
  "I.N.T.E.R.L.I.N.K.E.D",
  "Blade's Runners",
  "BLADE-51b Tesla Armor",
  "BLADE-51b Tesla Armor: Power Cells Upgrade",
  "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
  "BLADE-51b Tesla Armor: Unibeam Upgrade",
  "BLADE-51b Tesla Armor: Omnibeam Upgrade",
  "BLADE-51b Tesla Armor: IPU Upgrade",
  "The Blade's Simulacrum",
  // Stanek
  "Stanek's Gift - Genesis",
  "Stanek's Gift - Awakening",
  "Stanek's Gift - Serenity",
  // SoA
  "SoA - Might of Ares",
  "SoA - Wisdom of Athena",
  "SoA - Trickery of Hermes",
  "SoA - Beauty of Aphrodite",
  "SoA - Chaos of Dionysus",
  "SoA - Flood of Poseidon",
  "SoA - Hunt of Artemis",
  "SoA - Knowledge of Apollo",
  "SoA - phyzical WKS harmonizer",
];

const NFG = "NeuroFlux Governor";

export default observer(function AugmentationsSection() {
  const { player } = useContext(FileContext);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const installedMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const aug of player.data.augmentations ?? []) {
      map.set(aug.name, (map.get(aug.name) ?? 0) + 1);
    }
    return map;
  }, [player.data.augmentations]);

  const queuedMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const aug of player.data.queuedAugmentations ?? []) {
      map.set(aug.name, (map.get(aug.name) ?? 0) + 1);
    }
    return map;
  }, [player.data.queuedAugmentations]);

  const toggleAug = useCallback(
    (name: string, checked: boolean) => {
      const current = [...(player.data.augmentations ?? [])];
      if (checked) {
        current.push({ name, level: 1 });
      } else {
        const idx = current.findIndex((a) => a.name === name);
        if (idx !== -1) current.splice(idx, 1);
      }
      player.updatePlayer({ augmentations: current });
    },
    [player]
  );

  const setNfgLevel = useCallback(
    (level: number) => {
      const withoutNfg = (player.data.augmentations ?? []).filter((a) => a.name !== NFG);
      const entries = level > 0 ? Array.from({ length: level }, (_, i) => ({ name: NFG, level: i + 1 })) : [];
      player.updatePlayer({ augmentations: [...withoutNfg, ...entries] });
    },
    [player]
  );

  const activateAll = useCallback(() => {
    const current = new Map(installedMap);
    const result: { name: string; level: number }[] = [];
    for (const name of ALL_AUGMENTATIONS) {
      if (name === NFG) continue;
      result.push({ name, level: 1 });
    }
    const nfgLevel = current.get(NFG) ?? 1;
    for (let i = 0; i < nfgLevel; i++) result.push({ name: NFG, level: i + 1 });
    player.updatePlayer({ augmentations: result });
  }, [player, installedMap]);

  const deactivateAll = useCallback(() => {
    player.updatePlayer({ augmentations: [] });
  }, [player]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_AUGMENTATIONS.filter((name) => {
      if (!name.toLowerCase().includes(q)) return false;
      if (!showAll && !installedMap.has(name) && name !== NFG) return false;
      return true;
    });
  }, [search, showAll, installedMap]);

  const nfgLevel = installedMap.get(NFG) ?? 0;
  const installedCount = installedMap.size;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-200">
          Augmentations ({installedCount} installed
          {queuedMap.size > 0 && `, ${queuedMap.size} queued`})
        </span>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded bg-green-900 hover:bg-green-700 text-green-200 text-xs transition-colors"
            onClick={activateAll}
          >
            Enable all
          </button>
          <button
            className="px-2 py-1 rounded bg-red-900 hover:bg-red-700 text-red-200 text-xs transition-colors"
            onClick={deactivateAll}
          >
            Disable all
          </button>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <input
          className="bg-gray-800 rounded px-2 py-1 text-sm w-56 outline-none focus:ring-1 ring-green-700"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="accent-green-600"
            checked={showAll}
            onChange={(e) => setShowAll(e.currentTarget.checked)}
          />
          Show all
        </label>
      </div>

      {/* NeuroFlux Governor – stackable, separate level input */}
      <div className="flex items-center gap-3 bg-gray-900 rounded border border-gray-700 px-3 py-2">
        <input
          type="checkbox"
          className="accent-green-600 w-4 h-4"
          checked={nfgLevel > 0}
          onChange={(e) => setNfgLevel(e.currentTarget.checked ? 1 : 0)}
        />
        <span className="text-sm text-gray-200 flex-1">NeuroFlux Governor</span>
        <label className="flex items-center gap-1 text-xs text-gray-400">
          Level
          <input
            type="number"
            className="bg-gray-800 rounded border border-gray-600 px-1 py-0.5 w-16 outline-none focus:border-green-700 text-sm"
            min={0}
            value={nfgLevel}
            onChange={(e) => {
              const v = Math.max(0, Number(e.currentTarget.value));
              if (!isNaN(v)) setNfgLevel(v);
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {filtered
          .filter((name) => name !== NFG)
          .map((name) => {
            const installed = installedMap.has(name);
            const queued = queuedMap.has(name);
            return (
              <label
                key={name}
                className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer select-none text-sm transition-colors ${
                  installed
                    ? "border-green-800 bg-green-950 text-green-200"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-green-600 w-4 h-4 shrink-0"
                  checked={installed}
                  onChange={(e) => toggleAug(name, e.currentTarget.checked)}
                />
                <span className="truncate" title={name}>{name}</span>
                {queued && (
                  <span className="ml-auto text-xs px-1 rounded bg-yellow-900 text-yellow-300 shrink-0">Queue</span>
                )}
              </label>
            );
          })}
      </div>
    </div>
  );
});
