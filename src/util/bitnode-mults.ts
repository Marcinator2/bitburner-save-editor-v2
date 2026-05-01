import { Bitburner } from "bitburner.types";

type SkillKey = Exclude<Bitburner.PlayerStat, "intelligence">;

// Base BitNode skill level multipliers (1.0 = no penalty, 0.35 = 35% of normal)
// Source: bitburner-src-stable/src/BitNode/BitNode.tsx :: getBitNodeMultipliers()
const BN_SKILL_MULTS: Record<number, Partial<Record<SkillKey, number>>> = {
  1:  {},
  2:  { hacking: 0.8 },
  3:  { hacking: 0.8 },
  4:  {},
  5:  {},
  6:  { hacking: 0.35 },
  7:  { hacking: 0.35 },
  8:  {},
  9:  { hacking: 0.5, strength: 0.45, defense: 0.45, dexterity: 0.45, agility: 0.45, charisma: 0.45 },
  10: { hacking: 0.35, strength: 0.4, defense: 0.4, dexterity: 0.4, agility: 0.4, charisma: 0.4 },
  11: { hacking: 0.6 },
  // 12: dynamic — dec = 1 / 1.02^(sf12Level + 1) for all stats
  13: { hacking: 0.25, strength: 0.7, defense: 0.7, dexterity: 0.7, agility: 0.7 },
  14: { hacking: 0.4, strength: 0.5, defense: 0.5, dexterity: 0.5, agility: 0.5 },
};

/** Returns the BitNode's skill level multiplier for a given stat. */
export function getBitNodeSkillMult(stat: SkillKey, bitNodeN: number, sf12Level = 0): number {
  if (bitNodeN === 12) {
    // Active run is always SF level + 1
    const lvl = sf12Level + 1;
    return 1 / Math.pow(1.02, lvl);
  }
  return BN_SKILL_MULTS[bitNodeN]?.[stat] ?? 1;
}

/** Reads SourceFile 12 level out of the player save's sourceFiles field. */
export function getSf12Level(sourceFiles: unknown): number {
  if (!sourceFiles) return 0;
  if (Array.isArray(sourceFiles)) {
    // Pre-2.3 format: [{ n, lvl }]
    const entry = (sourceFiles as { n: number; lvl: number }[]).find((sf) => sf.n === 12);
    return entry?.lvl ?? 0;
  }
  // Post-2.3 JSONMap format: { ctor: "JSONMap", data: [[n, lvl], ...] }
  const map = sourceFiles as { data?: [number, number][] };
  if (Array.isArray(map.data)) {
    const entry = map.data.find((e) => e[0] === 12);
    return entry?.[1] ?? 0;
  }
  return 0;
}
