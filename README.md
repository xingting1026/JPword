# JPword

日文單字練習網站（GitHub Pages 靜態站）。每回從所選 JLPT 等級純隨機抽 10 題，答對 9 題以上取得下一級的金鑰。不儲存任何進度，重新整理即全新一回。

- **意思模式**：顯示單字（漢字附平假名），四選一選釋義。
- **讀音模式**：只顯示漢字，用羅馬字打讀音，會自動轉成平假名。習慣寫假名的詞與片假名詞仍出意思題。
- **等級**：打開只有 N5。過關後畫面會顯示四位字母金鑰，下次在首頁輸入即可解鎖更高等級（累積式）。
- 網址參數：`?level=N5,N4&mode=reading` 可預先帶入選擇，但等級仍需先解鎖。

## 開發

```bash
npm install
npm run dev        # 本機預覽（網址為 http://localhost:5173/JPword/）
npm test           # 單元測試
npm run build      # 產出 dist/
npm run build:data # 重新從 OpenJLPT / JMdict / Wiktionary 產生 public/data（來源快取在 .cache/）
npm run gen:keys   # 重新產生金鑰（會讓舊金鑰失效）
```

## 部署

推上 `main` 後由 GitHub Actions 自動部署。首次需在 repo **Settings → Pages** 將 Source 設為 **GitHub Actions**。

## 資料來源與授權

資料為 CC BY-SA 4.0 衍生作品，來源：

- [OpenJLPT](https://github.com/evanclan/OpenJLPT)（CC BY-SA 4.0）：N5–N1 單字、讀音、英文釋義。其上游為 EDRDG 的 [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html)／KANJIDIC2、Jonathan Waller 的 JLPT 清單、Tatoeba。
- [jmdict-simplified](https://github.com/scriptin/jmdict-simplified)（CC BY-SA 4.0）：「習慣寫假名」標記與其他讀音。
- [kaikki.org 中文維基詞典抽取檔](https://kaikki.org/zhwiktionary/)（CC BY-SA）：中文釋義，經 OpenCC 轉為台灣繁體；無中文者退回英文。

設計規格見 `docs/superpowers/specs/`，研究報告見 `reports/`。
