# Static-site (GitHub Pages) implementation options for a Japanese vocabulary SRS app

Research date: 2026-10-07. Repository stars / last-push dates below were read live from the GitHub REST API (`api.github.com/repos/...`) on that date; npm "latest" versions were read from `registry.npmjs.org`. Anything not verified this way is explicitly marked **[unverified]**.

## 1. Spaced-repetition algorithms: SM-2, Anki-SM-2, FSRS, Leitner, HLR, Ebisu, mastery counter

### Takeaway
FSRS-6 (21 parameters, DSR model) is the best-performing openly specified scheduler in the open-spaced-repetition benchmark (log loss 0.3460 vs HLR 0.4694 and Ebisu 0.4989 on ~350 M Anki reviews), and it ships as a maintained MIT TypeScript package (`ts-fsrs` 5.4.2, pushed 2026-10-07). For a single-user static app the pragmatic choice is `ts-fsrs` with default parameters (or the ~100-line `femto-fsrs` if you want zero dependency weight); SM-2 is the fallback if you want something you can read in five minutes.

### Cited Findings

**SM-2 (SuperMemo, 1987)**
- Interval rule: "I(1):=1 I(2):=6 for n>2: I(n):=I(n-1)*EF"; E-factor update "EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))"; EF minimum 1.3, initial 2.5; grades 0–5; if q<3 "start repetitions for the item from the beginning without changing the E-Factor". Developed by Piotr Wozniak in December 1987 — [SuperMemo: Algorithm SM-2](https://super-memory.com/english/ol/sm2.htm)
- Data per card: `interval` (days), `repetition` (count of consecutive correct), `efactor`; initial values `repetition: 0, interval: 0, efactor: 2.5` — [npm `supermemo` search summary](https://npmjs.com/package/supermemo); npm `supermemo` latest 2.0.23, last modified 2025-03-20 (npm registry, read 2026-10-07). Source repo reported as [maxvien/supermemo](https://github.com/maxvien/supermemo) **[repo not API-verified]**. Alternatives found: [@kirklin/supermemo2](https://npmjs.com/package/@kirklin/supermemo2), [@dtjv/sm-2](https://www.npmjs.com/package/@dtjv/sm-2) **[not API-verified]**.

**Anki's modified SM-2**
- Anki's documented differences from SM-2: user-controlled learning steps instead of fixed 1-day/6-day; "Anki uses 4 choices for answering review cards, not 6. There is only one *fail* choice, not 3."; late reviews are "factored into the next interval calculation"; lapses can reduce rather than reset the interval; an Easy bonus; and "Successive failures while cards are in learning do not result in further decreases to the card's ease". "As of Anki 23.10, Anki has two available algorithms" (legacy SM-2 and FSRS) — [Anki FAQ: What spaced repetition algorithm does Anki use?](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm)
- Anki FSRS "Desired retention" defaults to 90%; parameters are per-preset and meant to be optimized from review history, not hand-tuned — [Anki manual: Deck Options](https://docs.ankiweb.net/deck-options.html)
- [ankitects/anki](https://github.com/ankitects/anki): 31,824 stars, pushed 2026-10-06 (GitHub API).

**FSRS (Free Spaced Repetition Scheduler)**
- Model variables: Stability S = "interval when R=90%", Difficulty D in 1–10, Retrievability R = "probability of recall". FSRS-6 forgetting curve: `R(t,S) = (1 + factor · t/S)^(-w20)` where factor is chosen so that R(S,S)=90%. Parameter counts: FSRS-6 = 21, FSRS-5 = 19, FSRS-4.5 and v4 = 17, v3 = 13. Initial stability in v4+: `S0(G) = w[G-1]` (lookup by first rating G=1..4). Difficulty uses mean reversion `D' = w7·D0(3) + (1-w7)·(D - w6·(G-3))` "to prevent ease hell" — [awesome-fsrs wiki: The Algorithm](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)
- Original paper: Junyao Ye, Jingyong Su, Yilong Cao, "A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Schedule", KDD 2022, pp. 4381–4390 — [dblp record](https://dblp1.uni-trier.de/rec/conf/kdd/YeSC22.html); summary: 220 M memory-behaviour logs collected, a Markov memory model, SSP-MMC scheduler, 12.6% improvement over state of the art, deployed in MaiMemo — [HIT scholar page](https://scholar.hit.edu.cn/en/publications/a-stochastic-shortest-path-algorithm-for-optimizing-spaced-repeti/). DOI 10.1145/3534678.3539081 (ACM page returned HTTP 403 to the fetcher, so the DOI is taken from the task brief and dblp, not the ACM page).
- Benchmark (srs-benchmark README, read 2026-10-07): 9,999 collections / 349,923,850 reviews (without same-day reviews), chronological TimeSeriesSplit, metrics Log Loss / RMSE(bins) / AUC. Log loss (lower is better): RWKV-Instant 0.2773, LSTM 0.3332, GRU 0.3328, FSRS-7 recency 0.3370, FSRS-6 0.3460, FSRS-5 0.3561, FSRS-4.5 0.3625, FSRS v4 0.3726, DASH 0.3682, HLR 0.4694, Ebisu v2 0.4989 — [open-spaced-repetition/srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark) (272 stars, pushed 2026-09-18). Note: the fetched excerpt did not surface SM-2 / Anki-SM-2 rows (see Gaps).
- JavaScript libraries (GitHub API, 2026-10-07):
  - [open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs): 809 stars, pushed 2026-10-07; npm `ts-fsrs` latest **5.4.2** (published 2026-10-03). Implements FSRS v6; MIT; ESM/CJS/UMD; Node ≥ 20. Card fields: `due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review`. Usage: `const f = fsrs(); const card = createEmptyCard(); f.repeat(card, now)` (preview all four ratings) or `f.next(card, now, Rating.Good)` — [ts-fsrs README](https://github.com/open-spaced-repetition/ts-fsrs). Default constants read from `packages/fsrs/src/constant.ts`: `default_request_retention = 0.9`, `default_maximum_interval = 36500`, `default_enable_fuzz = false`, `default_enable_short_term = true`, `FSRS6_DEFAULT_DECAY = 0.1542`, `default_w[0..3] = 0.212, 1.2931, 2.3065, 8.2956` (initial stabilities in days for Again/Hard/Good/Easy) — [constant.ts](https://raw.githubusercontent.com/open-spaced-repetition/ts-fsrs/main/packages/fsrs/src/constant.ts)
  - [open-spaced-repetition/fsrs.js](https://github.com/open-spaced-repetition/fsrs.js): 180 stars, last push 2024-04-10 — effectively stale; prefer ts-fsrs.
  - [open-spaced-repetition/fsrs-browser](https://github.com/open-spaced-repetition/fsrs-browser): 56 stars, pushed 2026-06-14, "FSRS for the browser, including Optimizer and Scheduler" (WASM) — the only way to run the parameter optimizer client-side on a static site.
  - [RickCarlino/femto-fsrs](https://github.com/RickCarlino/femto-fsrs): 6 stars, pushed 2025-05-03, "The Free Spaced Repetition Scheduler (FSRS) in 100-ish lines of Typescript"; npm `femto-fsrs` 2.0.0.
  - Also verified: [fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki) 4,092 stars; [fsrs-rs](https://github.com/open-spaced-repetition/fsrs-rs) 439; [py-fsrs](https://github.com/open-spaced-repetition/py-fsrs) 504; [awesome-fsrs](https://github.com/open-spaced-repetition/awesome-fsrs) 715 (curated index).

**Leitner box system**
- Proposed by Sebastian Leitner in 1972 (*So lernt man Lernen*). Correct answer promotes the card to the next box; incorrect sends it back to box 1. Original partitions were 1, 2, 5, 8, 14 cm; a 3-box example reviews box 1 daily, box 2 every 3 days, box 3 every 5 days. Only the card's current box number must be stored — [Wikipedia: Leitner system](https://en.wikipedia.org/wiki/Leitner_system)
- Leitner and Pimsleur were the baselines HLR beat; "HLR error rate is nearly half that of the Leitner system method, which was what Duolingo used for its first version" — [Duolingo blog: How we learn how you learn](https://blog.duolingo.com/how-we-learn-how-you-learn)

**Half-Life Regression (Duolingo)**
- Settles & Meeder, "A Trainable Spaced Repetition Model for Language Learning", ACL 2016, Berlin — [ACL Anthology P16-1174](https://aclanthology.org/P16-1174/). Model: `p = 2^(-Δ/h)`, `h = 2^(Θ·x)` (Δ = time since last practice, x = feature vector incl. correct/incorrect counts), trained on ~13.5 M learning traces — [PDF](https://aclanthology.org/P16-1174.pdf)
- Code + 13 M-trace dataset: [duolingo/halflife-regression](https://github.com/duolingo/halflife-regression), 582 stars, last push 2024-04-20 (research code, Python; no JS port found).
- A/B test: +9.5% practice-session retention, +1.7% lessons, +12% overall activity (search summary of the blog post) — [Duolingo blog](https://blog.duolingo.com/how-we-learn-how-you-learn)

**Ebisu (Bayesian; relevant because it exposes `predictRecall`)**
- Stores a 3-tuple `(alpha, beta, t)` = Beta prior on recall probability at time t; `predictRecall` gives expected recall now so apps can "find the fact most at risk of being forgotten"; `updateRecall` updates after a quiz; public domain — [fasiha/ebisu README](https://raw.githubusercontent.com/fasiha/ebisu/gh-pages/README.md); repo 338 stars (pushed 2024-10-02); JS port [fasiha/ebisu.js](https://github.com/fasiha/ebisu.js) 48 stars, pushed 2026-09-03, npm `ebisu-js` 2.1.3.

**"Mastery counter" (count correct answers until N)**
- No primary literature found (see Gaps). It is the degenerate case of Leitner with no time component.

### Inferences
- Complexity / data per card (derived from the sources above):
  | Algorithm | Params | Per-card state | Time-aware? | JS lib |
  |---|---|---|---|---|
  | Mastery counter | 1 (N) | `correctStreak` | no | none needed |
  | Leitner | box schedule | `box`, `lastReview` | coarse | none needed |
  | SM-2 | fixed formula | `interval, repetition, efactor, due` | yes | `supermemo` |
  | Anki-SM-2 | ~10 deck options | SM-2 + learning step index | yes | reimplement |
  | HLR | trained Θ (needs big dataset) | `h`, feature counts | yes (continuous p) | none (Python only) |
  | Ebisu | prior | `alpha, beta, t, lastReview` | yes (continuous p) | `ebisu-js` |
  | FSRS-6 | 21 w (defaults OK) | 9 fields (see ts-fsrs) | yes (continuous R) | `ts-fsrs`, `femto-fsrs`, `fsrs-browser` |
- Only FSRS, HLR and Ebisu give a continuous "probability of recall now" per card; that is exactly the quantity you need to drive weighted random selection from a finite set (Section 2). SM-2/Leitner only give a binary due/not-due.
- HLR is not practical here: it requires fitting Θ on millions of traces and benchmarks worse than FSRS defaults; FSRS default `w` already encodes a population prior, so a single user gets good scheduling with no training step. If you ever want per-user optimization on a static site, `fsrs-browser` (WASM) exists.
- Pragmatic choice: `ts-fsrs` (FSRS-6, defaults, `enable_fuzz: true` to avoid cards clustering on the same day). With ~3,000 words × ~9 numeric fields the card-state JSON is well under 1 MB, far below localStorage's 5 MiB.

### Gaps
- The srs-benchmark README excerpt the fetcher returned did not include SM-2 / Anki-SM-2 / Leitner rows, so I cannot cite their exact log-loss numbers here; the full table on the repo page should be consulted.
- `ts-fsrs` Rating/State enum numeric values and the full 21-element `default_w` were not captured (only w0–w11 visible in the excerpt); see `constant.ts` link.
- No academic source for the "mastery counter" approach was found.
- `maxvien/supermemo` and the two alternative SM-2 packages were only seen in search results, not verified via the GitHub API.

## 2. Reconciling "nearly random words from a FINITE set" with spaced repetition

### Takeaway
Existing systems do not choose between randomness and SRS; they use SRS to decide the *eligible pool* (due reviews + a quota of new cards) and randomness to decide *order within the pool* (Anki's "Random" new-card order and "Due date, then random" review order). For a finite set the natural generalization is weighted random sampling where the weight is a function of predicted forgetting (1 − R from FSRS, or Ebisu's `predictRecall`).

### Cited Findings
- Anki separates *gathering* from *ordering*: New-card gather order includes "Random notes" and "Random cards"; new-card sort order includes "Random" (full shuffle) and "Card type, then random"; review sort order includes "Due date, then random" (overdue first, random tie-break) and "Relative overdueness"; New/Review order can mix new with reviews or show one before the other — [Anki manual: Deck Options, Display Order](https://docs.ankiweb.net/deck-options.html)
- Ebisu is explicitly designed so apps "ensure that only the facts most in danger of being forgotten are reviewed" using `predictRecall` rather than "rigid daily piles of reviews" — [fasiha/ebisu README](https://raw.githubusercontent.com/fasiha/ebisu/gh-pages/README.md)
- FSRS exposes R(t,S), the probability of recall at elapsed time t given stability S — [awesome-fsrs wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm); `ts-fsrs` returns `stability` and `due` per card and `fsrs().repeat()` previews the outcome of each rating — [ts-fsrs README](https://github.com/open-spaced-repetition/ts-fsrs)
- Anki's SM-2 variant and obsidian-spaced-repetition both add a "small amount of random 'fuzz'" to intervals to prevent clustering of due dates — [OSR algorithms doc](https://www.stephenmwangi.com/obsidian-spaced-repetition/algorithms/); `ts-fsrs` has an `enable_fuzz` option (default false) — [constant.ts](https://raw.githubusercontent.com/open-spaced-repetition/ts-fsrs/main/packages/fsrs/src/constant.ts)
- A Taiwanese pure-static example of the "random from finite set" pattern: aszx87410/jpword "每次隨機出 10 題填空選擇題，從 3000 個常用日語單字中出題", scores kept in localStorage, no SRS — [aszx87410/jpword README](https://raw.githubusercontent.com/aszx87410/jpword/main/README.md)

### Inferences
Three concrete selection algorithms (my own designs, built on the cited mechanisms). Assume a finite `words[]`, per-word FSRS card state, session size `K` (e.g. 20), and a cheap `retrievability(card, now)` helper (ts-fsrs exposes this via `get_retrievability`; otherwise compute `R = (1 + factor·t/S)^(-w20)` from the wiki formula).

**Algorithm A — Anki-style pool + shuffle (simplest, deterministic eligibility)**
```
due      = words.filter(w => w.card.due <= now)
fresh    = shuffle(words.filter(w => w.card.state == New)).slice(0, NEW_PER_SESSION)   // Anki "new cards: Random"
pool     = shuffle(due).concat(fresh)                                                    // Anki "Due date, then random"
if pool.length < K:                                                                      // finite set exhausted today
    extra = words.filter(w => !pool.includes(w) && w.card.state != New)
    pool += weightedSample(extra, K - pool.length, w => 1 - retrievability(w.card, now))  // "ahead-of-schedule" fill
session = pool.slice(0, K)
```
Property: exactly reproduces Anki when there are enough due cards; degrades gracefully to "review the weakest" when the finite set is small.

**Algorithm B — Weighted random by forgetting probability (feels random every session, still SRS-driven)**
```
for w in words:
    R = (w.card.state == New) ? 0 : retrievability(w.card, now)
    weight[w] = EPS + (1 - R)^GAMMA          // GAMMA≈2 sharpens toward weak cards; EPS≈0.02 keeps strong cards possible
session = weightedSampleWithoutReplacement(words, K, weight)   // e.g. Efraimidis-Spirakis: key = rand()^(1/weight), take top K
```
Property: a word at R=0.95 is chosen ~400× less often than a new word but never excluded, so the learner sees "nearly random" sets whose composition tracks memory strength; Ebisu's `predictRecall` can replace `1-R` directly.

**Algorithm C — Stratified buckets (predictable mix, good for UI)**
```
buckets = { new: K*0.3, weak: K*0.4 (R < 0.8 or lapses>0), strong: K*0.3 (R ≥ 0.8) }
for each bucket: pick shuffle(candidates).slice(0, quota); if short, spill quota to the next bucket
session = shuffle(concat(all picks))
```
Property: guarantees every session mixes discovery, repair and maintenance; quotas are tunable without touching the scheduler.

- In all three, after each answer call `fsrs().next(card, now, rating)` and persist the returned card; the selection layer never mutates scheduling state, which keeps FSRS semantics intact.
- For a finite set the "due" concept eventually empties (everything is at long intervals); B or the fill step of A is what keeps sessions non-empty. Enabling `enable_fuzz` reduces the "all 300 words due on the same Monday" problem.

### Gaps
- I found no published study comparing weighted-random sampling against strict due-date ordering for retention; the designs above are engineering inferences, not benchmarked results.
- Anki's exact internal tie-break RNG and its "Relative overdueness" formula were not fetched in detail.

## 3. Persistence without a backend

### Takeaway
localStorage (5 MiB/origin, synchronous, strings only) is enough for ~thousands of card states; IndexedDB is effectively unlimited (tens of % of disk) but Safari's ITP can wipe *all* script-created storage after 7 days without interaction unless the site is used regularly. Cross-device sync on a pure static site is only possible via user-pasted credentials (GitHub Gist + fine-grained PAT with Gists permission) or manual JSON export/import; true OAuth cannot be done client-side.

### Cited Findings
- Web Storage: "Maximum: 10 MiB per origin (5 MiB localStorage + 5 MiB sessionStorage)", throws `QuotaExceededError` when exceeded. IndexedDB/Cache quotas: Chrome up to 60% of disk per origin; Firefox min(10% of disk, 10 GiB group limit); Safari ~60% of disk for browser apps (legacy pre-macOS 14/iOS 17: 1 GiB then prompts). Eviction is LRU under storage pressure and deletes **all** of an origin's data at once. Safari ITP: "If origin has no user interaction (click/tap) in last 7 days, script-created data is deleted" (when cross-site tracking prevention is on). `navigator.storage.persist()` exempts an origin from LRU eviction; Chrome/Edge/Safari auto-decide, Firefox prompts; `navigator.storage.estimate()` reports usage/quota — [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- File System Access API: `showOpenFilePicker()`, `showSaveFilePicker()`, `showDirectoryPicker()` require a secure context and explicit user permission via the picker; the Origin Private File System (`navigator.storage.getDirectory()`) needs no permission but is invisible to the user — [MDN: File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). (Per-browser support versions were not in the fetched excerpt; see Gaps.)
- GitHub Gists REST: "To read or write gists on a user's behalf, you need the gist OAuth scope and a token"; `POST /gists` creates, `PATCH /gists/{gist_id}` updates files; reads truncate individual files above 1 MB (clone via git URL above 10 MB); max 300 files listed — [GitHub REST docs: Gists](https://docs.github.com/en/rest/gists/gists)
- "it currently isn't possible to implement GitHub OAuth entirely from the client because that API depends on a secret that must be held server-side" — a Cloudflare Worker (or similar) is needed for real OAuth — [Simon Willison TIL: GitHub OAuth for a static site using Cloudflare Workers](https://til.simonwillison.net/cloudflare/workers-github-oauth)
- GitHub Pages prohibits using the site for "Processing sensitive data like passwords or credit card information" and has a soft 100 GB/month bandwidth limit — [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Example static app: thomasrribeiro/flashcards (Vite + vanilla JS, FSRS, GitHub Pages): "guests store progress locally via browser storage, while authenticated users sync data through an existing worker service" — i.e. it needed a worker for sync — [README](https://raw.githubusercontent.com/thomasrribeiro/flashcards/main/README.md); live at https://thomasrribeiro.com/flashcards/ (repo 0 stars, pushed 2026-10-06).
- Rick Carlino's "Flashcard Review System": "all data saved locally to LocalStorage and no data transferred after page load", scheduling via Femto-FSRS — [rickcarlino.com/srs.html](https://rickcarlino.com/srs.html) (search snippet; page not fetched).

### Inferences
- Size budget: 3,000 words × (~9 FSRS fields ≈ 200 bytes JSON) ≈ 600 KB, well within the 5 MiB localStorage cap; store the static dictionary separately (fetched JSON, not in localStorage) and keep only `{id → cardState}` in storage.
- Recommended layering: (1) localStorage or IndexedDB (via a thin wrapper such as `idb-keyval` **[not verified here]**) for the working copy; (2) call `navigator.storage.persist()` on first use to opt out of LRU eviction; (3) one-click JSON export/import (`<a download>` works everywhere; `showSaveFilePicker` only where supported) as the universal backup; (4) optional Gist sync where the user pastes a fine-grained PAT scoped to Gists only; store the token in localStorage, send it only to `api.github.com`, and warn that a "secret" gist is still URL-accessible. Because the token never leaves the user's own browser, this is consistent with the Pages rule (the site does not process the credential server-side), but it is still the user's own security risk and should be opt-in.
- Safari/iOS users who open the app less than weekly will lose localStorage unless they install it as a home-screen PWA or export regularly; the 7-day ITP rule is the single biggest data-loss risk for a hobby app.
- Avoid `showSaveFilePicker` as the *only* backup path; use the download-link fallback.

### Gaps
- Per-browser version support for `showSaveFilePicker` (my prior understanding is Chromium-only, with Firefox/Safari lacking it) could not be confirmed from the fetched MDN excerpt — treat as **[unverified]**.
- Whether Safari's 7-day ITP cap applies to installed home-screen PWAs was not confirmed by a source.
- No source was found that documents a widely used *pure-static* SRS app with Gist sync; the pattern exists in generic tools (e.g. "gist-database" search hits) but none were verified.

## 4. Tech stack for GitHub Pages (build, dataset bundling, speech, segmentation, kana input)

### Takeaway
Vite (vanilla TS, or Svelte/Vue/React — framework is a taste choice) + the official `actions/upload-pages-artifact` → `actions/deploy-pages` workflow with `base: '/<repo>/'` is the standard 2026 path; GitHub Pages gzips responses automatically, so a ~3,000-word JSON file is small. Web Speech API works everywhere but Japanese voice quality/availability is OS-dependent and Chrome-Android's voice list is unreliable; `Intl.Segmenter` is Baseline 2024 and handles Japanese; `wanakana` handles romaji→kana input without an IME.

### Cited Findings
**Build and deploy**
- GitHub Pages publishes either from a branch (root or `/docs`) or from a GitHub Actions workflow using `actions/checkout`, `actions/upload-pages-artifact`, `actions/deploy-pages`; the `github-pages` environment is auto-created — [GitHub Docs: Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- Limits: published site ≤ 1 GB, soft 100 GB/month bandwidth, soft 10 builds/hour (not applied to custom Actions workflows), 10-minute deployment timeout — [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Vite: for `https://<USER>.github.io/<REPO>/` "set `base` to `'/<REPO>/'`"; the reference workflow needs permissions `contents: read, pages: write, id-token: write`, uses `actions/configure-pages`, `actions/upload-pages-artifact` with `path: './dist'`, `actions/deploy-pages`, triggers on push to `main` and `workflow_dispatch` — [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy)
- Compression: an HTTP HEAD request to https://pages.github.com/ with `Accept-Encoding: gzip, br` on 2026-10-07 returned `Server: GitHub.com`, `Content-Encoding: gzip`, `Cache-Control: max-age=600` (observed in this research; not a documented guarantee). Older search results say pre-compressed `.br` files are not served by GitHub Pages — [search summary](https://gitlab.com/gitlab-org/gitlab-pages/-/merge_requests/359) (GitLab context; GitHub-specific doc not found).

**Web Speech API (speechSynthesis) for Japanese**
- `speechSynthesis.getVoices()` returns `SpeechSynthesisVoice` objects with `lang, name, localService, default`; "In Chrome, getVoices() may return an empty array initially" — listen for `voiceschanged`; Baseline widely available since September 2018 — [MDN: SpeechSynthesis.getVoices()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- Platform behaviour (Readium's survey): iOS — all browsers are shells over Safari Mobile and share macOS/iOS voices, but downloadable voices "don't display in Web Speech API results" and installing higher-quality variants can make a language disappear; Android Chrome — "Returns an unfiltered list of language/region combinations rather than actual available voices", lists voice packs that are not installed, and "Falls back to English if a user selects an unsupported language/region"; Windows Edge — 250+ natural voices across 75 languages but "All natural voices require online access"; Windows Chrome/Firefox do not expose those natural voices; macOS — highest-quality Siri voices are not exposed; Chrome Desktop utterances over ~14 seconds trigger a bug; `voiceURI` is unreliable for identification — [Readium: SpeechSynthesis in browsers and OSes](https://readium.org/speech/docs/WebSpeech.html)
- Japanese voice names commonly reported: macOS/iOS "Kyoko" (female) and "Otoya" (male); Windows "Haruka, Ichiro, Ayumi, Sayaka"; Chrome/Edge add Google/Microsoft online voices — [gyanmirai Japanese TTS page](https://www.gyanmirai.com/tools/japanese-text-to-speech) **[secondary source, low authority; treat names as indicative]**
- "Chrome on Android doesn't return the list of voices available to users ... if the user selects a language/region for which the voice pack needs to be downloaded, Chrome will default to an English voice instead" — [DEV: Cross-browser speech synthesis](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)

**Intl.Segmenter**
- Locale-sensitive segmentation with `grapheme | word | sentence` granularity; MDN's own example segments Japanese ("吾輩は猫である。名前はたぬき。") with `new Intl.Segmenter("ja-JP", { granularity: "word" })` using dictionary-based segmentation; Baseline 2024 (April 2024) — [MDN: Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- First supporting versions: Chrome 87, Edge 87, Firefox 125, Safari 14.1, iOS Safari 14.5; global usage 96.56% — [caniuse](https://caniuse.com/mdn-javascript_builtins_intl_segmenter)

**wanakana**
- [WaniKani/WanaKana](https://github.com/WaniKani/WanaKana): 943 stars, pushed 2026-06-29; npm `wanakana` latest 5.3.1 (2023-11-20). `npm install wanakana` or UMD at `https://unpkg.com/wanakana`; functions `toKana, toHiragana, toKatakana, toRomaji, isKana, isJapanese, stripOkurigana, tokenize`; `wanakana.bind(domElement)` turns an `<input>` into a live romaji→kana IME-mode field, `unbind` removes it — [WanaKana README](https://raw.githubusercontent.com/WaniKani/WanaKana/master/README.md)

### Inferences
- Stack recommendation: Vite + TypeScript (vanilla or Svelte for the smallest bundle), `ts-fsrs`, `wanakana`, no router needed. Plain HTML/JS without a bundler is viable (aszx87410/jpword does it) but you lose tree-shaking, TypeScript, and easy npm dependency handling.
- Dataset: ship one JSON per JLPT level (N5…N1) or per 500-word chunk under `public/data/`, `fetch()` lazily with `Cache-Control` from Pages (10 min) plus a service worker for offline; 3,000 entries with kanji/kana/meaning/example are typically a few hundred KB raw and far less gzipped. Put the FSRS state in storage keyed by a stable word id, never by array index, so dataset updates don't corrupt progress.
- Speech: always `voiceschanged`-wait, filter `voice.lang.startsWith('ja')`, prefer `localService` voices on mobile, and show a "no Japanese voice installed" hint with OS-specific instructions; on Android do not trust the list — test-speak once and detect silence. Keep utterances short (single word/sentence) to dodge the ~14 s Chrome bug.
- `Intl.Segmenter` is sufficient for splitting example sentences into clickable words; it does not give readings/furigana (that needs a dictionary such as jmdict-simplified or precomputed data).
- Kana-without-IME: `wanakana.bind()` on the answer `<input>` lets a Taiwanese user type "neko" and get ねこ; compare answers after `toHiragana()` normalization on both sides.

### Gaps
- No authoritative Apple/Google/Microsoft documentation of which Japanese voices are preinstalled per OS version was found; the names above come from a secondary page.
- GitHub's own documentation of gzip/brotli behaviour for Pages was not found; the gzip observation is from a live HEAD request only.
- Bundle-size numbers for Svelte vs Vue vs React were not researched (framework choice is not decisive for this app).

## 5. Existing open-source projects to study (verified)

### Takeaway
Very few Japanese-learning SRS projects are pure static sites; the verified static ones are small (aszx87410/jpword, thomasrribeiro/flashcards, Rick Carlino's srs.html, olgasafonova/kanadojo). The large, active projects (Anki, Yomitan, kanji-koohii, obsidian-spaced-repetition) are worth reading for algorithm and data handling but are not static sites. Several names in the brief (tenshi, gurubashi, jpdb-deck, "DJT Kana", kana-pro, realkana, Tango) do not resolve to a canonical open-source repo.

### Cited Findings
All stars/dates from the GitHub REST API on 2026-10-07.

| Project | Repo | Stars | Last push | Static site? | Notes |
|---|---|---|---|---|---|
| Anki | [ankitects/anki](https://github.com/ankitects/anki) | 31,824 | 2026-10-06 | No (desktop; AnkiWeb is a hosted service) | Reference for SM-2 variant and FSRS integration |
| obsidian-spaced-repetition | [st3v3nmw/obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition) | 2,577 | 2026-10-05 | No (Obsidian plugin) | Only "SM-2-OSR" implemented: ±20 ease, min ease 130, easy `old_interval*new_ease/100*1.3`, good `old_interval*old_ease/100`, hard `old_interval*0.5`, fuzz on intervals ≥ 8 days; FSRS "Planned" (issue #748) — [algorithms doc](https://www.stephenmwangi.com/obsidian-spaced-repetition/algorithms/) |
| Kanji Koohii | [fabd/kanji-koohii](https://github.com/fabd/kanji-koohii) | 255 | 2026-10-06 | No | "Symfony 1" backend, Vite + Vue 3 + Tailwind frontend, MySQL/MariaDB, Docker — [README](https://raw.githubusercontent.com/fabd/kanji-koohii/master/README.md) |
| Yomitan | [yomidevs/yomitan](https://github.com/yomidevs/yomitan) | 2,869 | 2026-10-06 | No (browser extension) | `themoeway/yomitan` now redirects ("Moved Permanently") to yomidevs |
| 10ten Japanese Reader | [birchill/10ten-ja-reader](https://github.com/birchill/10ten-ja-reader) | 760 | 2026-10-06 | No (extension) | Good reference for deinflection / dictionary lookup in JS |
| jmdict-simplified | [scriptin/jmdict-simplified](https://github.com/scriptin/jmdict-simplified) | 393 | 2026-10-05 | Data | JMdict/JMnedict/Kanjidic in JSON — candidate source for readings/meanings |
| kanjium | [mifunetoshiro/kanjium](https://github.com/mifunetoshiro/kanjium) | 350 | 2026-10-03 | Data | "The ultimate kanji resource"; widely used as a pitch-accent data source (exact accent file path not verified, see Gaps) |
| hanabira.org | [tristcoil/hanabira.org](https://github.com/tristcoil/hanabira.org) | 425 | 2025-03-26 | No (self-hosted portal, MIT) | |
| Tsurukame | [davidsansome/tsurukame](https://github.com/davidsansome/tsurukame) | 323 | 2026-10-07 | No (iOS WaniKani client) | WaniKani itself is a closed commercial service |
| jisho-api | [pedroallenrevez/jisho-api](https://github.com/pedroallenrevez/jisho-api) | 101 | 2025-12-08 | No (Python wrapper around jisho.org) | |
| jiten | [obfusk/jiten](https://github.com/obfusk/jiten) | 132 | 2024-08-31 | No (Android/CLI/web dictionary) | |
| jlpt-vocab-api | [wkei/jlpt-vocab-api](https://github.com/wkei/jlpt-vocab-api) | 130 | 2022-06-27 | Hosted API (Vercel) | Stale; JLPT N5–N1 vocabulary data |
| jlpt-word-list | [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) | 97 | 2023-04-04 | Data | |
| DJT guide | [djtguide/djtguide.github.io](https://github.com/djtguide/djtguide.github.io) | 36 | 2024-11-22 | Yes (GitHub Pages) | "DJT guide (backup)"; the "DJT Kana" quiz itself was not found as a separate repo |
| nhk-pronunciation | [javdejong/nhk-pronunciation](https://github.com/javdejong/nhk-pronunciation) | 75 | 2021-01-11 | No (Anki add-on) | Pitch-accent lookup reference; stale |
| flashcards (FSRS, Pages) | [thomasrribeiro/flashcards](https://github.com/thomasrribeiro/flashcards) | 0 | 2026-10-06 | **Yes** (Vite, vanilla JS, GitHub Pages) | localStorage for guests; sync needs a worker |
| 日語單字練習 | [aszx87410/jpword](https://github.com/aszx87410/jpword) | 2 | 2026-04-11 | **Yes** (no build tool, GitHub Pages) | Traditional-Chinese UI, 3,000 words, random 10-question cloze, auto furigana, localStorage history; questions generated with Gemini — [README](https://raw.githubusercontent.com/aszx87410/jpword/main/README.md) |
| KanaDojo (community) | [olgasafonova/kanadojo](https://github.com/olgasafonova/kanadojo) | 5 | 2026-08-09 | Unknown (TypeScript) | "kana training app with spaced repetition and mnemonic art"; the commercial kanadojo.com is separate |
| tango | [zeus0z/tango](https://github.com/zeus0z/tango) | 0 | 2026-07-22 | Unknown (TypeScript) | "Free flashcards + spaced repetition application for learning japanese"; too small to rely on |
| femto-fsrs | [RickCarlino/femto-fsrs](https://github.com/RickCarlino/femto-fsrs) | 6 | 2025-05-03 | Library | Used by rickcarlino.com/srs.html (localStorage-only static SRS) |
| Noto CJK fonts | [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) | 4,089 | 2025-12-16 | Font data | |

Not found / unverified:
- `zsh-eng/spaced`: GitHub API "Not Found".
- "tenshi": only a Discord bot (Miraii133/Tenshi-Bot, 0 stars) matched.
- "gurubashi": only World-of-Warcraft add-ons matched; no Japanese project.
- "jpdb-deck": only community deck collections for the closed jpdb.io service (asayake-b5/JPDBMangaRepository 15 stars, philipguin/JpdbGameDecks 9). jpdb, Kitsun, Renshuu and WaniKani are closed services and were not evaluated as code.
- "kana-pro" / kana-pro.com: no canonical repo (davidly1/KanaPro, 0 stars, is unrelated).
- "realkana": closed; only knock-offs (NickOveracker/meremer, yeriomin/realkana-reverse-practice userscript).
- "DJT Kana": only argot42/kana "CLI DJT Kana clone" (0 stars).
- "srs-static", "flashcards-static": not searched by exact name; **[unverified]**.
- "Kana" Rust app mentioned by [LinuxLinks](https://www.linuxlinks.com/kana-learn-japanese-characters/) — not verified.

### Inferences
- The best code to read for a static app: `thomasrribeiro/flashcards` (FSRS + Vite + Pages workflow + localStorage), `aszx87410/jpword` (Taiwanese UX conventions: 繁體中文 translations, furigana, mobile layout), `femto-fsrs` (readable FSRS), and `obsidian-spaced-repetition`'s algorithm doc (a clean SM-2 variant spec). For data, `jmdict-simplified` and `kanjium` are the active sources.
- None of the mature Japanese-learning apps is static, mainly because they need dictionary servers or accounts; that is not a blocker for a single-user finite-set app.

### Gaps
- Licenses were not individually confirmed for most repos (API `license` field came back empty for several); check each LICENSE file before copying code.
- kanjium's pitch-accent file (`accents.txt`, commonly under `data/source_files/raw/`) was not seen in the first 20 entries of the API directory listing I retrieved; path **[unverified]**.
- Star counts for `olgasafonova/kanadojo`, `zeus0z/tango`, `thomasrribeiro/flashcards` are near zero; they are examples, not community-vetted codebases.

## 6. Japanese text rendering for a Traditional-Chinese-locale user (Han unification, fonts, ruby, pitch accent)

### Takeaway
Set `lang="ja"` on every element containing Japanese (and `lang="zh-Hant"` on the Chinese UI) — the W3C documents that identical code points render with different glyphs depending on `lang`, and a zh-TW browser without the attribute will pick Chinese glyph forms. Self-host or Google-Fonts-load Noto Sans JP as the first font-family for `:lang(ja)`, use `<ruby><rt>` (Baseline since 2015) for furigana, and draw pitch accent from kanjium-style data.

### Cited Findings
- W3C: "text in Simplified Chinese, Traditional Chinese, Japanese, and Korean languages may share the same code point for an ideographic character, but speakers of these languages expect the glyphs used to vary"; browsers select typefaces by content language; the 雪 example renders differently as `lang` switches among en/ko/zh-Hant/zh-Hans/ja — [W3C i18n: Why use the language attribute?](https://www.w3.org/International/questions/qa-lang-why)
- Han unification: one code point U+8349 (草) regardless of writing system, though the traditional-Chinese grass radical has four strokes and the Japanese/simplified form three; without an explicit language, "Japanese terms may be displayed using a Chinese font that uses character forms that deviate from the Japanese norm" — [Wikipedia: Han unification](https://en.wikipedia.org/wiki/Han_unification)
- `<ruby>` with `<rt>` (annotation) and `<rp>` (fallback parentheses): example `<ruby>明日<rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby>`; "Baseline: Widely available — Available across browsers since July 2015"; related CSS `ruby-position`, `ruby-overhang`, `text-transform: full-size-kana` — [MDN: `<ruby>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby)
- Noto CJK fonts: [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk), 4,089 stars, pushed 2025-12-16 (GitHub API). The Google Fonts "Noto Sans JP" about page could not be read by the fetcher (returned only a title), so license/variable-font details are **[unverified here]**.
- Pitch-accent data sources (verified repos only): [mifunetoshiro/kanjium](https://github.com/mifunetoshiro/kanjium) (350 stars, active) and the stale Anki add-on [javdejong/nhk-pronunciation](https://github.com/javdejong/nhk-pronunciation) (75 stars, 2021).
- aszx87410/jpword demonstrates automatic furigana ("漢字自動標註讀音（振假名）") in a static page aimed at Traditional-Chinese readers — [README](https://raw.githubusercontent.com/aszx87410/jpword/main/README.md)

### Inferences
- Minimal CSS/HTML contract: `<html lang="zh-Hant">` for the app chrome, `<span lang="ja">` (or a `.ja` class with `lang`) around every Japanese string, and
  `:lang(ja) { font-family: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, sans-serif; }` — the `:lang()` selector plus the attribute covers both browser glyph selection and your own font choice. Without `lang="ja"`, a Windows zh-TW machine will typically fall back to Microsoft JhengHei glyph shapes for shared code points (e.g. 直, 骨, 海), which Japanese learners find wrong.
- Load Noto Sans JP as a subset (Google Fonts `text=`/unicode-range subsetting, or self-host woff2 subsets) — the full JP font is large; the exact size was not verified.
- Furigana: generate `<ruby>` markup at data-build time (store `[["漢字","かんじ"],...]` segments per word) rather than at runtime; `Intl.Segmenter` cannot supply readings.
- Pitch accent: store the accent number (0 = heiban, 1 = atamadaka, n = nakadaka/odaka) per reading and render it either as the number or as an overline/drop mark via CSS `border-top` on mora spans; this is how Yomitan/kanjium-based tools present it (rendering approach is an inference, not cited).

### Gaps
- No source was fetched for the Google Fonts Noto Sans JP license/variable-font page; the font's OFL licensing is widely known but is not cited here.
- No primary source on the *default* CJK font fallback order used by Chrome/Edge on zh-TW Windows was found; the JhengHei fallback statement is experience-based.
- No verified JS library for rendering pitch-accent diagrams was found in this pass.

## 7. Recommended stack and selection algorithm

### Takeaway
Vite + TypeScript (Svelte or vanilla), `ts-fsrs` (FSRS-6 defaults, fuzz on), `wanakana` for input, per-level JSON data files, localStorage + `navigator.storage.persist()` + JSON export/import, optional Gist sync with a user-pasted fine-grained PAT, deployed with the official Pages Actions workflow; select each session by weighted random sampling without replacement where weight = `EPS + (1 − R)^2` (new cards R = 0), capped to a new-card quota.

### Cited Findings
- Components and their verification are in Sections 1–6: `ts-fsrs` 5.4.2 / 809 stars / MIT ([repo](https://github.com/open-spaced-repetition/ts-fsrs)); `wanakana` 5.3.1 / 943 stars ([repo](https://github.com/WaniKani/WanaKana)); Vite Pages workflow ([Vite docs](https://vite.dev/guide/static-deploy)); storage limits ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)); Gist API scope ([GitHub docs](https://docs.github.com/en/rest/gists/gists)); `lang` attribute necessity ([W3C](https://www.w3.org/International/questions/qa-lang-why)); `<ruby>` baseline ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby)); Anki's random-within-pool ordering ([Anki manual](https://docs.ankiweb.net/deck-options.html)); FSRS retrievability formula ([awesome-fsrs wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)).

### Inferences
- Recommended stack (one line each): **Build** Vite + TS, `base: '/<repo>/'`, deploy via `actions/upload-pages-artifact` + `actions/deploy-pages`. **Scheduler** `ts-fsrs` with `{ request_retention: 0.9, enable_fuzz: true, enable_short_term: false }` (short-term learning steps add intra-day complexity a word app does not need). **Data** `public/data/n5.json … n1.json` with stable ids, readings as ruby segments, pitch number, example sentence; fetched lazily and cached by a service worker. **State** `localStorage['jpword:v1'] = { [id]: Card }` plus `persist()`; export/import JSON; optional Gist sync. **Japanese** `lang="ja"` + `:lang(ja)` font stack with Noto Sans JP; `<ruby>`; speechSynthesis with `ja-*` voice filtering after `voiceschanged`. **Input** `wanakana.bind()` on the answer field, compare after `toHiragana()`.
- Recommended selection algorithm (one paragraph): At session start compute for every word in the finite set its FSRS retrievability R (0 for never-seen words); assign weight `w = 0.02 + (1 − R)^2`; draw K = 20 words without replacement using Efraimidis–Spirakis keys (`rand()^(1/w)`, take the K largest), but cap never-seen words at NEW_PER_SESSION (e.g. 5) and, when more than K words are overdue, draw from the overdue subset first so the session still clears the backlog like Anki's "Due date, then random". Shuffle the drawn set, present each, and after each answer call `fsrs().next(card, now, rating)` and persist the returned card. This keeps every session "nearly random" (even well-known words can appear, with low probability), concentrates practice on words the model predicts are about to be forgotten, degrades gracefully when the finite set has no due cards, and never requires the selection layer to touch FSRS internals.

### Gaps
- The weight exponent (2) and floor (0.02) are untested heuristics; tune by watching the distribution of R values shown per session.
- Whether to use `enable_short_term` is a product decision not backed by a cited benchmark for vocabulary-only decks.
