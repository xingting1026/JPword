import { describe, it, expect } from "vitest";
import { normalizeKana, isReadingCorrect } from "../src/answer";

describe("normalizeKana", () => {
  it("converts romaji to hiragana", () => {
    expect(normalizeKana("toukyou")).toBe("とうきょう");
  });
  it("converts katakana to hiragana", () => {
    expect(normalizeKana("トウキョウ")).toBe("とうきょう");
  });
  it("accepts macron long vowels", () => {
    expect(normalizeKana("tōkyō")).toBe("とうきょう");
  });
  it("strips spaces and ignores case", () => {
    expect(normalizeKana(" Ne ko ")).toBe("ねこ");
  });
  it("keeps long-vowel mark in katakana words as hiragana ー", () => {
    expect(normalizeKana("コーヒー")).toBe("こーひー");
  });
});

describe("isReadingCorrect", () => {
  it("matches any listed reading", () => {
    expect(isReadingCorrect("au", ["あう"])).toBe(true);
    expect(isReadingCorrect("あすこ", ["あそこ", "あすこ"])).toBe(true);
  });
  it("rejects wrong reading", () => {
    expect(isReadingCorrect("ao", ["あう"])).toBe(false);
  });
  it("treats おう and おお as distinct", () => {
    expect(isReadingCorrect("toukyou", ["とおきょう"])).toBe(false);
  });
  it("treats ー in a katakana reading as equal to the vowel-lengthened form", () => {
    expect(isReadingCorrect("koohii", ["コーヒー"])).toBe(true);
  });
  it("rejects empty input", () => {
    expect(isReadingCorrect("   ", ["あう"])).toBe(false);
  });
});
