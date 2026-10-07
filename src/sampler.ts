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

/**
 * Distractor glosses for a 4-choice question. Words whose gloss is in the same
 * language as the target come first so that a lone Chinese (or English) option
 * does not give the answer away.
 */
export function pickDistractors(pool: readonly Word[], target: Word, n: number, rng: Rng): string[] {
  const seen = new Set<string>([target.gloss]);
  const out: string[] = [];
  const shuffled = shuffle(pool, rng);
  const ordered = [
    ...shuffled.filter((w) => w.glossLang === target.glossLang),
    ...shuffled.filter((w) => w.glossLang !== target.glossLang),
  ];
  for (const w of ordered) {
    if (w.id === target.id || seen.has(w.gloss)) continue;
    seen.add(w.gloss);
    out.push(w.gloss);
    if (out.length === n) break;
  }
  return out;
}
