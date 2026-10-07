import { pickDistractors, shuffle } from "./sampler";
import type { Mode, Rng, Word } from "./types";

export const ROUND_SIZE = 10;
export const PASS_THRESHOLD = 9;

export interface MeaningQuestion {
  kind: "meaning";
  word: Word;
  /** kanji null → show kana only; otherwise show kanji with kana as ruby */
  prompt: { kanji: string | null; kana: string };
  choices: string[];
}
export interface ReadingQuestion {
  kind: "reading";
  word: Word;
  prompt: { kanji: string };
}
export type Question = MeaningQuestion | ReadingQuestion;

function showsKana(w: Word): boolean {
  return w.kanji === null || w.uk || w.katakana;
}

export function buildQuestions(roundWords: readonly Word[], pool: readonly Word[], mode: Mode, rng: Rng): Question[] {
  return roundWords.map((word) => {
    const kana = word.kana[0] ?? "";
    if (mode === "reading" && !showsKana(word) && word.kanji) {
      return { kind: "reading", word, prompt: { kanji: word.kanji } };
    }
    const distractors = pickDistractors(pool, word, 3, rng);
    return {
      kind: "meaning",
      word,
      prompt: { kanji: showsKana(word) ? null : word.kanji, kana },
      choices: shuffle([word.gloss, ...distractors], rng),
    };
  });
}

export class Round {
  index = 0;
  correct = 0;
  readonly results: boolean[] = [];

  constructor(readonly questions: readonly Question[]) {}

  get size(): number { return this.questions.length; }
  get threshold(): number { return Math.ceil((PASS_THRESHOLD / ROUND_SIZE) * this.size); }
  get current(): Question | undefined { return this.questions[this.index]; }
  get finished(): boolean { return this.index >= this.size; }
  get passed(): boolean { return this.finished && this.correct >= this.threshold; }

  answer(isCorrect: boolean): void {
    if (this.finished) return;
    this.results.push(isCorrect);
    if (isCorrect) this.correct++;
    this.index++;
  }
}
