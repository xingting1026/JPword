import type { Rng, Word } from "./types";

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickRound(pool: readonly Word[], n: number, rng: Rng): Word[] {
  return shuffle(pool, rng).slice(0, Math.min(n, pool.length));
}

export function pickDistractors(pool: readonly Word[], target: Word, n: number, rng: Rng): string[] {
  const seen = new Set<string>([target.gloss]);
  const out: string[] = [];
  for (const w of shuffle(pool, rng)) {
    if (w.id === target.id || seen.has(w.gloss)) continue;
    seen.add(w.gloss);
    out.push(w.gloss);
    if (out.length === n) break;
  }
  return out;
}
