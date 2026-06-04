// types/post.ts

export type PostCategory =
  | 'investment'    // 投資・資産形成
  | 'fire'          // FIRE戦略
  | 'medicine'      // 医療・当直
  | 'health'        // 健康管理・バイオメカニクス
  | 'real-estate'   // 古民家・不動産
  | 'life'          // ライフデザイン

export type PostFrontmatter = {
  title: string
  description?: string
  date: string              // ISO 8601: "2025-06-01"
  updated?: string          // 更新日（任意）
  category: PostCategory
  tags: string[]
  published: boolean        // false = 下書き（ビルドには含まれない）
  featured?: boolean        // トップページ掲載フラグ
  ogImage?: string          // OGP画像パス（未指定はカテゴリ別デフォルト）
}

export type PostMeta = PostFrontmatter & {
  slug: string
  readingTime: string       // "5 min read"
  readingTimeMinutes: number
}

export type Post = PostMeta & {
  content: string
  html?: string           // MDXの生文字列（next-mdx-remoteで処理前）
}

// カテゴリのメタデータ
export const CATEGORY_META: Record<PostCategory, { label: string; color: string }> = {
  investment:   { label: '投資',       color: '#4ade80' },
  fire:         { label: 'FIRE',       color: '#fb923c' },
  medicine:     { label: '医療',       color: '#60a5fa' },
  health:       { label: '健康管理',   color: '#a78bfa' },
  'real-estate':{ label: '不動産',     color: '#f472b6' },
  life:         { label: 'ライフ',     color: '#facc15' },
}
