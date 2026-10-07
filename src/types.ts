export type Level = "N5" | "N4" | "N3" | "N2" | "N1";
export type Mode = "meaning" | "reading";

export interface Word {
  id: string;
  kanji: string | null;
  kana: string[];
  uk: boolean;
  katakana: boolean;
  gloss: string;
  glossLang: "zh" | "en";
  glossEn: string;
  level: Level;
}

export type Rng = () => number; // [0, 1)
