# CLAUDE.md — lumen-log

Claude Code がこのリポジトリで作業する際の恒久的な前提。毎セッション読み込まれる。
※このファイルはコミットされる。秘密情報・資産の実額・健康データの絶対値はここに書かない。
※より詳しい記事執筆ガイドは Obsidian `30_projects/サイト運営/ブログ/lumen-log-記事執筆-基本セット.md`。技術の最新状態は `10_frames/本日の作業まとめ_YYYYMMDD.md` が権威。

---

## 1. 位置づけ

「夜勤医師 × 投資家 × セルフ最適化マニア」の一次情報サイト（lumen-log.com）。SEO資産として運用。
属人性が差別化の核。トーンは「悶々とする救急医の静かな記録」。

| 媒体 | 役割 |
|------|------|
| X | 日次速報・リアルタイム |
| note（連載小説「Lumen」含む） | 構造化考察・非医療読者への入口 |
| **lumen-log（本サイト）** | **残る情報・検索・一次情報** |

掲載基準：半年後も価値がある / 自分にしか書けない一次情報がある / 検索需要がある。

## 2. 著者プロファイル（トーン・内容判断の前提）

- 救急医・30代後半・夜勤あり。妻＋幼児2人。
- サイドFIRE志向（完全リタイアではなく「選択できる状態」）。投資：マクロ重視・個別株（グロース/資源/金融）・ショート併用。
- 思考スタイル：構造思考・因果重視・ドメイン横断。
- **著者は文章を書くのが得意ではない**。価値は「経験・思考・判断」にある。文章の巧拙より一次情報・構造を優先。

---

## 3. 技術スタック（変更厳禁の前提）

- Next.js 15（App Router）/ TypeScript
- スタイル: Tailwind CSS v4（CSS-first / `@theme` トークン）
- チャート: **Recharts のみ**（`recharts@^3.x`）。Chart.js は撤去済み
- MDX: **ビルド時パイプライン**（ランタイム MDX ではない）。`next-mdx-remote` は旧構成・現存しない
- デプロイ: OpenNext → Cloudflare Workers。**main への push が自動デプロイのトリガー**
- リポジトリ: github.com/minminmiyoshi/lumen-log ／ ローカル: `~/lumen-log`

## 4. 絶対ルール

1. チャートは **Recharts**。Chart.js / 他チャートライブラリを再導入しない（`<NightShiftChart>` も内部は Recharts 実装。名前に惑わされて Chart.js を入れない）。
2. スタイルは Tailwind v4 の `@theme` トークン経由。色のベタ書き・任意値の乱用を避ける。
3. MDX はランタイム処理しない。必ず build-time パイプラインを通す。
4. **記事の frontmatter に `zone` を必ず入れる**（`health` か `money`）。無いと記事ページが生成されず **404**。
5. **push 前に必ず `npm run build`**（`build-posts.mjs` だけでは記事ページが生成されない。理由は §6）。
6. ブランチは切らない。**main に直接**作業・コミット。
7. 人間の規律ではなく**ビルドで強制**する。必須項目欠落はビルドを失敗させる方向で実装する。

---

## 5. ディレクトリ / zone構造（3層）

- `/health/` — 夜勤労働者向けコンテンツ＋ツール。記事は `/health/blog/[slug]`
  - `/health/tools/shift-damage-score/` — シフトダメージスコアラー（完成。Canvas API で PNG DL＋X シェア）
  - 健康管理ダッシュボード（Garmin・体組成・ワークアウト）、当直入力フォーム（`/tools/oncall`）
- `/money/` — 資産形成・FIRE・ポートフォリオ・資産シミュレーター。記事は `/money/blog/[slug]`
- `/about/` — プロフィール / 世界観（`/about/privacy`、`/about/contact`）

zone-based routing のため、記事の所属 zone（health/money）がそのまま URL に効く。

## 6. MDXパイプライン & 記事公開フロー（壊さない・順序厳守）

- `scripts/build-posts.mjs` が MDX → HTML をビルド時変換し `data/posts.json`（toc・components・html 含む）を生成
- JSX は `<div data-mdx-placeholder>`＋props(JSON) として抽出され `MdxRenderer.tsx` がクライアントでハイドレート
- **`build-posts.mjs` は posts.json を更新するだけ。記事ページの静的生成（`generateStaticParams`）は `npm run build` が担う** → これを忘れると本番で記事が出ない（最頻の事故）

必須 frontmatter：
```yaml
title: "..."
date: "2026-06-20"
tags: ["夜勤","睡眠"]
category: "night-shift"   # investment/fire/medicine/health/real-estate/life/night-shift
zone: "health"            # ★必須。health または money。無いと404
published: false          # 公開直前に true
description: "..."        # 推奨（OGP・RSS・検索の説明文）
```

公開手順（コマンドは1行ずつ実行。`#`コメント混在で zsh が command not found を出すため）：
```bash
cp ~/Downloads/[file].mdx ~/lumen-log/posts/
cd ~/lumen-log
node scripts/build-posts.mjs
sed -i '' 's/^published: false$/published: true/' posts/[file].mdx
node scripts/build-posts.mjs
npm run build 2>&1 | grep "[slug]"   # /health/blog/[slug] が出れば静的生成成功
git add -A && git commit -m "post: [タイトル]" && git push origin main
```
公開後：`curl -s "https://lumen-log.com/health" | grep "[slug]"` で本番反映を確認。

## 7. カスタムMDXコンポーネント

- `<NightShiftChart type="bar|horizontalBar|line" labels={...} datasets={...} caption="..." height={...} />`
  **props はバッククォート記法必須**：`labels={`["A","B"]`}`。シングルクォートだとパーサーが拾わず components:0 になる
- `<ArticleDiagram variant="..." caption="..." />` — 記事固有SVGフロー図。新 variant は `app/components/mdx/ArticleDiagram.tsx` に関数追加＋VARIANTS登録。型は `() => React.ReactElement`（React 19 で `JSX.Element` は不可）
- `<Callout type="info|tip|warn|danger">...</Callout>` — 1記事1〜2個まで
- `<StockChart symbol="NVDA" note="..." />`

自動適用（執筆者は書くだけ）：目次(h2/h3抽出)、参考文献の `<details>` 折りたたみ、図のスクロールフェードイン、関連記事の自動表示。

---

## 8. 記事の品質基準・文体

- 文体：**だ・である調**。医療者に正確かつ教養ある一般人に理解可能（過度に平易化しない＝深さで差別化）
- 標準構成：**機序解説 ＋ 実用指針のハイブリッド**
- 図解：機序を説明する記事には最低1つ（`<ArticleDiagram>` か `<NightShiftChart>`）
- 参考文献：本文中に[番号]、末尾 `## 参考文献` に DOI 付きで対応
- **個人的な実践セクション**を末尾付近に置く（属人性の核）。「医師としての推奨」と「当事者の意思決定」を区別
- 誠実さ：「わかっていること／まだわかっていないこと」を分離。エビデンスの限界を明示

執筆の分業（著者は文章が不得手）：
- **インタビュー形式**：テーマが決まったとき。Claudeが質問→著者が答える→Claudeが記事化
- **叩き台レビュー**：方向性がある時。Claudeが草稿→著者が修正・肉付け

## 9. 編集運用ルール

- **手書きの「関連記事」セクションは書かない**（`RelatedPosts.tsx` が同zone内をタグ/カテゴリ一致で自動表示。二重になる）
- 記事ページの順序は **本文 → 関連記事 → シェアボタン**（本文直後のシェアは読書を妨げ転換率も落ちる）
- 不要と判断済み（足さない）：コメント欄 / PV表示 / 印刷PDF / Instagram・noteシェアボタン

## 10. デザイン・世界観原則

**世界観 ＞ 機能の網羅性。** 機能を足しすぎてビジーにしない。

- UI要素は普段は世界観に溶け、使う瞬間だけ立ち上がる（例：シェアボタンは普段グレー、ホバーでブランドカラー）
- 原色の塗りボタンを並べない。アイコンのみ＋ゴースト＋端に添える、を基本形に
- ラベル文言は最小限（`SHARE` 等）
- 新機能を足す前に「これは世界観を崩さないか？」を一度問う
- wabi-sabi パレット：弁柄 `#8B3A2C` ／ 霞 `#6E665B` ／ 罫線 `#D8D2C5`
- フォント：`'Shippori Mincho B1', 'Inter', sans-serif`

---

## 11. データ公開ポリシー（最重要・プライバシー）

生データはローカルに留め、加工・匿名化済みの公開メトリクスだけがサイトに載る。

- 公開してよい：相対変化・正規化値・トレンドの形状
- **公開禁止（コミット・出力に絶対含めない）**：健康データの絶対値、具体的タイムスタンプ、主観的な当直メモ、資産の実額
- 銘柄名は公開可・金額は非公開
- 公開データは `export_public.py` が `data/public_data.json` に書き出す。**手書きで絶対値を埋め込まない**

新規にデータ表示を実装する際は「これは相対値・正規化値・形状か？」を必ず確認。絶対値・実額・正確な時刻が混入していたら実装を止めて確認する。

## 12. 作業フロー

audit → plan → 最小スコープで実装 → verify（`npm run build`）→ commit。

- 大きく作り変える前に **Plan Mode** で方針を提示し、スコープを最小化してから着手
- 指示された範囲を超える変更は事前に確認。スコープを勝手に広げない

## 13. 公開後バックアップ規約

公開した記事は Obsidian にバックアップ：
`30_projects/サイト運営/ブログ/posts/[file].md`（拡張子 `.md`、`published: true` で保存）

## 14. 環境メモ（ローカル / zsh）

- Python: pyenv の 3.12.3（マシン固有の絶対パスはこのファイルに書かない）
- zsh は `!` を履歴展開として解釈する。Python の `-c` インライン実行を避けスクリプト化。コマンドは1行ずつ実行（`#`コメント混在を避ける）
- 日本語混じり heredoc は zsh で不安定。ファイルを直接生成する方が安全
