import type { Level } from "./types";

export const LEVELS: readonly Level[] = ["N5", "N4", "N3", "N2", "N1"];

export function unlockedLevels(highest: Level | null): Level[] {
  const idx = highest ? LEVELS.indexOf(highest) : 0;
  return LEVELS.slice(0, idx + 1);
}

export function nextLevelAfter(selected: readonly Level[]): Level | null {
  const maxIdx = Math.max(...selected.map((l) => LEVELS.indexOf(l)));
  return LEVELS[maxIdx + 1] ?? null;
}

export function filterSelectable(requested: readonly Level[], unlocked: readonly Level[]): Level[] {
  const ok = LEVELS.filter((l) => requested.includes(l) && unlocked.includes(l));
  return ok.length > 0 ? ok : ["N5"];
}
