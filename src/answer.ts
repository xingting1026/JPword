import { toHiragana } from "wanakana";

const MACRON: Record<string, string> = { ā: "aa", ī: "ii", ū: "uu", ē: "ee", ō: "ou" };

export function normalizeKana(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => MACRON[c] ?? c)
    .replace(/\s+/g, "");
  return toHiragana(s, { passRomaji: false, convertLongVowelMark: false });
}

const VOWEL_OF: Record<string, string> = {
  あ: "あ", か: "あ", さ: "あ", た: "あ", な: "あ", は: "あ", ま: "あ", や: "あ", ら: "あ", わ: "あ", が: "あ", ざ: "あ", だ: "あ", ば: "あ", ぱ: "あ", ゃ: "あ",
  い: "い", き: "い", し: "い", ち: "い", に: "い", ひ: "い", み: "い", り: "い", ぎ: "い", じ: "い", ぢ: "い", び: "い", ぴ: "い",
  う: "う", く: "う", す: "う", つ: "う", ぬ: "う", ふ: "う", む: "う", ゆ: "う", る: "う", ぐ: "う", ず: "う", づ: "う", ぶ: "う", ぷ: "う", ゅ: "う",
  え: "え", け: "え", せ: "え", て: "え", ね: "え", へ: "え", め: "え", れ: "え", げ: "え", ぜ: "え", で: "え", べ: "え", ぺ: "え",
  お: "お", こ: "お", そ: "お", と: "お", の: "お", ほ: "お", も: "お", よ: "お", ろ: "お", を: "お", ご: "お", ぞ: "お", ど: "お", ぼ: "お", ぽ: "お", ょ: "お",
};

/** Expand ー into the preceding vowel so こーひー and こおひい compare equal. */
function expandChoonpu(s: string): string {
  let out = "";
  for (const ch of s) {
    if (ch === "ー" && out.length > 0) {
      const prev = out[out.length - 1]!;
      out += VOWEL_OF[prev] ?? ch;
    } else {
      out += ch;
    }
  }
  return out;
}

export function isReadingCorrect(input: string, readings: readonly string[]): boolean {
  const a = expandChoonpu(normalizeKana(input));
  if (a.length === 0) return false;
  return readings.some((r) => expandChoonpu(normalizeKana(r)) === a);
}
