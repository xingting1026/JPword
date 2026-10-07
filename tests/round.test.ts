import { describe, it, expect } from "vitest";
import { buildQuestions, Round, PASS_THRESHOLD, ROUND_SIZE } from "../src/round";
import type { Word } from "../src/types";

function w(id: string, kanji: string | null, kana: string, gloss: string, uk = false): Word {
  return { id, kanji, kana: [kana], uk, katakana: /^[゠-ヿ]+$/.test(kanji ?? kana), gloss, glossLang: "en", glossEn: gloss, level: "N5" };
}
const pool: Word[] = [
  w("1", "会う", "あう", "to meet"),
  w("2", "青", "あお", "blue"),
  w("3", null, "あそこ", "over there", true),
  w("4", "コーヒー", "コーヒー", "coffee"),
  w("5", "赤", "あか", "red"),
  w("6", "朝", "あさ", "morning"),
];
const rng = () => 0.5;

describe("buildQuestions", () => {
  it("meaning mode: every question is a 4-choice meaning question containing the correct gloss", () => {
    const qs = buildQuestions(pool, pool, "meaning", rng);
    expect(qs).toHaveLength(6);
    for (const q of qs) {
      expect(q.kind).toBe("meaning");
      if (q.kind === "meaning") {
        expect(q.choices).toHaveLength(4);
        expect(q.choices).toContain(q.word.gloss);
      }
    }
  });
  it("meaning mode: kanji words carry kana for ruby, kana words have no kanji prompt", () => {
    const qs = buildQuestions(pool, pool, "meaning", rng);
    const q1 = qs.find((q) => q.word.id === "1")!;
    const q3 = qs.find((q) => q.word.id === "3")!;
    expect(q1.kind === "meaning" && q1.prompt.kanji).toBe("会う");
    expect(q1.kind === "meaning" && q1.prompt.kana).toBe("あう");
    expect(q3.kind === "meaning" && q3.prompt.kanji).toBeNull();
  });
  it("reading mode: kanji words become typed questions, kana/katakana words stay meaning questions", () => {
    const qs = buildQuestions(pool, pool, "reading", rng);
    const byId = Object.fromEntries(qs.map((q) => [q.word.id, q.kind]));
    expect(byId["1"]).toBe("reading");
    expect(byId["3"]).toBe("meaning");
    expect(byId["4"]).toBe("meaning");
  });
  it("reading mode: uk words with a kanji form are shown in kana and asked for meaning", () => {
    const uk = w("9", "矢張り", "やはり", "as expected", true);
    const qs = buildQuestions([uk], pool, "reading", rng);
    expect(qs[0]!.kind).toBe("meaning");
    expect(qs[0]!.kind === "meaning" && qs[0]!.prompt.kanji).toBeNull();
  });
});

describe("Round", () => {
  it("scores answers and decides pass at the threshold", () => {
    const qs = buildQuestions(pool, pool, "meaning", rng);
    const r = new Round(qs);
    expect(ROUND_SIZE).toBe(10);
    expect(PASS_THRESHOLD).toBe(9);
    r.answer(true); r.answer(true); r.answer(false);
    expect(r.correct).toBe(2);
    expect(r.index).toBe(3);
    expect(r.finished).toBe(false);
    r.answer(true); r.answer(true); r.answer(true);
    expect(r.finished).toBe(true);
    expect(r.passed).toBe(false);
  });
  it("scales the pass threshold when the round is shorter than 10", () => {
    const r = new Round(buildQuestions(pool, pool, "meaning", rng));
    expect(r.threshold).toBe(6);
  });
  it("passes a full 10-question round at 9 correct and fails at 8", () => {
    const big = Array.from({ length: 10 }, (_, i) => w(`b${i}`, null, `か${i}`, `m${i}`, true));
    const pass = new Round(buildQuestions(big, big, "meaning", rng));
    for (let i = 0; i < 10; i++) pass.answer(i !== 0);
    expect(pass.threshold).toBe(9);
    expect(pass.passed).toBe(true);
    const fail = new Round(buildQuestions(big, big, "meaning", rng));
    for (let i = 0; i < 10; i++) fail.answer(i > 1);
    expect(fail.passed).toBe(false);
  });
  it("ignores answers after the round is finished", () => {
    const r = new Round(buildQuestions(pool.slice(0, 2), pool, "meaning", rng));
    r.answer(true); r.answer(true); r.answer(true);
    expect(r.correct).toBe(2);
    expect(r.index).toBe(2);
  });
});
