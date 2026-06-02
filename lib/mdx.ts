// lib/mdx.ts
// MDXファイルの読み込み・パース・一覧取得を担うコアモジュール

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Post, PostMeta, PostFrontmatter } from '@/types/post'

const POSTS_DIR = path.join(process.cwd(), 'posts')

// ---------------------------------------------------------------------------
// ファイル一覧取得
// ---------------------------------------------------------------------------

function getPostFilePaths(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '')
}

// ---------------------------------------------------------------------------
// 単一記事取得
// ---------------------------------------------------------------------------

export function getPostBySlug(slug: string): Post | null {
  // .mdx → .md の順で探す
  const extensions = ['.mdx', '.md']
  let filePath: string | null = null

  for (const ext of extensions) {
    const candidate = path.join(POSTS_DIR, `${slug}${ext}`)
    if (fs.existsSync(candidate)) {
      filePath = candidate
      break
    }
  }

  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = data as PostFrontmatter

  // 下書きはnullを返す（本番ビルドでは除外）
  if (!frontmatter.published && process.env.NODE_ENV === 'production') {
    return null
  }

  const rt = readingTime(content)

  return {
    ...frontmatter,
    slug,
    content,
    readingTime: `${Math.ceil(rt.minutes)} min read`,
    readingTimeMinutes: Math.ceil(rt.minutes),
  }
}

// ---------------------------------------------------------------------------
// 全記事メタデータ取得（一覧ページ用）
// ---------------------------------------------------------------------------

export function getAllPostsMeta(): PostMeta[] {
  const filePaths = getPostFilePaths()

  const posts = filePaths
    .map((filename) => {
      const slug = slugFromFilename(filename)
      const post = getPostBySlug(slug)
      if (!post) return null

      // contentは一覧では不要なので除外
      const { content: _, ...meta } = post
      return meta as PostMeta
    })
    .filter((p): p is PostMeta => p !== null)

  // 日付降順
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// ---------------------------------------------------------------------------
// カテゴリ別・タグ別フィルタ
// ---------------------------------------------------------------------------

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPostsMeta().filter((p) => p.category === category)
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostsMeta().filter((p) => p.tags.includes(tag))
}

export function getFeaturedPosts(limit = 3): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.featured)
    .slice(0, limit)
}

// ---------------------------------------------------------------------------
// 静的パス生成用（generateStaticParams）
// ---------------------------------------------------------------------------

export function getAllPostSlugs(): { slug: string }[] {
  return getPostFilePaths().map((filename) => ({
    slug: slugFromFilename(filename),
  }))
}

// ---------------------------------------------------------------------------
// 全タグ一覧（重複除去・頻度付き）
// ---------------------------------------------------------------------------

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPostsMeta()
  const tagCount = new Map<string, number>()

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
    })
  })

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
