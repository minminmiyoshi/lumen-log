# CLAUDE.md — lumen-log

このファイルは Claude Code がこのリポジトリで作業する際の恒久的な前提。毎セッション読み込まれる。
※このファイルはリポジトリにコミットされる。秘密情報・資産の実額・健康データの絶対値はここに書かない。

## プロジェクト概要

「夜勤医師 × 投資家 × セルフ最適化マニア」の一次情報サイト（lumen-log.com）。SEO資産として運用。
Next.js を OpenNext 経由で Cloudflare Pages にデプロイ。

## 技術スタック（変更厳禁の前提）

- Next.js（App Router） / TypeScript
- デプロイ: OpenNext → Cloudflare Pages（**main ブランチのみ**。non-production ビルドは無効）
- スタイル: **Tailwind v4 / CSS-first（`@theme`）**。`tailwind.config.js` ベースの旧式設定は使わない
- チャート: **Recharts のみ**。Chart.js は撤去済み。新規チャートで Chart.js / 他ライブラリを導入しない
- MDX: **ビルド時パイプライン**（ランタイム MDX ではない）

## 絶対ルール

1. チャートは Recharts。他ライブラリを足さない。
2. スタイルは Tailwind v4 の `@theme` トークン経由。色べた書き・任意値の乱用を避け、既存トークンを使う。
3. MDX はランタイムで処理しない。必ず build-time パイプラインを通す。
4. **push 前に必ず `npm run build`**（`npm run dev` だけで済ませない）。型エラー・バンドルエラーをここで潰す。
5. ブランチは切らない。**main に直接**作業・コミット。
6. 人間の規律ではなく**ビルドで強制**する。必須 frontmatter 欠落やルール違反は「ビルドを失敗させる」方向で実装する。

## ディレクトリ / URL構造（3層）

- `/health/` — 夜勤労働者向けコンテンツ＋ツール
  - `/health/tools/shift-damage-score/` — シフトダメージスコアラー（完成。Canvas API で PNG ダウンロード＋X シェア）
- `/money/` — 資産形成・FIRE シミュレーション・ポートフォリオ
- `/about/` — プロフィール / 世界観

## MDX パイプライン（壊さないこと）

- `scripts/build-posts.mjs` が MDX → HTML をビルド時変換し `data/posts.json` に格納
- JSX コンポーネントは `<div data-mdx-placeholder>`＋props（JSON）として抽出され、`MdxRenderer.tsx` がクライアント側でハイドレート
- 連載小説「Lumen」: 1エピソード = 1 MDX ファイル。章を追記して成長させる。**章数は見出しから自動算出**（手動カウントしない）
- 章の追記は `scripts/append-episode-chapter.mjs` を使う
- 連載の公開制御は3重（MDX `published: false` ＋ NODE_ENV ガード2か所）。note.com 連載開始時に一斉公開する設計。
  → **勝手に `published: true` にしない / ガードを外さない**

## データ公開ポリシー（最重要・プライバシー）

生データはローカルに留め、加工・匿名化済みの公開メトリクスだけがサイトに載る。

- 公開してよい: 相対変化・正規化値・トレンドの形状
- **公開禁止（コミット・出力に絶対含めない）**: 健康データの絶対値、具体的タイムスタンプ、主観的な当直メモ、資産の実額
- 銘柄名は公開可・金額は非公開
- 公開データは `export_public.py` が `data/public_data.json` に書き出す。**手書きで絶対値を埋め込まない**

新規にデータ表示を実装する際は「これは相対値・正規化値・形状か？」を必ず確認する。
絶対値・実額・正確な時刻が混入していたら実装を止めて確認する。

## コマンド

```bash
npm run dev     # ローカル確認
npm run build   # push 前に必須（型・バンドルエラーの最終チェック）
```

## 作業フロー

audit → plan → 最小スコープで実装 → verify（`npm run build`）→ commit。

- 大きく作り変える前に **Plan Mode** で方針を提示し、スコープを最小化してから着手する
- スコープを勝手に広げない。指示された範囲を超える変更は事前に確認する

## 環境メモ（ローカル / zsh）

- Python: pyenv の 3.12.3 を使用（マシン固有の絶対パスはこのファイルに書かない）
- zsh は `!` を履歴展開として解釈する。Python の `-c` インライン実行を避け、スクリプト化して実行する
- 日本語混じりの heredoc は zsh で不安定。ファイルを直接生成する方が安全
