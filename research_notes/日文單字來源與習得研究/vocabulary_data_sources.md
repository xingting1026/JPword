# Japanese Vocabulary Data Sources for a Static (GitHub Pages) Learning Site

Research date: 2026-10-07. All file sizes marked "(measured)" were obtained by HTTP HEAD / download on that date. Target learner: Traditional-Chinese speaker in Taiwan; target deployment: static site, data bundled as files, no server.

## Key Question 1: What are the main open Japanese dictionary datasets (JMdict/EDICT, JMdict_e, KANJIDIC2, Tatoeba, jpdb, Wiktionary/kaikki, BCCWJ, Wikipedia freq, Core 2000/6000, JLPT lists, Kanshudo, jmdict-simplified)?

### Takeaway
The backbone for any static site is EDRDG's JMdict (≈219k entries, CC BY-SA 4.0, updated daily) consumed via scriptin/jmdict-simplified JSON (weekly builds; the `jmdict-eng-common` file is only 1.4 MB zipped / 22,644 entries), plus KANJIDIC2 and Tatoeba sentences. JLPT levels must come from community lists (Tanos/Waller CC-BY, repackaged by OpenJLPT CC BY-SA), and frequency from BCCWJ, Jiten.moe (CC BY-SA 4.0) or Kanjium (CC BY-SA 4.0); jpdb, Kanshudo and iKnow Core lists are proprietary/scraped and unsafe to bundle.

### Cited Findings

**Comparison table (summary; details and sources follow)**

| Dataset | Fields | Format / size | License | Maintenance | Notes |
|---|---|---|---|---|---|
| JMdict (EDRDG) | kanji, kana, POS, misc tags, EN + 8 EU-language glosses, priority tags, loanword source, cross-refs | XML; JMdict.gz 22.2 MB, JMdict_e.gz 10.6 MB, JMdict_e_examp.gz 13.1 MB (measured) | CC BY-SA 4.0 + EDRDG conditions (attribution on every screen, keep data updated) | Daily builds | No Chinese; no pitch; no audio; no JLPT |
| jmdict-simplified (scriptin) | same as JMdict, as clean JSON; `common` boolean | JSON zip: eng 11.5 MB (218,863 words), eng-common 1.4 MB (22,644 words), all-languages 25.1 MB (measured) | Data: EDRDG CC BY-SA 4.0; code CC BY-SA 4.0; npm types MIT | Automatic weekly release (latest 2026-10-05) | Best ingestion path for a static site |
| KANJIDIC2 | 13,108 kanji: on/kun, pinyin, Korean, Vietnamese, meanings, grade, strokes, freq rank (top 2,501), old 4-level JLPT | XML gz 1.49 MB (measured); JSON via jmdict-simplified 1.3–1.6 MB | CC BY-SA 4.0 (SKIP codes CC BY-NC-SA) | Daily builds | JLPT field is pre-2010 |
| Tatoeba | sentence pairs, per-language links, audio metadata | TSV bz2: jpn_sentences 3.4 MB (248,924 sentences), jpn-eng links 1.45 MB (280,716 links), jpn-cmn links 0.1 MB (16,218 links) (measured) | CC BY 2.0 FR (some CC0); audio per-contributor | Weekly (Saturday) | Quality uneven (Tanaka corpus origin) |
| Tanaka Corpus / JMdict examples | ~150k JP-EN pairs; ~31,400 sentences embedded in 28,700 JMdict entries | examples.utf.gz 9.7 MB; jmdict-examples-eng JSON 14.2 MB (measured) | CC BY 2.0 | Via Tatoeba | Linked to JMdict senses |
| Wiktionary via kaikki.org (en edition, Japanese) | word, pos, ruby forms, romaji, IPA, glosses (EN), examples, etymology, topics | JSONL 367 MB (175,023 words); file marked "DEPRECATED" | CC BY-SA / GFDL (Wiktionary) | Rebuilt from each dump (2026-10-03) | Large; glosses are prose |
| Wiktionary via kaikki.org (zh edition, 日語) | same structure, glosses in Chinese, pitch accent tags | JSONL 日語 89.9 MB + 日语 36.2 MB (measured); whole zh extract 234 MB gz | CC BY-SA / GFDL | Rebuilt 2026-10-02 | Only Chinese-gloss open source found |
| BCCWJ frequency lists (NINJAL) | lemma, reading, POS, frequency, pmw (per register) | ZIP (SUW/LUW ver1.0) | "free for research or educational purposes"; no explicit redistribution/commercial grant | Published 2011-era data; static | Legal ambiguity for a public site |
| Jiten.moe frequency dictionaries | frequency rank per media type (anime, drama, novels, …) | Yomitan zip + CSV | CC BY-SA 4.0 | Active (corpus of 16,924 titles) | Cleanest open frequency source |
| Kanjium | pitch accent (124,137 words), Wikipedia freq (20k), novels freq (285k) | TSV text | CC BY-SA 4.0 | Last commit 2026-10-03 | Pitch + freq in one repo |
| jpdb frequency (MarvNC / Kuuuube) | frequency rank from jpdb.io corpus | Yomitan zip / CSV | Not stated; scraped from jpdb.io | MarvNC list unmaintained; Kuuuube v2.2 updated 2024-10-13 | Legal status unclear |
| JLPT community lists (Tanos/Waller) | word, reading, level | HTML/CSV via mirrors | CC BY | Site "now defunct"; mirrors on GitHub | Approximation, not official |
| OpenJLPT (evanclan) | word, reading, meaning (JMdict), level (Waller), Tatoeba sentences, kanji (KANJIDIC2) | JSON per level, CSV, SQLite | CC BY-SA 4.0 with NOTICE | v0.1.0 (2026) | 7,811 words (README) vs 8,334 (PyPI) |
| Kanshudo | "usefulness" 1–12 for 260k words | Not downloadable | Proprietary; licensing on request | Active commercial | Do not scrape |
| iKnow Core 2000/6000 | 6,000 words in 60 collections | Anki decks circulate | Proprietary (no license found) | Commercial | Unsafe to bundle |

**JMdict / EDICT / JMdict_e (EDRDG)**
- JMdict is generated daily; the "full Unicode UTF8 version" JMdict.gz is "a big file", JMdict_e.gz has English translations only. — [EDRDG JMdict page](https://www.edrdg.org/jmdict/j_jmdict.html)
- The full file includes glosses in English, German (133,000 entries), Russian (80,000), Hungarian (51,000), Spanish (39,000), Dutch (29,000), Swedish (16,000), French (15,000) and Slovenian (9,000); Chinese is not included. Files available at ftp.edrdg.org/pub/Nihongo/: JMdict.gz, JMdict_e.gz, JMdict_b.gz (English, excluding ~7,000 names), JMdict_e_examp.gz (with Tanaka Corpus examples), legacy edict.gz/edict2.gz; "new versions of the files are generated daily". — [JMdict-EDICT Dictionary Project (local copy)](https://www.edrdg.org/wiki/JMdict-EDICT_Dictionary_Project.html)
- Measured sizes (HTTP HEAD, 2026-10-07, Last-Modified 2026-10-07): JMdict.gz 22,197,637 B; JMdict_e.gz 10,581,766 B; JMdict_e_examp.gz 13,074,587 B; kanjidic2.xml.gz 1,488,573 B; JMnedict.xml.gz 12,447,429 B; examples.utf.gz 9,699,687 B. — [ftp.edrdg.org/pub/Nihongo/](http://ftp.edrdg.org/pub/Nihongo/)
- Entry count: the English JSON build of 2026-10-05 contains 218,863 word entries (measured from jmdict-eng-3.6.2+20261005200550.json). — [jmdict-simplified releases](https://github.com/scriptin/jmdict-simplified/releases/latest). Jisho.org describes JMdict as "roughly 170 000 entries" (older figure). — [jisho.org/about](https://jisho.org/about)
- Priority tags per the DTD: news1/news2 from the "wordfreq" file compiled from Mainichi Shimbun (first 12,000 vs second 12,000); ichi1/ichi2 from "Ichimango goi bunruishuu" (ichi2 "demoted from ichi1 because they were observed to have low frequencies"); spec1/spec2 "small number of words … detected as being common"; gai1/gai2 common loanwords based on the wordfreq file; nfxx = frequency ranking where xx is "the number of the set of 500 words". Also lsource records "the source language(s) of a loan-word/gairaigo" with ls_type/ls_wasei attributes; re_restr restricts a reading to a subset of kanji forms; stagk/stagr restrict a sense; ke_inf/re_inf codes include ateji, ik, iK, oK. — [JMdict DTD documentation](https://www.edrdg.org/jmdict/jmdict_dtd_h.html)
- The "(P)" common subset is acknowledged as imperfect: "there are clearly some marked entries which are not very common". — [JMdict-EDICT Dictionary Project](https://www.edrdg.org/wiki/JMdict-EDICT_Dictionary_Project.html)
- The EDRDG MediaWiki was closed due to bot scraping; local HTML copies of documentation pages are at https://www.edrdg.org/wiki/*.html (e.g. JMdict_Getting_Started.html, KANJIDIC_Project.html, Tanaka_Corpus.html). — [EDRDG wiki index](https://www.edrdg.org/wiki/index.php/Main_Page)

**EDRDG licence (applies to JMdict, JMnedict, KANJIDIC2, examples)**
- "Creative Commons Attribution-ShareAlike Licence (V4.0)"; "there is NO restriction placed on commercial use of the files"; share-alike: "you may distribute the resulting work only under the same, similar or a compatible licence"; for web dictionary displays "the acknowledgement must be made on each screen display, e.g. in the form of a message at the foot of the screen or page"; "there must be a procedure for regular updating of the data from the most recent versions available"; users "must NOT claim copyright over that material". — [EDRDG licence](https://www.edrdg.org/edrdg/licence.html)

**jmdict-simplified (scriptin)**
- Converts JMdict, JMnedict, Kanjidic and KRADFILE/RADKFILE to JSON; JMdict language variants: all, eng, ger, rus, hun, dut, spa, fre, swe, slv, each with a "common-only" variant; "Releases are automatically scheduled for every Monday"; npm packages `@scriptin/jmdict-simplified-types` and `@scriptin/jmdict-simplified-loader` (MIT); requires Java 17 to rebuild. — [scriptin/jmdict-simplified](https://github.com/scriptin/jmdict-simplified)
- "Common" definition: an entry is common if it contains any of the priority markers "news1", "ichi1", "spec1", "spec2", "gai1"; "Only one such element is enough for the whole word to be considered common". — [README](https://raw.githubusercontent.com/scriptin/jmdict-simplified/master/README.md)
- Latest release 3.6.2+20261005200550 (2026-10-05) assets (measured via GitHub API): jmdict-all 25.1 MB, jmdict-eng 11.5 MB, jmdict-eng-common 1.4 MB, jmdict-examples-eng 14.2 MB, jmdict-ger 7.0 MB, jmdict-rus 3.9 MB, jmnedict-all 13.5 MB, kanjidic2-all 1.6 MB, kanjidic2-en 1.3 MB, kradfile/radkfile 0.1 MB (each as .json.zip and .json.tgz). — [releases/latest](https://github.com/scriptin/jmdict-simplified/releases/latest)
- Measured content of jmdict-eng-common (2026-10-05): 16.5 MB uncompressed JSON, 22,644 words, `commonOnly: true`; 3,626 entries have more than one kana reading; 4,462 entries have no kanji form; the `tags` map has 266 codes (e.g. "n": "noun (common) (futsuumeishi)", "v1": "Ichidan verb", "uk": "word usually written using kana alone", "ateji", "ik"). Full jmdict-eng: 118 MB uncompressed, 218,863 words; kanji/kana form tags counted: sK 15,629, rK 5,886, sk 5,076, ok 912, ateji 865, io 808, iK 603, oK 529, ik 397, gikun 340; 6,226 entries carry a `languageSource` (loanword) and 9,603 entries have the `uk` misc tag; exactly 22,644 entries have any `common: true` form. — measured from [release assets](https://github.com/scriptin/jmdict-simplified/releases/latest)
- JSON shape (measured, entry 1358280 食べる): `{id, kanji:[{common, text, tags}], kana:[{common, text, tags, appliesToKanji:["*"]}], sense:[{partOfSpeech:["v1","vt"], appliesToKanji, appliesToKana, related, antonym, field, dialect, misc, info, languageSource, gloss:[{lang:"eng", gender:null, type:null, text:"to eat"}]}]}`. — measured from [release assets](https://github.com/scriptin/jmdict-simplified/releases/latest)

**KANJIDIC2**
- 13,108 kanji (JIS X 0208 6,355 + JIS X 0212 5,801 + JIS X 0213 952); fields: grade (G1–G6, G8, G9–G10), stroke counts, frequency ranking ("The 2,501 most-used characters have a ranking" based on Mainichi Shimbun), JLPT levels in the "pre-2010 four-level system (1-4)", readings including pinyin, romanized Korean, hangul, Vietnamese; meanings in multiple languages via ISO 639-1 codes; licence CC BY-SA 4.0, SKIP codes CC BY-NC-SA 4.0. — [KANJIDIC Project](https://www.edrdg.org/wiki/KANJIDIC_Project.html)
- Caveat from the legacy index: "Don't assume anything is set in concrete if you use the file in a project." — [kanjd2index_legacy](https://www.edrdg.org/kanjidic/kanjd2index_legacy.html)

**Tatoeba / Tanaka Corpus**
- Export files: sentences, detailed sentences, CC0 sentences, links, tags, lists, Japanese indices (Tanaka Corpus format), sentences with audio, transcriptions; TSV "Sentence id [tab] Lang [tab] Text"; "Files provided below are updated every Saturday at 6:30 a.m. (UTC)"; most files "CC BY 2.0 FR", some sentences "CC0 1.0"; audio files have individual licences chosen by contributors; a custom exports tool produces per-language-pair files. — [Tatoeba downloads](https://tatoeba.org/en/downloads)
- Sentence counts: Japanese 249,202; Mandarin Chinese 89,279; English 2,046,963; Cantonese 20,855; Shanghainese 4,770; Min Nan 604. — [Tatoeba stats](https://tatoeba.org/en/stats/sentences_by_language)
- Measured (2026-10-07): jpn_sentences.tsv.bz2 3.42 MB / 248,924 lines; cmn_sentences.tsv.bz2 1.26 MB / 89,177 lines; jpn-eng_links.tsv.bz2 1.45 MB / 280,716 links covering 232,956 distinct Japanese sentences; jpn-cmn_links.tsv.bz2 0.10 MB / 16,218 links covering 14,990 distinct Japanese sentences; sentences.tar.bz2 218.9 MB; links.tar.bz2 150.0 MB; jpn_indices.tar.bz2 2.86 MB. — [downloads.tatoeba.org/exports/per_language/](https://downloads.tatoeba.org/exports/per_language/jpn/)
- Tanaka Corpus: "just over 150,000 sentence pairs" in the edited version (from 212,000 originally); CC-BY 2.0 since late 2009; "From June 2021 the sentences in the subset … have been included as examples in a special version of the JMdict"; ≈31,400 sentences embedded in 28,700 entries; quality problems: student-typed sentences with residual errors, textbook/exam sources, overly literal translations, archaic English; users "cautioned against statistical analyses". — [Tanaka Corpus](https://www.edrdg.org/wiki/Tanaka_Corpus.html)

**Wiktionary (kaikki.org)**
- English-edition Japanese extract: 175,023 distinct words, `kaikki.org-dictionary-Japanese.jsonl` 367.0 MB, labelled "DEPRECATED, will be removed in the near future" (per-language pages persist); extracted 2026-10-03 from the enwiktionary dump of 2026-09-02; citation requested: Ylonen, "Wiktextract: Wiktionary as Machine-Readable Structured Data" (LREC 2022). — [kaikki Japanese](https://kaikki.org/dictionary/Japanese/index.html)
- Measured JSONL record keys: pos, head_templates, forms (with `ruby` furigana pairs and a romanization form), etymology_text, sounds (ipa, kana), word, lang, lang_code, senses (glosses, raw_glosses, links, topics, synonyms). — measured from [kaikki.org-dictionary-Japanese.jsonl](https://kaikki.org/dictionary/Japanese/kaikki.org-dictionary-Japanese.jsonl)
- Raw data page: full enwiktionary raw JSONL 23.9 GB (2.8 GB gz); audio files 20.4 GB (~942,000 files, all languages); non-English editions include ja-extract.jsonl 426.5 MB (62.0 MB gz) and zh-extract.jsonl 1.9 GB (223.6 MB gz). — [kaikki raw data](https://kaikki.org/dictionary/rawdata.html)
- All content derives from Wiktionary under CC-BY-SA and GFDL. — [kaikki zhwiktionary index](https://kaikki.org/zhwiktionary/index.html)

**JLPT lists**
- Official position: the JLPT does not publish lists; "We believe that the ultimate goal of studying Japanese is to use the language to communicate rather than simply memorizing vocabulary, kanji and grammar items." — [JLPT FAQ](https://www.jlpt.jp/e/faq/index.html)
- Jisho.org's JLPT levels come from "Jonathan Waller's JLPT Resources page"; jisho also credits JMdict/KANJIDIC2/JMnedict/RADKFILE (EDRDG licence), Tatoeba (CC-BY 2.0), Jreibun (Tokyo University of Foreign Studies), WaniKani audio, KanjiVG (CC BY-SA 3.0), DBpedia. — [jisho.org/about](https://jisho.org/about)
- Tanos/Waller data "are licenced under Creative Commons 'BY'" (quoted in Bluskyo repo); the repo (MIT) converts tanos lists to JSON/CSV per level N1–N5 with fields kanji/hiragana, reading, level, preserving multiple readings per headword (e.g. 年: とし/ねん/とせ). — [Bluskyo/JLPT_Vocabulary](https://github.com/Bluskyo/JLPT_Vocabulary)
- A mirror describes the origin as "(now defunct) http://www.tanos.co.uk/jlpt/"; our DNS lookup of www.tanos.co.uk failed on 2026-10-07 (`getaddrinfo ENOTFOUND`). — [tanos-japanese-word-books mirror](https://git.nani.wtf/h7x4/tanos-japanese-word-books/src/commit/2bb0d90e8b1efe856b2f8aaa5c573e11f327dbb3)
- elzup/jlpt-word-list (MIT): CSV per level, all.csv 505k and all.min.csv 162k (expression + reading only), derived from jamsinclair/open-anki-jlpt-decks ← chyyran/jlpt-anki-decks ← tanos.co.uk. — [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list)
- OpenJLPT: levels from Waller's lists ("The Japan Foundation does not publish vocabulary, kanji or grammar lists for the current (post-2010) JLPT"); words/readings/meanings from JMdict, kanji from KANJIDIC2, sentences from Tatoeba "matched by dictionary form"; counts N5 674, N4 630, N3 1,659, N2 1,778, N1 3,070 (7,811 total); data in `data/json/`, `data/csv/`, `data/openjlpt.sqlite`; CC BY-SA 4.0 with NOTICE.md. — [evanclan/OpenJLPT](https://github.com/evanclan/OpenJLPT); PyPI v0.1.0 states "8,334 vocabulary words and 2,211 kanji" and "sentence pairs from Tatoeba on 89% of words" — [PyPI openjlpt](https://pypi.org/project/openjlpt/) (count conflicts with the README's 7,811)
- Other repos seen: AnchorI/jlpt-kanji-dictionary (kanji + vocab with English definitions and example sentences), davidluzgouveia/kanji-data (KANJIDIC JSON extended with updated JLPT levels and WaniKani data). — [search results](https://github.com/AnchorI/jlpt-kanji-dictionary), [kanji-data](https://github.com/davidluzgouveia/kanji-data)

**Yomitan ecosystem**
- yomitan.wiki recommends Jitendex (stephenmk/Jitendex), JMdict/JMnedict/KANJIDIC via yomidevs/jmdict-yomitan ("Daily automatically updated builds"), and BCCWJ / JPDB frequency dictionaries via Kuuuube/yomitan-dictionaries. — [yomitan.wiki/dictionaries](https://yomitan.wiki/dictionaries/)
- Jitendex is "A free and openly licensed Japanese-to-English dictionary", formats Yomitan and MDict, "Updated versions … published at least once a month", code AGPL-3.0. — [stephenmk/Jitendex](https://github.com/stephenmk/Jitendex); data released under "a Creative Commons Attribution-ShareAlike 4.0 License", built on EDRDG's JMdict; works in GoldenDict-ng, Yomitan, MDict (with audio). — [jitendex.org](https://jitendex.org/)
- MarvNC/yomitan-dictionaries lists frequency dictionaries JPDB_v2.1, jiten_freq_global, Freq_CC100, BCCWJ-LUW; pitch dictionaries NHK2016 and JPDB Kanji; many commercial monolingual dictionaries (大辞泉, 大辞林, 岩波, etc.) that are copyrighted conversions; and Mandarin ZH-EN / ZH-JA / ZH-ZH term dictionaries. — [MarvNC/yomitan-dictionaries](https://github.com/MarvNC/yomitan-dictionaries)

**Kanshudo and iKnow Core**
- Kanshudo's "collections, kanji and word usefulness data … are copyright Kanshudo and may not be downloaded, scraped, distributed, copied or used outside Kanshudo except for personal study without express permission"; data "available to license" on request; usefulness score 1–12 across 260,000 words; top-10,000 collection. — [Kanshudo T&C](https://www.kanshudo.com/tc), [Kanshudo usefulness blog](https://www.kanshudo.com/blog/usefulness)
- iKnow! Core list: "6000 of the most useful words in Japanese", 60 collections; no origin/licence information given. — [Kanshudo iKnow blog](https://www.kanshudo.com/blog/iknow)

### Inferences
- For a GitHub Pages site, the lowest-risk stack is: `jmdict-eng-common` JSON (22,644 entries, 1.4 MB zipped) or a custom filter of `jmdict-eng` + `kanjidic2-en` + Tatoeba jpn-eng/jpn-cmn pair TSVs + OpenJLPT level tags + Jiten.moe or Kanjium frequency. All are CC BY-SA 4.0 / CC BY, so the site's data layer can be published under CC BY-SA 4.0 with a footer credit on every page (EDRDG requires per-screen acknowledgement).
- Weekly jmdict-simplified releases satisfy EDRDG's "regular updating" condition if the site has a scheduled rebuild (e.g. GitHub Actions cron pulling the latest release).
- The jmdict-eng-common count (22,644) equals the number of entries with any `common` form, so "common" is purely the pri-tag subset; it does not rank entries. Ranking requires an external frequency list (Question 3).

### Gaps
- EDRDG does not publish an official current entry count on the project page; the 218,863 figure is measured from the 2026-10-05 JSON build.
- OpenJLPT's word total conflicts between README (7,811) and PyPI (8,334); not resolved.
- No licence statement found for iKnow Core 2000/6000 lists; treat as proprietary.
- Could not access tanos.co.uk directly (DNS failure); CC-BY claim is from mirrors quoting the site.

## Key Question 2: Which sources include Traditional or Simplified Chinese glosses? Are there open Japanese–Chinese dictionaries?

### Takeaway
No major open Japanese dictionary (JMdict, KANJIDIC2 word-level, Jitendex, JLPT repos) carries Chinese glosses; the only sizeable open Japanese→Chinese gloss source found is the Chinese-edition Wiktionary extract on kaikki.org (日語 ≈71k senses / 90 MB JSONL plus a 日语 variant ≈93k senses / 36 MB, CC BY-SA), supplemented by Tatoeba's ~16k Japanese–Mandarin sentence links (mixed Traditional/Simplified). Commercial JP–ZH dictionaries (Weblio, 小學館, EDR) are not open.

### Cited Findings
- JMdict gloss languages are English, German, Russian, Hungarian, Spanish, Dutch, Swedish, French, Slovenian; "Chinese is not included." — [JMdict-EDICT Dictionary Project](https://www.edrdg.org/wiki/JMdict-EDICT_Dictionary_Project.html); jmdict-simplified language codes likewise list only all/eng/ger/rus/hun/dut/spa/fre/swe/slv. — [scriptin/jmdict-simplified](https://github.com/scriptin/jmdict-simplified)
- KANJIDIC2 includes pinyin readings for kanji (character level only, not word glosses). — [KANJIDIC Project](https://www.edrdg.org/wiki/KANJIDIC_Project.html)
- kaikki.org zhwiktionary extract (dump 2026-10-01, processed 2026-10-02) lists Japanese under two names: "日語" (70,959 senses) and "日语" (93,376 senses); content is CC-BY-SA and GFDL. — [kaikki zhwiktionary](https://kaikki.org/zhwiktionary/index.html)
- Measured download URLs (2026-10-07): https://kaikki.org/zhwiktionary/日語/kaikki.org-dictionary-日語.jsonl (89,915,340 B) and https://kaikki.org/zhwiktionary/日语/kaikki.org-dictionary-日语.jsonl (36,217,947 B); whole-edition raw file https://kaikki.org/zhwiktionary/raw-wiktextract-data.jsonl.gz (234,452,181 B, same as downloads/zh/zh-extract.jsonl.gz). Sample record: `word: 英語, lang: 日語, pos: noun, senses[0].glosses: ["英語"], sounds: [{tags:["Heiban"], raw_tags:["東京"], other:"えーご", roman:"[èégó]"}, {ipa:"[e̞ːɡo̞]"}], forms: [{form:"英語", tags:["canonical"], ruby:[["英","えい"],["語","ご"]]}]`. — measured from [kaikki zhwiktionary 日語 JSONL](https://kaikki.org/zhwiktionary/%E6%97%A5%E8%AA%9E/kaikki.org-dictionary-%E6%97%A5%E8%AA%9E.jsonl)
- Tatoeba: 16,218 jpn–cmn links covering 14,990 distinct Japanese sentences (measured); Mandarin corpus 89,177 sentences, of which a sample-character test found 18,375 lines containing common Traditional characters and 20,474 containing Simplified counterparts (i.e. the cmn corpus mixes scripts and is not Taiwan-specific). — measured from [Tatoeba per-language exports](https://downloads.tatoeba.org/exports/per_language/cmn/); Tatoeba also offers a "Transcriptions" export of alternative scripts for select languages. — [Tatoeba downloads](https://tatoeba.org/en/downloads)
- Weblio 日中中日辞典 (~1.6 million words), 小学館 中日・日中辞典 and 白水社 dictionaries appear only as commercial apps/services; no open-data licence found. — [search results](https://cjjc.weblio.jp/content/%E8%AF%8D%E5%85%B8)
- NICT's EDR Japanese–Chinese bilingual dictionary: users may copy/modify "非営利目的での使用に限り" and must not redistribute without permission; contract by fax/email; cost not published. — [EDR purchasing guide](https://www2.nict.go.jp/ipp/EDR/ENG/E-Guide/Guide_Ae.html)
- MarvNC's collection has Mandarin "ZH-JA" term dictionaries, but these are Chinese-headword dictionaries (wrong direction) in a collection that also carries copyrighted conversions. — [MarvNC/yomitan-dictionaries](https://github.com/MarvNC/yomitan-dictionaries)
- GitHub searches for Traditional-Chinese JLPT vocabulary JSON returned only English-gloss repos (OpenJLPT, Bluskyo, AnchorI, jlpt_kanji_json_msgpack). — [search results](https://github.com/Bluskyo/JLPT_Vocabulary)

### Inferences
- A practical Traditional-Chinese gloss pipeline: join JMdict entries to zhwiktionary 日語/日语 records by (kanji form, kana reading); where no zh gloss exists, fall back to the English JMdict gloss or to a machine translation generated offline at build time and clearly marked. Expect Traditional/Simplified mixing in zhwiktionary glosses; an OpenCC s2twp conversion step at build time is advisable.
- Tatoeba jpn–cmn pairs (~15k) can supply example sentences with Chinese translations for only a fraction of the core 2k–6k words; jpn–eng (233k Japanese sentences) is far richer.

### Gaps
- No open Japanese→Traditional-Chinese word list of learner-grade quality (e.g. MOE Taiwan) was found; the Taiwan MOE dictionaries are Chinese-monolingual and were not evaluated.
- Exact Traditional vs Simplified split in zhwiktionary Japanese glosses not quantified.

## Key Question 3: Which sources provide frequency information to select a finite "top N" set?

### Takeaway
Open, redistributable frequency ranks come from Jiten.moe (CC BY-SA 4.0, 16,924 media titles, per-media CSVs), Kanjium's Wikipedia (20k) and novels (285k) lists (CC BY-SA 4.0), and Wiktionary's Wikipedia-based 20k lists; BCCWJ is the most authoritative but its terms only clearly permit research/education use; jpdb-derived lists are scraped and unlicensed; the JMdict pri tags give a 22,644-entry "common" subset but no ranking beyond the nfxx 500-word bands.

### Cited Findings
- **JMdict priority bands**: nfxx values indicate the 500-word frequency band from the Mainichi wordfreq file; news1 = first 12,000 words, news2 = second 12,000; ichi1/2 from Ichimango goi bunruishuu; gai1/2 loanword frequency. — [JMdict DTD](https://www.edrdg.org/jmdict/jmdict_dtd_h.html); 22,644 entries carry a common form (measured). — [jmdict-simplified releases](https://github.com/scriptin/jmdict-simplified/releases/latest)
- **BCCWJ (NINJAL)**: files BCCWJ_frequencylist_suw_ver1_0.zip (short unit), luw_ver1_0.zip (long unit), luw2_ver1_0.zip (freq ≥ 2), pos and wtype composition tables, manual PDF; records include lemma, reading, POS, frequency and pmw; terms on the page: "研究、教育目的であれば無償で自由にお使いになれます" ("free for use for research or educational purposes"); detailed terms deferred to the manual; hosted via DOI links. — [BCCWJ freq-list (ja)](https://clrd.ninjal.ac.jp/bccwj/freq-list.html), [BCCWJ freq-list (en)](https://clrd.ninjal.ac.jp/bccwj/en/freq-list.html), [manual PDF](https://clrd.ninjal.ac.jp/bccwj/data-files/frequency-list/BCCWJ_frequencylist_manual_ver1_0.pdf)
- BCCWJ Yomitan conversion script (toasted-nutbread, MIT for the script) handles SUW and LUW, excludes POS, and takes a minimum-frequency filter. — [yomichan-bccwj-frequency-dictionary](https://github.com/toasted-nutbread/yomichan-bccwj-frequency-dictionary); Kuuuube redistributes "BCCWJ_SUW_LUW_combined.zip" built from it. — [Kuuuube/yomitan-dictionaries](https://github.com/Kuuuube/yomitan-dictionaries)
- **Jiten.moe**: 12 categories (Global, Anime, Audio, Drama, Manga, Movie, Non-Fiction, Novel, Video Game, Visual Novel, Web Novel, YouTube, plus Kanji); corpus "3,400,067,326 characters across 16,924 titles"; each list as Yomitan zip and plain CSV; "licensed under CC BY-SA 4.0"; notes "The frequency of words can change dramatically depending on the corpus they come from". — [jiten.moe/frequency-dictionaries](https://jiten.moe/frequency-dictionaries)
- **jpdb**: MarvNC's list has "over 47 万 entries", "covers about 96% of the top 20,000 entries on JPDB", marks kana-only readings with ㋕; "no longer actively maintained" because "jpdb now limits the total amount of entries that can be in a single deck"; recommends Kuuuube's newer version. — [MarvNC/jpdb-freq-list](https://github.com/MarvNC/jpdb-freq-list). Kuuuube JPDB v2.2: "Frequency list scraped from JPDB's enormous corpus of Japanese media", coverage "99.99% up to 25,000 entries; 99.5% up to 70,000", last updated 2024-10-13, CSV available; no licence stated. — [Kuuuube/yomitan-dictionaries](https://github.com/Kuuuube/yomitan-dictionaries). jpdb's corpus is light novels, visual novels, anime and J-drama; CC100 (internet text) ranks formal words higher (e.g. 審議会: CC100 #9,733 vs JPDB #58,730). — [jiten.moe/other](https://jiten.moe/other)
- **Kanjium**: wikipedia_freq.txt (20,001 lines, header "#source: http://shang.kapsi.fi/kanji/jawp-mecab-words.csv", format `する\t138279`) and novels_freq.txt (285,719 lines, source a koohii forum post, format `要る\t2765701`), both CC BY-SA 4.0; last commit 2026-10-03. — measured from [mifunetoshiro/kanjium](https://github.com/mifunetoshiro/kanjium)
- **Wiktionary frequency lists**: Wikipedia-based lists for 2013 (JUMAN), 2015 (MeCab) and 2022 (kagome), each 1–10,000 and 10,001–20,000; also "Appendix:1000 Japanese basic words", "5000 most common words", and links to Leipzig Corpora, OpenSubtitles word lists, Leeds corpus, BCCWJ/Tsukuba; licences CC BY 4.0 / CC BY-SA 4.0; caveat that analyzer differences change rankings. — [Wiktionary:Frequency_lists/Japanese](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Japanese)
- **Subtitle / media lists**: community lists include "Japanese Subtitles Word Frequency List mined from 12,177 subtitle files", OhTalkWho's Netflix/Shonen/Slice-of-Life/Novel lists, Innocent Corpus (~5,000 novels; "does not differentiate based on reading"). — [WaniKani thread](https://community.wanikani.com/t/searching-for-a-good-frequency-list/44733), [MarvNC/JP-Resources](https://github.com/MarvNC/JP-Resources/blob/main/readme.md)
- **CEJC** (spoken corpus) Yomitan frequency dictionary exists. — [CEJC_yomichan_freq_dict](https://github.com/forsakeninfinity/CEJC_yomichan_freq_dict)

### Inferences
- Kanjium's novels_freq.txt (285k entries, "5,000 novels") very likely is the same data circulated as "Innocent Corpus"; via Kanjium it is available under CC BY-SA 4.0, which resolves the Innocent Corpus licence question in practice (inference, not confirmed by either project).
- For a Taiwan adult learner with general goals, a blended rank (BCCWJ-style general + Jiten.moe Global + Wikipedia 20k) will be more balanced than jpdb (fiction-skewed). If BCCWJ terms are a concern, Jiten.moe + Kanjium alone are sufficient and clearly licensed.
- Headword normalisation is the main engineering risk: frequency lists key on surface form (and sometimes reading); JMdict entries have multiple kanji/kana forms, so join on all forms and take the best rank.

### Gaps
- BCCWJ's precise redistribution/commercial terms were not retrievable (manual PDF not parsed); a search snippet asserted that BCCWJ newspaper-derived statistics are not for commercial use, but no primary URL was captured, so treat as unverified.
- jpdb.io's own terms of service regarding scraped frequency data were not located; Innocent Corpus has no primary licence page.

## Key Question 4: Which sources include audio, or a free, static-site-compatible way to get it?

### Takeaway
No open word-level Japanese audio dataset aligned to JMdict was found; the realistic static-site options are the browser's Web Speech API (ja-JP voices, zero cost, no key), pre-generating MP3s offline with VOICEVOX (free incl. commercial with "VOICEVOX:character" credit) and bundling them, or Tatoeba sentence audio (only ~6.3k Japanese sentences, mostly unlicensed/NC). JapanesePod101 audio is explicitly exclusive to EDICT/JapanesePod101, and Forvo requires a paid key-based API.

### Cited Findings
- JapanesePod101: "The audio was created for EDICT and Japanesepod101 use exclusively. The content is not available for use at this time." — [EDRDG mailing list, 2014](https://www.edrdg.org/jmdict_edict_list/2014/msg00068.html)
- Forvo API plans: Non-Profit $2.00/month, "500 requests/day", "No commercial use"; Commercial Small Business $28.95/month, 10,000 requests/day; Corporate custom; caching/redistribution and key handling not stated on the plans page. — [api.forvo.com](https://api.forvo.com/)
- VOICEVOX terms: generated audio "商用・非商用問わず利用することができます"; "ご利用の際は VOICEVOX を利用したことがわかるクレジット表記が必要です"; redistribution of the software prohibited; individual voice-library terms also apply. — [VOICEVOX terms](https://voicevox.hiroshiba.jp/term/). Secondary sources state the credit format "VOICEVOX:キャラクター名", that credit-free commercial use costs ¥400,000 per character, and that redistribution/sale of generated audio as material is prohibited. — [crystal-method blog](https://crystal-method.com/blog/voicevox-commercial/)
- Web Speech API: speech synthesis available in Chrome, Firefox, Safari and Edge; `getVoices()` returns voices with a language tag such as "ja-JP" (e.g. Apple's "Kyoko"/"Otoya"); voices come from the OS or the browser's cloud. — [MDN Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API), [flaviocopes](https://flaviocopes.com/speech-synthesis-api/)
- Tatoeba audio: 1,241,052 audio rows overall; Japanese: 6,420 rows / 6,332 distinct sentences, licences: blank/unspecified 5,111, CC BY-NC 4.0 1,282, CC BY 4.0 27; top contributor "CVjpn1" 4,111; Mandarin: 5,825 rows (5,741 blank, 84 CC BY-NC 4.0) (measured from sentences_with_audio.tar.bz2, 6.39 MB). — [Tatoeba downloads](https://tatoeba.org/en/downloads)
- Jisho.org's audio comes from WaniKani (Tofugu), i.e. proprietary. — [jisho.org/about](https://jisho.org/about)
- Jitendex's MDict build "contains audio" (source not stated). — [jitendex.org](https://jitendex.org/)
- kaikki.org offers Wiktionary audio files (20.4 GB, ~942,000 files across all languages). — [kaikki raw data](https://kaikki.org/dictionary/rawdata.html)

### Inferences
- For GitHub Pages, Web Speech API is the only zero-asset option; quality varies by OS (Windows ships Haruka/Ichiro/Sayaka; iOS Kyoko). Pre-rendering ~6k words with VOICEVOX at ~30–50 KB per MP3 would add roughly 200–300 MB, likely too big for a single Pages repo (1 GB soft limit), so use TTS-on-device or host audio separately.
- Tatoeba Japanese audio is too sparse and mostly non-commercial/unlicensed for bundling.

### Gaps
- Forvo's terms on caching downloaded MP3s were not retrieved; a client-side key would be exposed on a static site in any case.
- No count of Japanese-language Commons/Wiktionary pronunciation files was obtained.

## Key Question 5: Which sources include pitch accent data?

### Takeaway
Kanjium (CC BY-SA 4.0; 124,137 words; TSV `headword \t reading \t accent positions`) is the only clearly open pitch-accent dataset and is what Yomichan/Yomitan built on; Wiktionary/kaikki records also carry Tokyo pitch tags (Heiban etc.) for many words; NHK 2016 and Daijirin pitch dictionaries circulate as unlicensed conversions of copyrighted works, and Wadoku's data is non-commercial.

### Cited Findings
- Kanjium: accents.txt "containing pitch accent mora locations for 124,137 words"; CC BY-SA 4.0: "You are free to use or modify the data however you like (for commercial or non-commercial purposes)". — [mifunetoshiro/kanjium](https://github.com/mifunetoshiro/kanjium)
- Measured format (first lines): `１\tいち\t2`, `１\tひと\t0,2`, `１０月\tじゅうがつ\t4,0`, `１対１\tいちたいいち\t3,2` — three tab-separated columns: headword, kana reading, comma-separated accent (downstep mora) numbers, 124,137 lines; repo last commit 2026-10-03. — measured from [accents.txt](https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt)
- Yomichan's pitch accent source is Kanjium; its legal notice credits "Uros Ozvatic through his free database". — [Yomichan commit](https://git.foosoft.net/alex/yomichan/commit/d792d89f6d4c8c86082b446ad0e2d64aca668e20)
- MarvNC's collection lists "NHK2016" and "JPDB Kanji" pitch dictionaries alongside commercial dictionary conversions, with a caution to verify licensing. — [MarvNC/yomitan-dictionaries](https://github.com/MarvNC/yomitan-dictionaries)
- zhwiktionary Japanese records include `sounds` with `tags:["Heiban"]`, `raw_tags:["東京"]`, kana and romanized pitch notation (e.g. 英語 `[èégó]`). — measured from [kaikki zhwiktionary 日語 JSONL](https://kaikki.org/zhwiktionary/%E6%97%A5%E8%AA%9E/kaikki.org-dictionary-%E6%97%A5%E8%AA%9E.jsonl)
- Wadoku operates under a non-commercial licence; commercial integration requires contacting them. — [search results (nani app commit, Skritter forum)](https://git.lepiller.eu/nani/app/commit/d84e60aab90afe23ffaf5816cd31d0226d1a5f72)

### Inferences
- Kanjium joins to JMdict on (kanji form, reading); JMdict's multiple readings mean the join must be per reading, and Kanjium's comma lists mean several acceptable accents per reading.

### Gaps
- NHK accent dictionary data has no open licence; the "NHK2016" Yomitan file is an unofficial conversion and should not be bundled.
- Coverage overlap between Kanjium and the JMdict common subset was not measured.

## Key Question 6: Practical gotchas (XML entities, entry sizes, filtering by pri tags, loanwords, multiple readings, JSON shape)

### Takeaway
Use jmdict-simplified JSON to avoid XML entity expansion and get a `common` flag, `languageSource` (loanword) and `uk` (kana-only) metadata; expect ~22.6k common entries, 3.6k of them with multiple readings and 4.5k kana-only; apply ShareAlike and per-page attribution.

### Cited Findings
- JMdict XML uses DTD entities for over 150 POS/misc/field codes (e.g. &n;, &v5r;, &adj-i;, &uk;, &arch;, &comp;), plus ke_inf/re_inf codes (&ateji;, &ik;, &iK;, &oK;), re_restr, stagk/stagr and lsource with ls_wasei. — [JMdict DTD](https://www.edrdg.org/jmdict/jmdict_dtd_h.html)
- jmdict-simplified exists because JSON "replaces problematic XML features", gives "regular structure", avoids `null`s and uses readable field names; `common` = any of news1/ichi1/spec1/spec2/gai1. — [README](https://raw.githubusercontent.com/scriptin/jmdict-simplified/master/README.md)
- Measured in the 2026-10-05 build: jmdict-eng-common 22,644 words (16.5 MB JSON, 1.4 MB zipped); 3,626 with >1 kana reading; 4,462 without kanji; full jmdict-eng 218,863 words (118 MB JSON); 6,226 entries with `languageSource` (loanword origin, suitable for a katakana-loanword category); 9,603 with `uk`; form tags sK (search-only kanji) 15,629, rK (rare kanji) 5,886, sk 5,076 indicate forms that should be hidden from learners. — measured from [release assets](https://github.com/scriptin/jmdict-simplified/releases/latest)
- `appliesToKanji: ["*"]` on kana and sense elements encodes JMdict's re_restr/stagk restrictions; the sense object carries `partOfSpeech`, `misc`, `field`, `dialect`, `languageSource`, `gloss[{lang,text}]`. — measured sample above
- EDRDG conditions: acknowledgement "on each screen display", regular updating procedure, no copyright claim over the data, ShareAlike on derivatives, commercial use allowed. — [EDRDG licence](https://www.edrdg.org/edrdg/licence.html)
- KANJIDIC2's JLPT field is the pre-2010 4-level scale; the 2,501-character frequency rank is newspaper-based. — [KANJIDIC Project](https://www.edrdg.org/wiki/KANJIDIC_Project.html)
- Tanaka/Tatoeba examples contain residual student errors and literal translations; the JMdict_e_examp build links ~31,400 curated sentences to 28,700 entries (a safer subset than raw Tatoeba). — [Tanaka Corpus](https://www.edrdg.org/wiki/Tanaka_Corpus.html)
- Tatoeba cmn corpus mixes Traditional and Simplified script (sample-character test: 18,375 vs 20,474 lines). — measured from [cmn_sentences.tsv.bz2](https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2)
- kaikki's per-language Japanese JSONL is flagged deprecated; the stable path is the raw per-edition extracts (en all-languages 2.8 GB gz; zh 234 MB gz; ja 62 MB gz). — [kaikki raw data](https://kaikki.org/dictionary/rawdata.html)

### Inferences
- Build pipeline suggestion: (1) download jmdict-eng (or jmdict-all for future languages) weekly; (2) filter `common` or join a frequency rank and keep top N; (3) drop sK/sk/rK forms; (4) for `uk` senses display kana as the headword; (5) categorise loanwords by `languageSource` or by katakana-only headword; (6) attach OpenJLPT level, Kanjium accent, zhwiktionary Chinese gloss and Tatoeba jpn-cmn/jpn-eng sentences; (7) emit per-level or per-chunk JSON (≤1–2 MB each) for the static site.
- Because the data layer is CC BY-SA, keep the site's generated data files under CC BY-SA 4.0 and add a footer credit (EDRDG, Tatoeba, Waller/OpenJLPT, Kanjium, Jiten.moe, Wiktionary) on every page.

### Gaps
- Yomitan term-bank JSON schema was not examined; converting Yomitan zips (Jiten.moe, Kuuuube) requires reading the v3 schema in yomidevs/yomitan.

## Key Question 7: Verified download links and repositories

### Takeaway
All links below returned HTTP 200 or were listed on a primary page on 2026-10-07.

### Cited Findings
- JMdict/KANJIDIC2/JMnedict/examples: http://ftp.edrdg.org/pub/Nihongo/JMdict.gz, JMdict_e.gz, JMdict_e_examp.gz, kanjidic2.xml.gz, JMnedict.xml.gz, examples.utf.gz (measured HEAD 200). — [EDRDG](https://www.edrdg.org/wiki/JMdict-EDICT_Dictionary_Project.html)
- jmdict-simplified JSON: https://github.com/scriptin/jmdict-simplified/releases/latest (asset pattern `jmdict-eng-common-<tag>.json.zip`). — [releases](https://github.com/scriptin/jmdict-simplified/releases/latest)
- Yomitan daily JMdict builds: https://github.com/yomidevs/jmdict-yomitan. — [yomitan.wiki](https://yomitan.wiki/dictionaries/)
- Tatoeba: https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2, …/jpn/jpn-eng_links.tsv.bz2, …/jpn/jpn-cmn_links.tsv.bz2, …/cmn/cmn_sentences.tsv.bz2, https://downloads.tatoeba.org/exports/sentences_with_audio.tar.bz2, …/jpn_indices.tar.bz2 (all HEAD 200). — [Tatoeba downloads](https://tatoeba.org/en/downloads)
- kaikki Japanese (en edition): https://kaikki.org/dictionary/Japanese/kaikki.org-dictionary-Japanese.jsonl; zh edition: https://kaikki.org/zhwiktionary/日語/kaikki.org-dictionary-日語.jsonl and …/日语/kaikki.org-dictionary-日语.jsonl; raw: https://kaikki.org/zhwiktionary/raw-wiktextract-data.jsonl.gz. — [kaikki](https://kaikki.org/dictionary/rawdata.html)
- BCCWJ: https://clrd.ninjal.ac.jp/bccwj/freq-list.html (DOI-linked ZIPs). — [NINJAL](https://clrd.ninjal.ac.jp/bccwj/freq-list.html)
- Jiten.moe frequency CSV/Yomitan: https://jiten.moe/frequency-dictionaries. — [Jiten](https://jiten.moe/frequency-dictionaries)
- Kanjium: https://github.com/mifunetoshiro/kanjium (data/source_files/raw/accents.txt, wikipedia_freq.txt, novels_freq.txt). — [Kanjium](https://github.com/mifunetoshiro/kanjium)
- JLPT: https://github.com/evanclan/OpenJLPT, https://github.com/Bluskyo/JLPT_Vocabulary, https://github.com/elzup/jlpt-word-list. — [OpenJLPT](https://github.com/evanclan/OpenJLPT)
- Frequency dictionaries (Yomitan): https://github.com/Kuuuube/yomitan-dictionaries, https://github.com/MarvNC/yomitan-dictionaries, https://github.com/MarvNC/jpdb-freq-list (unmaintained), https://github.com/toasted-nutbread/yomichan-bccwj-frequency-dictionary. — [Kuuuube](https://github.com/Kuuuube/yomitan-dictionaries)
- Jitendex: https://github.com/stephenmk/Jitendex, https://jitendex.org. — [Jitendex](https://jitendex.org/)
- Wiktionary frequency lists: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Japanese. — [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Japanese)

### Inferences
- None beyond the above.

### Gaps
- www.tanos.co.uk did not resolve; rely on GitHub mirrors (Bluskyo, elzup, OpenJLPT) for the Waller lists.
- yomidevs/jmdict-yomitan and Kuuuube asset URLs were not individually HEAD-checked.
