import type { Level, Word } from "./types";

const cache = new Map<Level, Promise<Word[]>>();

function fetchLevel(level: Level): Promise<Word[]> {
  let p = cache.get(level);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/${level.toLowerCase()}.json`).then((r) => {
      if (!r.ok) throw new Error(`load ${level}: ${r.status}`);
      return r.json() as Promise<Word[]>;
    });
    p.catch(() => cache.delete(level));
    cache.set(level, p);
  }
  return p;
}

export async function loadWords(levels: readonly Level[]): Promise<Word[]> {
  const lists = await Promise.all(levels.map(fetchLevel));
  return lists.flat();
}
