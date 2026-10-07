# JPword 設計規格

日期：2026-10-07
狀態：使用者已核准

## 目的

使用者（母語為台灣繁體中文）要以一個放在 GitHub Pages 上的靜態網站累積日文單字量，最終目標是能與日本人自然對談。研究結論見 `reports/日文單字來源與習得研究.md`。

## 核心決策（由使用者定案）

- 純隨機抽題，不做間隔重複排程。
- 不存任何進度到硬碟（無 localStorage、無帳號），重新整理即全新一回。借給朋友玩不會互相污染。
- 每回 10 題，答對 9 題以上即「過關」，過關顯示下一級的金鑰。
- 等級 N5 → N1 以金鑰解鎖，金鑰固定不變、四位英文字母、累積式。
- 沒有音檔、音調、背景音樂、例句、圖片、動畫。
- 有漢字就要有平假名（意思模式題目面同時顯示；讀音模式則在揭曉面顯示）。

## 學習流程

1. 打開頁面：只看得到 N5 可選。畫面上有一個不起眼的「輸入金鑰」欄位。
2. 選擇等級範圍（已解鎖等級中可單選或複選，預設只勾 N5）與練習模式。
3. 按「開始」：從所選等級的單字池中純隨機抽 10 題，不重複。
4. 每題作答後立刻揭曉：
   - 答對：顯示打勾，按鍵或點擊前進。
   - 答錯：顯示漢字、平假名、釋義三者，按鍵或點擊前進。
5. 10 題結束顯示「N / 10」。若 N ≥ 9 且目前所選的最高等級不是 N1，顯示通往下一級的金鑰。
6. 「再來一回」回到第 2 步，保留等級與模式選擇（僅存在記憶體）。

## 金鑰規則

- 五個等級 N5、N4、N3、N2、N1。N5 永遠解鎖。
- 金鑰 K4 解鎖 N4；K3 解鎖 N4+N3；K2 解鎖 N4+N3+N2；K1 解鎖全部。
- 過關時給的金鑰：取「本回所選等級中最高者」的下一級金鑰。例如選 N5 過關給 K4；選 N5+N4 過關給 K3。
- 金鑰由 `scripts/gen-keys.mjs` 以亂數產生一次，寫入 `src/keys.ts`，儲存形式為 SHA-256 雜湊（驗證用）加上 XOR 混淆字串（顯示用）。靜態網站無法真正加密，此為刻意的輕度混淆。對話中不印出金鑰。
- 輸入金鑰不分大小寫；輸入錯誤顯示「無效」，不提示任何資訊。
- 金鑰不會被儲存，每次打開都要重新輸入。

## 練習模式

### 意思模式（預設）

- 題目面：顯示單字。有漢字形的詞顯示漢字，上方以 `<ruby>` 顯示平假名；習慣寫假名（`uk`）的詞與片假名詞只顯示假名。
- 作答：四選一，選釋義。三個干擾項從同一回所選等級池中隨機抽取其他詞的釋義，且不得與正解釋義文字相同。
- 鍵盤：數字鍵 1–4 選答，Enter 前進。

### 讀音模式

- 有漢字形的詞：題目面只顯示漢字，不顯示振假名。作答為輸入框，使用 wanakana 綁定，羅馬字即時轉平假名。比對規則：雙方皆以 `toHiragana` 正規化，去除空白；詞有多個讀音時任一讀音符合即算對。
- `uk` 詞與片假名詞：退回四選一意思題（同意思模式）。
- 鍵盤：Enter 送出答案，再按 Enter 前進。

## 單字資料

### 來源

- JMdict，經 scriptin/jmdict-simplified 的 `jmdict-eng` JSON（CC BY-SA 4.0，EDRDG 授權條件）。
- OpenJLPT（evanclan/OpenJLPT，CC BY-SA 4.0）提供 N5–N1 等級清單。
- 中文釋義：kaikki.org 中文版 Wiktionary 日語抽取檔（CC BY-SA），以 OpenCC `s2twp` 轉台灣繁體。無中文者退回英文並標 `glossLang: "en"`。
- 第一版可先只用英文釋義上線，中文接合為獨立步驟。

### 建置腳本 `scripts/build-data.mjs`

- 輸入：下載或讀取本機快取的 jmdict-eng JSON、OpenJLPT JSON、kaikki JSONL。
- 輸出：`public/data/n5.json` … `public/data/n1.json`，每級一檔。
- 每筆欄位：

```json
{
  "id": "1234567",
  "kanji": "勉強",
  "kana": ["べんきょう"],
  "uk": false,
  "katakana": false,
  "gloss": "讀書、學習",
  "glossLang": "zh",
  "glossEn": "study",
  "level": "N5"
}
```

- `kanji` 為 null 時表示無漢字形。`uk` 來自 JMdict 的 `uk` 標記。`katakana` 為標頭全為片假名。
- 丟棄 JMdict 中標記為 `sK`、`sk`、`rK`、`ok`、`oK` 的罕用形。
- 同一詞出現在多個等級清單時取最低等級（N5 優先）。

### 授權標示

頁尾固定顯示：資料來自 EDRDG JMdict（CC BY-SA 4.0）、OpenJLPT（CC BY-SA 4.0）、Wiktionary（CC BY-SA）。

## 畫面

- 一頁式，白底黑字，無動畫、無圖片。
- 上方：小字進度「第 3 題 / 10」。
- 中央：單字放大置中（意思模式含 ruby）。
- 下方：四個選項按鈕或一個輸入框。
- 首頁：等級勾選、模式單選、金鑰輸入、開始按鈕、頁尾授權。
- 日文一律包在 `lang="ja"` 元素內，字型 `"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui`；介面 `lang="zh-Hant"`。
- 手機寬度可用，16px 側邊留白。

## 技術

- Vite + TypeScript，無前端框架，單一 `index.html`。
- 套件：`wanakana`。開發：`vitest`。
- 部署：GitHub Actions（`actions/configure-pages` → `upload-pages-artifact` → `deploy-pages`），推上 `main` 自動部署。`vite.config.ts` 的 `base` 設為 `/JPword/`。
- 網址參數：`?level=N4,N3&mode=reading` 可預先帶入選擇，但等級仍需已解鎖才生效。

## 模組切分

- `src/data.ts`：載入所選等級的 JSON 並合併。
- `src/sampler.ts`：`pickRound(words, n, rng)` 無重複隨機抽樣；`pickDistractors(words, target, n, rng)`。
- `src/answer.ts`：`normalizeKana`、`isReadingCorrect(input, readings)`。
- `src/levels.ts`：等級順序、`unlockedLevels(keyInput)`、`nextKeyFor(selectedLevels)`。
- `src/keys.ts`：產生的雜湊與混淆字串，及 `revealKey(level)`、`verifyKey(input)`。
- `src/round.ts`：回合狀態機（題目序列、作答、計分、過關判定）。
- `src/ui.ts`：DOM 渲染與事件。
- `src/main.ts`：組裝。

## 測試（Vitest）

- `answer.test.ts`：toukyou / tōkyō / トウキョウ 皆判定為 とうきょう；空白與大小寫不影響。
- `sampler.test.ts`：抽出數量正確、無重複、全部來自輸入池；干擾項不含正解且不重複。
- `levels.test.ts`：K3 解鎖 N4+N3；無效金鑰只解鎖 N5；選 N5+N4 過關給 K3；選 N1 過關不給金鑰。
- `round.test.ts`：10 題計分；9/10 過關、8/10 不過關。

## 錯誤處理

- 資料載入失敗：顯示「資料載入失敗，請重新整理」。
- 所選等級池不足 10 字或不足以產生 4 個不同釋義：縮減題數並提示。
- 金鑰無效：顯示「無效」。

## 第一版不做

音檔、音調、背景音樂、進度儲存、個人檔案、同形異義語對比卡、例句、AI 補翻中文釋義。資料格式以 `glossLang` 與可擴充欄位預留。
