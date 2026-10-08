// Builds public/data/n{5..1}.json from OpenJLPT + JMdict-common + kaikki zh-Wiktionary.
// Sources are downloaded once into .cache/ (gitignored). Delete .cache to refresh.
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import * as OpenCC from "opencc-js";

const ROOT = new URL("../", import.meta.url);
const CACHE = new URL(".cache/", ROOT);
const OUT = new URL("public/data/", ROOT);
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
const OPENJLPT = "https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab/";
const JMDICT_VERSION = "3.6.2+20261005200550";
const JMDICT_ZIP = `https://github.com/scriptin/jmdict-simplified/releases/download/${encodeURIComponent(JMDICT_VERSION)}/jmdict-eng-common-${encodeURIComponent(JMDICT_VERSION)}.json.zip`;
const JMDICT_JSON = "jmdict-eng-common-3.6.2.json";
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

// 2. JMdict common → uk flag + extra readings, by jmdict id
const zip = await download("jmdict-eng-common.zip", JMDICT_ZIP);
if (!existsSync(new URL(JMDICT_JSON, CACHE))) {
  execFileSync("unzip", ["-o", "-q", fileURLToPath(zip), "-d", fileURLToPath(CACHE)]);
}
const jmdict = JSON.parse(readFileSync(new URL(JMDICT_JSON, CACHE), "utf8"));
const byJmdictId = new Map();
for (const w of jmdict.words) {
  const uk = w.sense[0]?.misc.includes("uk") ?? false;
  const kana = w.kana.filter((k) => !k.tags.some((t) => ["ok", "rk", "sk"].includes(t))).map((k) => k.text);
  byJmdictId.set(Number(w.id), { uk, kana });
}

// 3. kaikki → Chinese glosses keyed by headword (kanji or kana)
const s2twp = OpenCC.Converter({ from: "cn", to: "twp" });
const zhByWord = new Map(); // headword → [{readings, senses: [{marker, glosses}], simplified}]
const needed = new Set();
const poolByReading = new Map(); // reading → number of pool words with that reading (homophone check)
for (const lv of LEVELS) for (const e of openjlpt[lv]) {
  needed.add(e.word); needed.add(e.reading);
  poolByReading.set(e.reading, (poolByReading.get(e.reading) ?? 0) + 1);
}

const HAS_KANA = /[぀-ヿ]/;
const MARKER = /^【([^】]+)】\s*/;
function cleanGloss(g) {
  const c = s2twp(g)
    .replace(/\s+/g, " ")
    .replace(/【[^】]*】/g, "")
    .replace(/\s*[（(][^（）()]*[A-Za-zāīūēō][^（）()]*[)）]/g, "") // parentheticals with romanisation, e.g. (nyōbō kotoba，“女性用語”)
    .replace(/^[（(\[［〔][^）)\]］〕]*[)）\]］〕]\s*/, "") // leading usage note
    .replace(/[。．]+$/g, "")
    .replace(/[。．]\s*/g, "，")
    .split("/").filter((part, i, a) => a.indexOf(part) === i).join("/") // s2twp can merge 出租車/的士 into 計程車/計程車
    .trim();
  if (!c || c.length > 40 || HAS_KANA.test(c) || /[A-Za-z]/.test(c)) return null; // the quiz must show no English
  return c;
}
for (const [name, url, simplified] of KAIKKI) {
  const f = await download(name, url);
  const rl = createInterface({ input: createReadStream(f, "utf8"), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.startsWith('{"word": "')) continue;
    const j = line.indexOf('"', 10);
    const word = line.slice(10, j);
    if (!needed.has(word)) continue;
    const e = JSON.parse(line);
    const senses = [];
    for (const s of e.senses ?? []) {
      let marker = null;
      const glosses = [];
      for (const g of s.glosses ?? []) {
        if (typeof g !== "string") continue;
        const m = g.match(MARKER);
        if (m) marker = s2twp(m[1]);
        const c = cleanGloss(g);
        if (c && !glosses.includes(c)) glosses.push(c);
      }
      if (glosses.length) senses.push({ marker, glosses });
    }
    if (senses.length === 0) continue;
    const readings = (e.sounds ?? []).map((x) => x.other).filter(Boolean);
    const list = zhByWord.get(word) ?? [];
    list.push({ readings, senses, simplified });
    zhByWord.set(word, list);
  }
}

// Wiktionary writes pronunciations phonetically (えいご → えーご, おとうさん → おとーさん).
// Reduce both spellings to a common form: drop ー and vowel letters that merely lengthen the previous mora.
const VOWEL_OF = {};
for (const [v, row] of [
  ["あ", "あかさたなはまやらわがざだばぱゃ"],
  ["い", "いきしちにひみりぎじぢびぴ"],
  ["う", "うくすつぬふむゆるぐずづぶぷゅ"],
  ["え", "えけせてねへめれげぜでべぺ"],
  ["お", "おこそとのほもよろをごぞどぼぽょ"],
]) for (const ch of row) VOWEL_OF[ch] = v;
function phonetic(s) {
  let out = "";
  for (const ch of s ?? "") {
    if (ch === "ー") continue;
    const prev = VOWEL_OF[out[out.length - 1]];
    if (prev && (ch === prev || (ch === "い" && prev === "え") || (ch === "う" && prev === "お"))) continue;
    out += ch;
  }
  return out;
}

function joinSenses(senses) {
  const out = [];
  for (const s of senses) for (const g of s.glosses) {
    if (!out.includes(g)) out.push(g);
    if (out.length >= 3) return out.join("；");
  }
  return out.length ? out.join("；") : null;
}

/** Entry under the word's own headword: prefer Traditional and a matching reading; never a mismatching reading. */
function fromHeadword(word, reading, singleKanji) {
  const list = zhByWord.get(word) ?? [];
  const target = phonetic(reading);
  const matches = (x) => x.readings.some((r) => phonetic(r) === target);
  const noReading = (x) => x.readings.length === 0 && !singleKanji; // 相/あい vs 相/そう cannot be told apart
  const best =
    list.find((x) => !x.simplified && matches(x)) ?? list.find(matches) ??
    list.find((x) => !x.simplified && noReading(x)) ?? list.find(noReading);
  return best ? joinSenses(best.senses.map((s) => ({ ...s }))) : null;
}

/** Entry under the kana headword: senses marked 【word】, or whose gloss contains the word's kanji, or unambiguous homophone. */
function fromKanaEntry(word, reading) {
  const list = zhByWord.get(reading) ?? [];
  const kanjiChars = Array.from(word).filter((c) => HAS_KANJI.test(c));
  for (const x of [...list.filter((e) => !e.simplified), ...list.filter((e) => e.simplified)]) {
    const marked = x.senses.filter((s) => s.marker === word);
    if (marked.length) return joinSenses(marked);
    const mentions = x.senses.filter((s) => !s.marker && s.glosses.some((g) => kanjiChars.some((c) => g.includes(c))));
    if (mentions.length) return joinSenses(mentions);
    const hasMarkers = x.senses.some((s) => s.marker);
    if (!hasMarkers && poolByReading.get(reading) === 1) return joinSenses(x.senses);
  }
  return null;
}

function pickZh(word, reading) {
  const hasKanji = HAS_KANJI.test(word);
  if (!hasKanji) {
    const list = zhByWord.get(word) ?? [];
    const best = list.find((x) => !x.simplified) ?? list[0];
    if (!best) return null;
    const plain = best.senses.filter((s) => !s.marker);
    return joinSenses(plain.length ? plain : best.senses);
  }
  const singleKanji = Array.from(word).filter((c) => HAS_KANJI.test(c)).length === 1 && word.length === 1;
  return fromHeadword(word, reading, singleKanji) ?? fromKanaEntry(word, reading);
}

// 4. merge and write. data/zh-overrides.json (id → 繁體中文 gloss) fills words that
// Wiktionary lacks; it was produced by AI translation and reviewed by hand.
const overridesPath = new URL("data/zh-overrides.json", ROOT);
const overrides = existsSync(overridesPath) ? JSON.parse(readFileSync(overridesPath, "utf8")) : {};
let zhCount = 0;
let overrideCount = 0;
let total = 0;
for (const lv of LEVELS) {
  const words = openjlpt[lv].map((e) => {
    const jm = byJmdictId.get(e.jmdict_id);
    const hasKanji = HAS_KANJI.test(e.word);
    const kana = [e.reading, ...(jm?.kana ?? [])].filter((k, i, a) => a.indexOf(k) === i);
    const glossEn = e.meanings.slice(0, 3).join("; ");
    let zh = pickZh(e.word, e.reading);
    if (zh === e.word) zh = null; // 同形同義語: a gloss identical to the headword explains nothing
    if (!zh && overrides[e.id]) { zh = overrides[e.id]; overrideCount++; }
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
console.log(`Chinese gloss coverage: ${zhCount}/${total} (${((100 * zhCount) / total).toFixed(1)}%), ${overrideCount} from zh-overrides.json`);
