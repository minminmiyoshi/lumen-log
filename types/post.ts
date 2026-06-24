// types/post.ts

export type PostZone = 'health' | 'money' | 'sangyoi'

// コンテンツ種別: 記事 or 連載小説
export type PostType = 'article' | 'story'

export type PostCategory =
  | 'investment'    // 投資・資産形成
  | 'fire'          // FIRE戦略
  | 'medicine'      // 医療・当直
  | 'health'        // 健康管理・バイオメカニクス
  | 'real-estate'   // 古民家・不動産
  | 'life'          // ライフデザイン
  | 'life-design'   // ライフデザイン（LLM活用等）

export type PostFrontmatter = {
  title: string
  description?: string
  date: string              // ISO 8601: "2025-06-01"
  updated?: string          // 更新日（任意）
  zone: PostZone            // ゾーン: health / money / sangyoi
  category: PostCategory
  tags: string[]
  published: boolean        // false = 下書き（ビルドには含まれない）
  featured?: boolean        // トップページ掲載フラグ
  ogImage?: string          // OGP画像パス（未指定はカテゴリ別デフォルト）
  // --- 連載小説（story）用フィールド。type 未指定時は 'article' 扱い ---
  type?: PostType           // 'article'（デフォルト） | 'story'
  episode?: number          // story のときのエピソード番号
  mainTheme?: string        // story の主たる健康テーマ
  relatedArticles?: string[] // 連動するB記事の slug 配列
  chapterCount?: number     // story の公開済み話数（本文から自動カウント）
}

export type PostMeta = PostFrontmatter & {
  slug: string
  readingTime: string       // "5 min read"
  readingTimeMinutes: number
}

export type MdxComponentData = {
  id: string
  name: string
  props: Record<string, unknown>
  children: string | null
}

export type TocItem = {
  level: number  // 2 or 3 (h2 or h3)
  text: string
  id: string
}

export type Post = PostMeta & {
  content: string
  html?: string
  components?: MdxComponentData[]
  toc?: TocItem[]
}

// カテゴリのメタデータ
export const CATEGORY_META: Record<PostCategory, { label: string; color: string }> = {
  investment:    { label: '投資',         color: '#4ade80' },
  fire:          { label: 'FIRE',         color: '#fb923c' },
  medicine:      { label: '医療',         color: '#60a5fa' },
  health:        { label: '健康管理',     color: '#a78bfa' },
  'real-estate': { label: '不動産',       color: '#f472b6' },
  life:          { label: 'ライフ',       color: '#facc15' },
  'life-design': { label: 'ライフデザイン', color: '#34d399' },
}

// ゾーンのメタデータ
export const ZONE_META: Record<PostZone, { label: string; description: string }> = {
  health:   { label: 'Health',  description: '夜勤・睡眠・ウェアラブル・パフォーマンス最適化' },
  money:    { label: 'Money',   description: '資産形成・投資判断・FIRE戦略・不動産' },
  sangyoi:  { label: '産業医',  description: '産業医サービス・企業向け健康管理' },
}
