# JPword Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static GitHub Pages site that quizzes 10 random JLPT words per round, with levels N4–N1 unlocked by fixed four-letter keys, no persistence, no audio.

**Architecture:** A Node build script merges OpenJLPT vocab lists (word, reading, English gloss, JMdict id) with JMdict-common (`uk` flag, extra readings) and kaikki zh-Wiktionary (Chinese gloss) into five static JSON files under `public/data/`. The browser app is vanilla TypeScript bundled by Vite: pure modules (`sampler`, `answer`, `levels`, `keys`, `round`) are unit-tested with Vitest; `ui.ts` renders a single page. Keys live in `src/keys.ts` as SHA-256 hashes plus XOR-obfuscated reveal strings generated once by `scripts/gen-keys.mjs`.

**Tech Stack:** Node 22, Vite 8, TypeScript 7, Vitest, wanakana 5, opencc-js 1.4 (build only), GitHub Actions Pages deploy.

Spec: `docs/superpowers/specs/2026-10-07-jpword-design.md`

---

## File structure

| Path | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` | Project scaffold |
| `index.html` | Single page shell, `lang="zh-Hant"`, loads `src/main.ts` |
| `src/style.css` | Plain white/black layout, `:lang(ja)` font stack |
| `src/types.ts` | `Word`, `Level`, `Mode`, `Question` types |
| `src/sampler.ts` | `pickRound`, `pickDistractors`, `shuffle` (injectable RNG) |
| `src/answer.ts` | `normalizeKana`, `isReadingCorrect` |
| `src/levels.ts` | `LEVELS`, `unlockedLevels`, `nextLevelAfter` |
| `src/keys.ts` | Generated: hashes + obfuscated keys, `verifyKey`, `revealKey` |
| `src/round.ts` | `buildQuestions`, `Round` state (answers, score, passed) |
| `src/data.ts` | `loadWords(levels)` fetches `data/<level>.json` |
| `src/ui.ts` | DOM rendering for start screen, question, result |
| `src/main.ts` | Wires data + ui, reads URL params |
| `scripts/gen-keys.mjs` | One-shot key generator → `src/keys.ts` |
| `scripts/build-data.mjs` | Downloads sources to `.cache/`, writes `public/data/n*.json` |
| `public/data/n5.json` … `n1.json` | Generated word pools (committed) |
| `.github/workflows/deploy.yml` | Build + deploy to Pages |
| `tests/*.test.ts` | Vitest unit tests |

Word JSON record:

```ts
interface Word {
  id: string;          // OpenJLPT stable id
  kanji: string | null; // null when the word is written in kana
  kana: string[];      // readings, hiragana or katakana; first is primary
  uk: boolean;         // usually written in kana (JMdict misc "uk")
  katakana: boolean;   // headword is katakana (loanword)
  gloss: string;       // display gloss (zh-TW if available, else English)
  glossLang: "zh" | "en";
  glossEn: string;     // always present
  level: "N5" | "N4" | "N3" | "N2" | "N1";
}
```

---

### Task 1: Scaffold project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`, `src/main.ts`, `src/style.css`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "jpword",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "build:data": "node scripts/build-data.mjs",
    "gen:keys": "node scripts/gen-keys.mjs"
  },
  "dependencies": {
    "wanakana": "^5.3.1"
  },
  "devDependencies": {
    "opencc-js": "^1.4.2",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Write vite.config.ts**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/JPword/",
  build: { target: "es2022" },
});
```

- [ ] **Step 4: Write .gitignore**

```
node_modules
dist
.cache
```

- [ ] **Step 5: Write index.html**

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>JPword</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <main id="app"></main>
    <footer id="credits">
      資料來源：<a href="https://github.com/evanclan/OpenJLPT">OpenJLPT</a>（CC BY-SA 4.0，使用 EDRDG
      <a href="https://www.edrdg.org/jmdict/j_jmdict.html">JMdict</a>、Jonathan Waller JLPT 清單、Tatoeba）、
      <a href="https://kaikki.org/zhwiktionary/">中文維基詞典</a>（CC BY-SA）。
      <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
    </footer>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Write src/style.css**

```css
:root { color-scheme: light; }
html, body { margin: 0; background: #fff; color: #111; font-family: system-ui, "Noto Sans TC", sans-serif; }
:lang(ja) { font-family: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, sans-serif; }
main { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
footer { max-width: 640px; margin: 48px auto 24px; padding: 0 16px; font-size: 12px; color: #666; }
h1 { font-size: 20px; font-weight: 600; margin: 0 0 24px; }
fieldset { border: 1px solid #ccc; margin: 0 0 16px; padding: 12px; }
legend { font-size: 14px; color: #444; }
label { display: inline-block; margin-right: 16px; }
button { font: inherit; padding: 10px 16px; border: 1px solid #111; background: #fff; cursor: pointer; }
button:disabled { opacity: .4; cursor: default; }
button.primary { background: #111; color: #fff; }
input[type=text] { font: inherit; padding: 8px; border: 1px solid #999; width: 100%; box-sizing: border-box; }
.progress { font-size: 13px; color: #666; margin-bottom: 32px; }
.word { font-size: 48px; text-align: center; margin: 24px 0 40px; line-height: 1.4; }
.word rt { font-size: 16px; }
.choices { display: grid; gap: 10px; }
.choices button { text-align: left; }
.choices button.correct { border-color: #080; background: #e8f5e9; }
.choices button.wrong { border-color: #c00; background: #fdecea; }
.reveal { margin-top: 24px; padding: 16px; border: 1px solid #ccc; }
.reveal .big { font-size: 28px; }
.result { text-align: center; }
.result .score { font-size: 56px; margin: 24px 0; }
.key { font-family: ui-monospace, monospace; font-size: 32px; letter-spacing: .3em; }
.key-row { margin-top: 24px; font-size: 13px; color: #666; }
.key-row input { width: 8em; font-family: ui-monospace, monospace; text-transform: uppercase; }
.muted { color: #666; font-size: 13px; }
.error { color: #c00; }
```

- [ ] **Step 7: Write placeholder src/main.ts**

```ts
document.getElementById("app")!.textContent = "JPword";
```

- [ ] **Step 8: Install and verify build**

Run: `npm install && npm run build`
Expected: `dist/index.html` exists, no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore index.html src/main.ts src/style.css
git commit -m "chore: scaffold Vite + TypeScript project"
```

---

### Task 2: Types and sampler

**Files:**
- Create: `src/types.ts`, `src/sampler.ts`, `tests/sampler.test.ts`

- [ ] **Step 1: Write src/types.ts**

```ts
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
```

- [ ] **Step 2: Write failing tests tests/sampler.test.ts**

```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/sampler.test.ts`
Expected: FAIL, cannot resolve `../src/sampler`.

- [ ] **Step 4: Write src/sampler.ts**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/sampler.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/sampler.ts tests/sampler.test.ts
git commit -m "feat: add word types and random sampler"
```

---

### Task 3: Answer normalisation

**Files:**
- Create: `src/answer.ts`, `tests/answer.test.ts`

- [ ] **Step 1: Write failing tests tests/answer.test.ts**

```ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/answer.test.ts`
Expected: FAIL, cannot resolve `../src/answer`.

- [ ] **Step 3: Write src/answer.ts**

```ts
import { toHiragana } from "wanakana";

const MACRON: Record<string, string> = { ā: "aa", ī: "ii", ū: "uu", ē: "ee", ō: "ou" };

export function normalizeKana(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => MACRON[c] ?? c)
    .replace(/\s+/g, "");
  return toHiragana(s, { passRomaji: false });
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/answer.test.ts`
Expected: PASS (9 tests). If `tōkyō` fails, check that the macron replacement runs before `toHiragana`.

- [ ] **Step 5: Commit**

```bash
git add src/answer.ts tests/answer.test.ts
git commit -m "feat: add kana answer normalisation"
```

---

### Task 4: Levels and keys

**Files:**
- Create: `scripts/gen-keys.mjs`, `src/keys.ts` (generated), `src/levels.ts`, `tests/levels.test.ts`, `tests/keys.test.ts`

- [ ] **Step 1: Write scripts/gen-keys.mjs**

```js
// One-shot generator. Run once; do not print keys in chat. Output: src/keys.ts
import { createHash, randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion with 1/0
const LEVELS = ["N4", "N3", "N2", "N1"];
const MASK = randomInt(1, 255);

function key() {
  return Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join("");
}
function sha256(s) {
  return createHash("sha256").update(s).digest("hex");
}
function obfuscate(s) {
  return Array.from(s, (c) => (c.charCodeAt(0) ^ MASK).toString(16).padStart(2, "0")).join("");
}

const entries = LEVELS.map((level) => {
  const k = key();
  return { level, hash: sha256(k), obf: obfuscate(k) };
});

const ts = `// GENERATED by scripts/gen-keys.mjs. Do not edit by hand.
import type { Level } from "./types";

const MASK = ${MASK};
const ENTRIES: ReadonlyArray<{ level: Level; hash: string; obf: string }> = ${JSON.stringify(entries, null, 2)};

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Returns the level a key unlocks, or null when invalid. Case-insensitive. */
export async function verifyKey(input: string): Promise<Level | null> {
  const h = await sha256Hex(input.trim().toUpperCase());
  return ENTRIES.find((e) => e.hash === h)?.level ?? null;
}

/** Returns the key that unlocks \`level\`, or null for N5. */
export function revealKey(level: Level): string | null {
  const e = ENTRIES.find((x) => x.level === level);
  if (!e) return null;
  const bytes = e.obf.match(/../g) ?? [];
  return bytes.map((b) => String.fromCharCode(parseInt(b, 16) ^ MASK)).join("");
}
`;
writeFileSync(new URL("../src/keys.ts", import.meta.url), ts);
console.log("src/keys.ts written for", LEVELS.join(", "));
```

- [ ] **Step 2: Generate keys**

Run: `node scripts/gen-keys.mjs`
Expected: `src/keys.ts written for N4, N3, N2, N1`. Do not open or print the file's contents.

- [ ] **Step 3: Write failing tests tests/levels.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { LEVELS, unlockedLevels, nextLevelAfter, filterSelectable } from "../src/levels";

describe("levels", () => {
  it("orders levels from N5 to N1", () => {
    expect(LEVELS).toEqual(["N5", "N4", "N3", "N2", "N1"]);
  });
  it("unlocks cumulatively", () => {
    expect(unlockedLevels(null)).toEqual(["N5"]);
    expect(unlockedLevels("N4")).toEqual(["N5", "N4"]);
    expect(unlockedLevels("N3")).toEqual(["N5", "N4", "N3"]);
    expect(unlockedLevels("N1")).toEqual(["N5", "N4", "N3", "N2", "N1"]);
  });
  it("gives the level after the highest selected", () => {
    expect(nextLevelAfter(["N5"])).toBe("N4");
    expect(nextLevelAfter(["N5", "N4"])).toBe("N3");
    expect(nextLevelAfter(["N4", "N5"])).toBe("N3");
    expect(nextLevelAfter(["N1"])).toBeNull();
    expect(nextLevelAfter(["N5", "N1"])).toBeNull();
  });
  it("filters a requested selection down to unlocked levels, defaulting to N5", () => {
    expect(filterSelectable(["N4", "N3"], ["N5", "N4"])).toEqual(["N4"]);
    expect(filterSelectable(["N1"], ["N5"])).toEqual(["N5"]);
  });
});
```

- [ ] **Step 4: Write failing tests tests/keys.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { verifyKey, revealKey } from "../src/keys";

describe("keys", () => {
  it("round-trips every revealed key through verifyKey, case-insensitively", async () => {
    for (const level of ["N4", "N3", "N2", "N1"] as const) {
      const k = revealKey(level);
      expect(k).toMatch(/^[A-Z]{4}$/);
      expect(await verifyKey(k!)).toBe(level);
      expect(await verifyKey(` ${k!.toLowerCase()} `)).toBe(level);
    }
  });
  it("rejects unknown keys and returns null for N5", async () => {
    expect(await verifyKey("ZZZZ")).toBeNull();
    expect(await verifyKey("")).toBeNull();
    expect(revealKey("N5")).toBeNull();
  });
  it("uses four distinct keys", () => {
    const ks = (["N4", "N3", "N2", "N1"] as const).map(revealKey);
    expect(new Set(ks).size).toBe(4);
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npx vitest run tests/levels.test.ts tests/keys.test.ts`
Expected: levels FAIL (module missing); keys PASS or FAIL depending on generation — if `ZZZZ` happens to be generated, re-run `node scripts/gen-keys.mjs`.

- [ ] **Step 6: Write src/levels.ts**

```ts
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
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run tests/levels.test.ts tests/keys.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
git add scripts/gen-keys.mjs src/keys.ts src/levels.ts tests/levels.test.ts tests/keys.test.ts
git commit -m "feat: add level unlocking and generated keys"
```

---

### Task 5: Round state

**Files:**
- Create: `src/round.ts`, `tests/round.test.ts`

- [ ] **Step 1: Write failing tests tests/round.test.ts**

```ts
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
    expect(r.passed).toBe(false); // 5/6 with threshold scaled to the actual size
  });
  it("scales the pass threshold when the round is shorter than 10", () => {
    const r = new Round(buildQuestions(pool, pool, "meaning", rng));
    expect(r.threshold).toBe(Math.ceil((PASS_THRESHOLD / ROUND_SIZE) * 6)); // 6
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/round.test.ts`
Expected: FAIL, cannot resolve `../src/round`.

- [ ] **Step 3: Write src/round.ts**

```ts
import { pickDistractors, shuffle } from "./sampler";
import type { Mode, Rng, Word } from "./types";

export const ROUND_SIZE = 10;
export const PASS_THRESHOLD = 9;

export interface MeaningQuestion {
  kind: "meaning";
  word: Word;
  prompt: { kanji: string | null; kana: string }; // kanji null → show kana only
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/round.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/round.ts tests/round.test.ts
git commit -m "feat: add round question builder and scoring"
```

---

### Task 6: Data build script

**Files:**
- Create: `scripts/build-data.mjs`, `public/data/n5.json` … `n1.json` (generated)

- [ ] **Step 1: Write scripts/build-data.mjs**

```js
// Builds public/data/n{5..1}.json from OpenJLPT + JMdict-common + kaikki zh-Wiktionary.
// Sources are downloaded once into .cache/ (gitignored). Re-run to refresh.
import { createReadStream, existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { createWriteStream } from "node:fs";
import { execSync } from "node:child_process";
import * as OpenCC from "opencc-js";

const ROOT = new URL("../", import.meta.url);
const CACHE = new URL(".cache/", ROOT);
const OUT = new URL("public/data/", ROOT);
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
const OPENJLPT = "https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab/";
const JMDICT_ZIP =
  "https://github.com/scriptin/jmdict-simplified/releases/download/3.6.2%2B20261005200550/jmdict-eng-common-3.6.2%2B20261005200550.json.zip";
const KAIKKI = [
  ["kaikki-ja-trad.jsonl", "https://kaikki.org/zhwiktionary/%E6%97%A5%E8%AA%9E/kaikki.org-dictionary-%E6%97%A5%E8%AA%9E.jsonl", false],
  ["kaikki-ja-simp.jsonl", "https://kaikki.org/zhwiktionary/%E6%97%A5%E8%AF%AD/kaikki.org-dictionary-%E6%97%A5%E8%AF%AD.jsonl", true],
];

async function download(name, url) {
  const dest = new URL(name, CACHE);
  if (existsSync(dest)) return dest;
  console.log("downloading", name);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return dest;
}

const HAS_KANJI = /[一-鿿㐀-䶿々]/;
const ALL_KATAKANA = /^[゠-ヿー]+$/;

// 1. OpenJLPT
const openjlpt = {};
for (const lv of LEVELS) {
  const f = await download(`openjlpt-${lv}.json`, `${OPENJLPT}${lv}.json`);
  openjlpt[lv] = JSON.parse(readFileSync(f, "utf8"));
}

// 2. JMdict common → uk flag + readings by jmdict id
const zip = await download("jmdict-eng-common.zip", JMDICT_ZIP);
const jsonName = "jmdict-eng-common-3.6.2.json";
if (!existsSync(new URL(jsonName, CACHE))) {
  execSync(`unzip -o -q "${zip.pathname.replace(/^\/([A-Za-z]:)/, "$1")}" -d "${CACHE.pathname.replace(/^\/([A-Za-z]:)/, "$1")}"`);
}
const jmdict = JSON.parse(readFileSync(new URL(jsonName, CACHE), "utf8"));
const byJmdictId = new Map();
for (const w of jmdict.words) {
  const uk = w.sense[0]?.misc.includes("uk") ?? false;
  const kana = w.kana.filter((k) => !k.tags.some((t) => ["ok", "rk", "sk"].includes(t))).map((k) => k.text);
  byJmdictId.set(Number(w.id), { uk, kana });
}

// 3. kaikki → Chinese gloss by word, and by word+reading
const s2twp = OpenCC.Converter({ from: "cn", to: "twp" });
const zhByWord = new Map(); // word → [{reading, gloss}]
const needed = new Set();
for (const lv of LEVELS) for (const e of openjlpt[lv]) { needed.add(e.word); needed.add(e.reading); }

function cleanGloss(g) {
  return g.replace(/\s+/g, " ").replace(/^[（(].*?[)）]\s*/, "").trim();
}
for (const [name, url, simplified] of KAIKKI) {
  const f = await download(name, url);
  const rl = createInterface({ input: createReadStream(f, "utf8"), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    const i = line.indexOf('"word": "');
    const j = line.indexOf('"', i + 9);
    const word = line.slice(i + 9, j);
    if (!needed.has(word)) continue;
    const e = JSON.parse(line);
    const glosses = [];
    for (const s of e.senses ?? []) {
      for (const g of s.glosses ?? []) {
        const c = cleanGloss(simplified ? s2twp(g) : g);
        if (c && !glosses.includes(c)) glosses.push(c);
        if (glosses.length >= 3) break;
      }
      if (glosses.length >= 3) break;
    }
    if (glosses.length === 0) continue;
    const reading = (e.sounds ?? []).find((s) => s.other)?.other ?? null;
    const list = zhByWord.get(word) ?? [];
    list.push({ reading, gloss: glosses.join("；"), simplified });
    zhByWord.set(word, list);
  }
}

function pickZh(word, reading) {
  const list = zhByWord.get(word) ?? zhByWord.get(reading) ?? [];
  const norm = (s) => (s ?? "").replace(/ー/g, "");
  const exact = list.find((x) => !x.simplified && norm(x.reading) === norm(reading))
    ?? list.find((x) => norm(x.reading) === norm(reading))
    ?? list.find((x) => !x.simplified)
    ?? list[0];
  return exact?.gloss ?? null;
}

// 4. merge
let zhCount = 0, total = 0;
for (const lv of LEVELS) {
  const words = openjlpt[lv].map((e) => {
    const jm = byJmdictId.get(e.jmdict_id);
    const hasKanji = HAS_KANJI.test(e.word);
    const kana = [e.reading, ...(jm?.kana ?? [])].filter((k, i, a) => a.indexOf(k) === i);
    const glossEn = e.meanings.slice(0, 3).join("; ");
    const zh = pickZh(e.word, e.reading);
    if (zh) zhCount++;
    total++;
    return {
      id: e.id,
      kanji: hasKanji ? e.word : null,
      kana,
      uk: jm?.uk ?? false,
      katakana: ALL_KATAKANA.test(e.word),
      gloss: zh ?? glossEn,
      glossLang: zh ? "zh" : "en",
      glossEn,
      level: lv.toUpperCase(),
    };
  });
  writeFileSync(new URL(`${lv}.json`, OUT), JSON.stringify(words));
  console.log(lv, words.length, "words");
}
console.log(`Chinese gloss coverage: ${zhCount}/${total} (${((100 * zhCount) / total).toFixed(1)}%)`);
```

- [ ] **Step 2: Run the build**

Run: `npm run build:data`
Expected: five lines like `n5 674 words`, and a coverage line. Spot-check: `node -e "const d=require('./public/data/n5.json');console.log(d.filter(w=>w.glossLang==='zh').slice(0,5))"` shows Traditional-Chinese glosses.

- [ ] **Step 3: Sanity-check uk and katakana flags**

Run: `node -e "const d=require('./public/data/n5.json');console.log(d.filter(w=>w.uk).length,'uk;',d.filter(w=>w.katakana).length,'katakana;',d.filter(w=>w.kanji===null).length,'no kanji')"`
Expected: non-zero counts for each; katakana words such as コーヒー have `katakana: true`.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-data.mjs public/data
git commit -m "feat: add data build script and generated JLPT word pools"
```

---

### Task 7: Data loader and UI

**Files:**
- Create: `src/data.ts`, `src/ui.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Write src/data.ts**

```ts
import type { Level, Word } from "./types";

const cache = new Map<Level, Promise<Word[]>>();

function fetchLevel(level: Level): Promise<Word[]> {
  let p = cache.get(level);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/${level.toLowerCase()}.json`).then((r) => {
      if (!r.ok) throw new Error(`load ${level}: ${r.status}`);
      return r.json() as Promise<Word[]>;
    });
    cache.set(level, p);
  }
  return p;
}

export async function loadWords(levels: readonly Level[]): Promise<Word[]> {
  const lists = await Promise.all(levels.map(fetchLevel));
  return lists.flat();
}
```

- [ ] **Step 2: Write src/ui.ts**

```ts
import { bind as bindKana } from "wanakana";
import { isReadingCorrect } from "./answer";
import { loadWords } from "./data";
import { revealKey, verifyKey } from "./keys";
import { LEVELS, filterSelectable, nextLevelAfter, unlockedLevels } from "./levels";
import { Round, ROUND_SIZE, buildQuestions, type Question } from "./round";
import { pickRound } from "./sampler";
import type { Level, Mode } from "./types";

export interface AppState {
  highest: Level | null;      // highest level unlocked by key this visit
  selected: Level[];
  mode: Mode;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children);
  return e;
}
function ja(text: string): HTMLElement { return el("span", { lang: "ja" }, text); }

export function renderStart(root: HTMLElement, state: AppState, onStart: () => void): void {
  root.replaceChildren();
  const unlocked = unlockedLevels(state.highest);
  state.selected = filterSelectable(state.selected, unlocked);

  const levelBox = el("fieldset", {}, el("legend", {}, "等級範圍"));
  for (const lv of unlocked) {
    const cb = el("input", { type: "checkbox", value: lv }) as HTMLInputElement;
    cb.checked = state.selected.includes(lv);
    cb.addEventListener("change", () => {
      const chosen = Array.from(levelBox.querySelectorAll<HTMLInputElement>("input:checked")).map((i) => i.value as Level);
      state.selected = chosen.length ? LEVELS.filter((l) => chosen.includes(l)) : ["N5"];
      if (!chosen.length) cb.checked = true;
    });
    levelBox.append(el("label", {}, cb, " " + lv));
  }

  const modeBox = el("fieldset", {}, el("legend", {}, "練習模式"));
  for (const [m, label] of [["meaning", "意思（看字選釋義）"], ["reading", "讀音（看漢字打假名）"]] as const) {
    const rb = el("input", { type: "radio", name: "mode", value: m }) as HTMLInputElement;
    rb.checked = state.mode === m;
    rb.addEventListener("change", () => { state.mode = m; });
    modeBox.append(el("label", {}, rb, " " + label));
  }

  const start = el("button", { class: "primary" }, `開始（${ROUND_SIZE} 題）`);
  start.addEventListener("click", onStart);

  const keyInput = el("input", { type: "text", maxlength: "4", placeholder: "金鑰", autocomplete: "off" }) as HTMLInputElement;
  const keyMsg = el("span", { class: "muted" });
  const keyBtn = el("button", {}, "解鎖");
  keyBtn.addEventListener("click", async () => {
    const lv = await verifyKey(keyInput.value);
    if (!lv) { keyMsg.textContent = " 無效"; keyMsg.className = "error"; return; }
    const cur = state.highest ? LEVELS.indexOf(state.highest) : 0;
    if (LEVELS.indexOf(lv) > cur) state.highest = lv;
    renderStart(root, state, onStart);
  });
  keyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") keyBtn.click(); });
  const keyRow = el("div", { class: "key-row" }, "輸入金鑰解鎖更高等級： ", keyInput, " ", keyBtn, keyMsg);

  root.append(el("h1", {}, "JPword"), levelBox, modeBox, start, keyRow);
}

export async function runRound(root: HTMLElement, state: AppState, onDone: () => void): Promise<void> {
  root.replaceChildren(el("p", { class: "muted" }, "載入中…"));
  let pool;
  try {
    pool = await loadWords(state.selected);
  } catch {
    root.replaceChildren(el("p", { class: "error" }, "資料載入失敗，請重新整理。"));
    return;
  }
  const words = pickRound(pool, ROUND_SIZE, Math.random);
  const round = new Round(buildQuestions(words, pool, state.mode, Math.random));
  if (round.size < ROUND_SIZE) {
    root.append(el("p", { class: "muted" }, `此範圍只有 ${round.size} 個字，本回縮減為 ${round.size} 題。`));
  }
  const step = () => {
    const q = round.current;
    if (!q) { renderResult(root, state, round, onDone); return; }
    renderQuestion(root, round, q, (ok) => { round.answer(ok); step(); });
  };
  step();
}

function renderQuestion(root: HTMLElement, round: Round, q: Question, next: (ok: boolean) => void): void {
  root.replaceChildren();
  root.append(el("div", { class: "progress" }, `第 ${round.index + 1} 題 / ${round.size}`));

  const wordEl = el("div", { class: "word" });
  if (q.kind === "meaning" && q.prompt.kanji) {
    wordEl.append(el("ruby", { lang: "ja" }, q.prompt.kanji, el("rt", {}, q.prompt.kana)));
  } else if (q.kind === "meaning") {
    wordEl.append(ja(q.prompt.kana));
  } else {
    wordEl.append(ja(q.prompt.kanji));
  }
  root.append(wordEl);

  const reveal = el("div", { class: "reveal" });
  const nextBtn = el("button", { class: "primary" }, "下一題");
  let answered = false;
  const finish = (ok: boolean) => {
    if (answered) return;
    answered = true;
    reveal.replaceChildren(
      el("div", {}, ok ? "✓ 答對" : "✗ 答錯"),
      el("div", { class: "big" }, q.word.kanji ? el("ruby", { lang: "ja" }, q.word.kanji, el("rt", {}, q.word.kana[0] ?? "")) : ja(q.word.kana[0] ?? "")),
      el("div", {}, q.word.gloss, q.word.glossLang === "zh" ? el("span", { class: "muted" }, `　${q.word.glossEn}`) : ""),
      el("div", { class: "muted" }, q.word.kana.length > 1 ? `其他讀音：${q.word.kana.slice(1).join("、")}` : ""),
      nextBtn,
    );
    root.append(reveal);
    nextBtn.focus();
    nextBtn.addEventListener("click", () => next(ok));
  };

  if (q.kind === "meaning") {
    const choices = el("div", { class: "choices" });
    q.choices.forEach((c, i) => {
      const b = el("button", {}, `${i + 1}. ${c}`);
      b.addEventListener("click", () => {
        const ok = c === q.word.gloss;
        b.classList.add(ok ? "correct" : "wrong");
        choices.querySelectorAll("button").forEach((x) => { x.disabled = true; if (x.textContent?.slice(3) === q.word.gloss) x.classList.add("correct"); });
        finish(ok);
      });
      choices.append(b);
    });
    root.append(choices);
    const onKey = (e: KeyboardEvent) => {
      if (!answered && e.key >= "1" && e.key <= "4") (choices.children[Number(e.key) - 1] as HTMLButtonElement | undefined)?.click();
      else if (answered && e.key === "Enter") { document.removeEventListener("keydown", onKey); nextBtn.click(); }
    };
    document.addEventListener("keydown", onKey);
    nextBtn.addEventListener("click", () => document.removeEventListener("keydown", onKey));
  } else {
    const input = el("input", { type: "text", lang: "ja", placeholder: "輸入讀音（羅馬字會自動轉成平假名）", autocomplete: "off" }) as HTMLInputElement;
    bindKana(input, { IMEMode: "toHiragana" });
    const submit = el("button", {}, "送出");
    const go = () => {
      if (answered) return;
      input.disabled = true; submit.disabled = true;
      finish(isReadingCorrect(input.value, q.word.kana));
    };
    submit.addEventListener("click", go);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); if (answered) nextBtn.click(); else go(); } });
    root.append(el("div", {}, input), el("div", { style: "margin-top:12px" }, submit));
    input.focus();
  }
}

function renderResult(root: HTMLElement, state: AppState, round: Round, onDone: () => void): void {
  root.replaceChildren();
  const box = el("div", { class: "result" });
  box.append(el("div", { class: "score" }, `${round.correct} / ${round.size}`));
  const next = nextLevelAfter(state.selected);
  if (round.passed && next) {
    const key = revealKey(next);
    box.append(el("p", {}, `過關！通往 ${next} 的金鑰：`), el("div", { class: "key" }, key ?? ""), el("p", { class: "muted" }, "記下來，下次打開時輸入即可解鎖。"));
  } else if (round.passed) {
    box.append(el("p", {}, "過關！你已經在最高等級。"));
  } else {
    box.append(el("p", { class: "muted" }, `答對 ${round.threshold} 題以上即可取得下一級金鑰。`));
  }
  const again = el("button", { class: "primary" }, "再來一回");
  again.addEventListener("click", onDone);
  const home = el("button", {}, "回首頁");
  home.addEventListener("click", () => { state.highest = state.highest; onDone(); });
  box.append(el("div", { style: "margin-top:24px;display:flex;gap:12px;justify-content:center" }, again, home));
  root.append(box);
}
```

- [ ] **Step 3: Write src/main.ts**

```ts
import { renderStart, runRound, type AppState } from "./ui";
import { LEVELS } from "./levels";
import type { Level, Mode } from "./types";

const root = document.getElementById("app")!;
const params = new URLSearchParams(location.search);
const requested = (params.get("level") ?? "N5").split(",").filter((l): l is Level => (LEVELS as string[]).includes(l));
const mode: Mode = params.get("mode") === "reading" ? "reading" : "meaning";

const state: AppState = { highest: null, selected: requested.length ? requested : ["N5"], mode };

function home(): void {
  renderStart(root, state, () => { void runRound(root, state, home); });
}
home();
```

- [ ] **Step 4: Run dev server and smoke-test manually**

Run: `npm run dev` and open the printed URL.
Check: start screen shows only N5; a meaning round shows ruby over kanji; a reading round shows kanji only and converts `au` → `あう`; wrong answers reveal kanji + kana + gloss; result shows `N / 10`; 9+ reveals a key; entering the key on the start screen shows N4.

- [ ] **Step 5: Type-check and build**

Run: `npm run build`
Expected: no errors, `dist/data/n5.json` present.

- [ ] **Step 6: Commit**

```bash
git add src/data.ts src/ui.ts src/main.ts
git commit -m "feat: add single-page quiz UI"
```

---

### Task 8: GitHub Pages workflow

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Write .github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Write README.md**

```markdown
# JPword

日文單字練習網站（GitHub Pages 靜態站）。每回從所選 JLPT 等級隨機抽 10 題，答對 9 題以上取得下一級金鑰。不儲存任何進度。

## 開發

```bash
npm install
npm run dev        # 本機預覽
npm test           # 單元測試
npm run build      # 產出 dist/
npm run build:data # 重新從 OpenJLPT / JMdict / Wiktionary 產生 public/data
```

## 部署

推上 `main` 後由 GitHub Actions 自動部署。首次需在 repo Settings → Pages 將 Source 設為 **GitHub Actions**。

## 資料來源與授權

資料為 CC BY-SA 4.0 衍生作品，來源：OpenJLPT（含 EDRDG JMdict／KANJIDIC2、Jonathan Waller JLPT 清單、Tatoeba）、kaikki.org 的中文維基詞典日語抽取檔。設計規格見 `docs/superpowers/specs/`，研究報告見 `reports/`。
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy to GitHub Pages"
git push origin main
```

- [ ] **Step 4: Verify**

Check the Actions run succeeds. If Pages is not enabled, the deploy job fails with a message to set Source to GitHub Actions — tell the user.

---

## Self-review

- Spec coverage: levels/keys (Task 4), two modes with kana/katakana fallback (Task 5), ruby on meaning prompt only (Task 7), no persistence (no storage code anywhere), URL params (Task 7 main.ts), data sources + attribution (Tasks 6, 1 footer), font/lang handling (Task 1 CSS, Task 7 `lang="ja"`), error handling for load failure and short pools (Task 7), tests for answer/sampler/levels/round (Tasks 2–5), deploy (Task 8).
- Types: `Question` lives in `round.ts` and is imported by `ui.ts`; `Word.kana` is `string[]`; `Level`/`Mode` from `types.ts` everywhere.
