import { bind as bindKana } from "wanakana";
import { isReadingCorrect } from "./answer";
import { loadWords } from "./data";
import { revealKey, verifyKey } from "./keys";
import { LEVELS, filterSelectable, nextLevelAfter, unlockedLevels } from "./levels";
import { Round, ROUND_SIZE, buildQuestions, type Question } from "./round";
import { pickRound } from "./sampler";
import type { Level, Mode } from "./types";

export interface AppState {
  /** highest level unlocked by a key during this visit; null = only N5 */
  highest: Level | null;
  selected: Level[];
  mode: Mode;
}

type Child = Node | string;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children);
  return e;
}

function ja(text: string): HTMLElement {
  return el("span", { lang: "ja" }, text);
}

function rubyWord(kanji: string, kana: string): HTMLElement {
  return el("ruby", { lang: "ja" }, kanji, el("rt", {}, kana));
}

// ---------- start screen ----------

export function renderStart(root: HTMLElement, state: AppState, onStart: () => void): void {
  root.replaceChildren();
  const unlocked = unlockedLevels(state.highest);
  state.selected = filterSelectable(state.selected, unlocked);

  const levelBox = el("fieldset", {}, el("legend", {}, "等級範圍"));
  for (const lv of unlocked) {
    const cb = el("input", { type: "checkbox", value: lv });
    cb.checked = state.selected.includes(lv);
    cb.addEventListener("change", () => {
      const chosen = Array.from(levelBox.querySelectorAll<HTMLInputElement>("input:checked")).map((i) => i.value as Level);
      if (chosen.length === 0) {
        cb.checked = true; // keep at least one level
        return;
      }
      state.selected = LEVELS.filter((l) => chosen.includes(l));
    });
    levelBox.append(el("label", {}, cb, ` ${lv}`));
  }

  const modeBox = el("fieldset", {}, el("legend", {}, "練習模式"));
  const modes: ReadonlyArray<[Mode, string]> = [
    ["meaning", "意思（看字選釋義）"],
    ["reading", "讀音（看漢字打假名）"],
  ];
  for (const [m, label] of modes) {
    const rb = el("input", { type: "radio", name: "mode", value: m });
    rb.checked = state.mode === m;
    rb.addEventListener("change", () => { state.mode = m; });
    modeBox.append(el("label", {}, rb, ` ${label}`));
  }

  const start = el("button", { class: "primary" }, `開始（${ROUND_SIZE} 題）`);
  start.addEventListener("click", onStart);

  const keyInput = el("input", { type: "text", maxlength: "4", placeholder: "金鑰", autocomplete: "off", spellcheck: "false" });
  const keyMsg = el("span", { class: "muted" });
  const keyBtn = el("button", {}, "解鎖");
  keyBtn.addEventListener("click", async () => {
    const lv = await verifyKey(keyInput.value);
    if (!lv) {
      keyMsg.textContent = " 無效";
      keyMsg.className = "error";
      return;
    }
    const cur = state.highest ? LEVELS.indexOf(state.highest) : 0;
    if (LEVELS.indexOf(lv) > cur) state.highest = lv;
    state.selected = LEVELS.slice(0, LEVELS.indexOf(lv) + 1).filter((l) => state.selected.includes(l) || l === lv);
    renderStart(root, state, onStart);
  });
  keyInput.addEventListener("keydown", (e) => { if (e.key === "Enter") keyBtn.click(); });
  const keyRow = el("div", { class: "key-row" }, "輸入金鑰解鎖更高等級： ", keyInput, " ", keyBtn, keyMsg);

  root.append(el("h1", {}, "JPword"), levelBox, modeBox, start, keyRow);
}

// ---------- round ----------

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
  const notice = round.size < ROUND_SIZE ? `此範圍只有 ${round.size} 個字，本回縮減為 ${round.size} 題。` : null;

  const step = (): void => {
    const q = round.current;
    if (!q) {
      renderResult(root, state, round, onDone);
      return;
    }
    renderQuestion(root, round, q, notice, (ok) => {
      round.answer(ok);
      step();
    });
  };
  step();
}

function renderQuestion(root: HTMLElement, round: Round, q: Question, notice: string | null, next: (ok: boolean) => void): void {
  root.replaceChildren();
  if (notice) root.append(el("p", { class: "muted" }, notice));
  root.append(el("div", { class: "progress" }, `第 ${round.index + 1} 題 / ${round.size}`));

  const wordEl = el("div", { class: "word" });
  if (q.kind === "meaning") {
    wordEl.append(q.prompt.kanji ? rubyWord(q.prompt.kanji, q.prompt.kana) : ja(q.prompt.kana));
  } else {
    wordEl.append(ja(q.prompt.kanji));
  }
  root.append(wordEl);

  const reveal = el("div", { class: "reveal" });
  const nextBtn = el("button", { class: "primary" }, "下一題");
  let answered = false;
  const cleanups: Array<() => void> = [];
  const goNext = (ok: boolean): void => {
    for (const c of cleanups) c();
    next(ok);
  };

  const finish = (ok: boolean): void => {
    if (answered) return;
    answered = true;
    const w = q.word;
    const primaryKana = w.kana[0] ?? "";
    const glossLine = el("div", {}, w.gloss);
    reveal.replaceChildren(
      el("div", { class: ok ? "ok" : "error" }, ok ? "✓ 答對" : "✗ 答錯"),
      el("div", { class: "big" }, w.kanji ? rubyWord(w.kanji, primaryKana) : ja(primaryKana)),
      glossLine,
    );
    if (w.kana.length > 1) reveal.append(el("div", { class: "muted" }, "其他讀音：", ja(w.kana.slice(1).join("、"))));
    reveal.append(el("div", { style: "margin-top:12px" }, nextBtn));
    root.append(reveal);
    nextBtn.addEventListener("click", () => goNext(ok));
    nextBtn.focus();
  };

  if (q.kind === "meaning") {
    const choices = el("div", { class: "choices" });
    const buttons = q.choices.map((c, i) => {
      const b = el("button", {}, `${i + 1}. ${c}`);
      b.addEventListener("click", () => {
        if (answered) return;
        const ok = c === q.word.gloss;
        b.classList.add(ok ? "correct" : "wrong");
        buttons.forEach((x, j) => {
          x.disabled = true;
          if (q.choices[j] === q.word.gloss) x.classList.add("correct");
        });
        finish(ok);
      });
      choices.append(b);
      return b;
    });
    root.append(choices);
    const onKey = (e: KeyboardEvent): void => {
      if (!answered && e.key >= "1" && e.key <= "4") buttons[Number(e.key) - 1]?.click();
      else if (answered && e.key === "Enter") nextBtn.click();
    };
    document.addEventListener("keydown", onKey);
    cleanups.push(() => document.removeEventListener("keydown", onKey));
  } else {
    const input = el("input", { type: "text", lang: "ja", placeholder: "輸入讀音（羅馬字會自動轉成平假名）", autocomplete: "off", spellcheck: "false" });
    bindKana(input, { IMEMode: "toHiragana" });
    const submit = el("button", {}, "送出");
    const go = (): void => {
      if (answered) return;
      input.disabled = true;
      submit.disabled = true;
      finish(isReadingCorrect(input.value, q.word.kana));
    };
    submit.addEventListener("click", go);
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (answered) nextBtn.click();
      else go();
    });
    root.append(el("div", {}, input), el("div", { style: "margin-top:12px" }, submit));
    input.focus();
  }
}

// ---------- result ----------

function renderResult(root: HTMLElement, state: AppState, round: Round, onDone: () => void): void {
  root.replaceChildren();
  const box = el("div", { class: "result" });
  box.append(el("div", { class: "score" }, `${round.correct} / ${round.size}`));
  const next = nextLevelAfter(state.selected);
  if (round.passed && next) {
    const key = revealKey(next);
    box.append(
      el("p", {}, `過關！通往 ${next} 的金鑰：`),
      el("div", { class: "key" }, key ?? ""),
      el("p", { class: "muted" }, "記下來，下次打開時在首頁輸入即可解鎖。"),
    );
  } else if (round.passed) {
    box.append(el("p", {}, "過關！你已經在最高等級。"));
  } else {
    box.append(el("p", { class: "muted" }, `答對 ${round.threshold} 題以上即可取得下一級金鑰。`));
  }
  const again = el("button", { class: "primary" }, "再來一回");
  again.addEventListener("click", onDone);
  box.append(el("div", { style: "margin-top:24px" }, again));
  root.append(box);
}
