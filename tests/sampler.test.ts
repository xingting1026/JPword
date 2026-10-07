import { describe, it, expect } from "vitest";
import { pickRound, pickDistractors, shuffle } from "../src/sampler";
import type { Word } from "../src/types";

function w(id: string, gloss = `g${id}`): Word {
  return { id, kanji: null, kana: [id], uk: true, katakana: false, gloss, glossLang: "en", glossEn: gloss, level: "N5" };
}
const pool = Array.from({ length: 30 }, (_, i) => w(String(i)));

describe("pickRound", () => {
  it("returns n distinct words from the pool", () => {
    const r = pickRound(pool, 10, Math.random);
    expect(r).toHaveLength(10);
    expect(new Set(r.map((x) => x.id)).size).toBe(10);
    for (const x of r) expect(pool).toContain(x);
  });
  it("caps at pool size", () => {
    expect(pickRound(pool.slice(0, 4), 10, Math.random)).toHaveLength(4);
  });
  it("is deterministic given the rng", () => {
    let s = 1;
    const rng = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const a = pickRound(pool, 5, rng);
    s = 1;
    const b = pickRound(pool, 5, rng);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
  });
});

describe("pickDistractors", () => {
  it("returns n glosses that differ from the target and each other", () => {
    const target = w("t", "same");
    const p = [target, w("a", "same"), w("b", "x"), w("c", "y"), w("d", "z"), w("e", "x")];
    const d = pickDistractors(p, target, 3, Math.random);
    expect(d).toHaveLength(3);
    expect(d).not.toContain("same");
    expect(new Set(d).size).toBe(3);
  });
  it("returns fewer when the pool cannot supply enough", () => {
    const target = w("t", "same");
    expect(pickDistractors([target, w("b", "x")], target, 3, Math.random)).toEqual(["x"]);
  });
});

describe("shuffle", () => {
  it("keeps all elements", () => {
    expect([...shuffle([1, 2, 3, 4], Math.random)].sort()).toEqual([1, 2, 3, 4]);
  });
});
