// lib/mdx.ts
import readingTime from 'reading-time'
import type { Post, PostMeta, PostType, PostCategory, PostZone, TocItem } from '@/types/post'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const postsData = require('../data/posts.json') as RawPost[]

interface RawPost {
  slug: string
  content: string
  title: string
  date: string
  tags: string[]
  zone: PostZone
  category: PostCategory
  published: boolean
  description?: string
  featured?: boolean
  html?: string
  components?: unknown[]
  toc?: TocItem[]
  type?: PostType
  episode?: number
  mainTheme?: string
  relatedArticles?: string[]
  chapterCount?: number
}

function rawToPost(raw: RawPost): Post {
  const rt = readingTime(raw.content)
  return {
    slug: raw.slug,
    content: raw.content,
    title: raw.title,
    date: raw.date,
    tags: raw.tags ?? [],
    zone: raw.zone ?? 'health',
    category: raw.category ?? '',
    published: raw.published ?? true,
    description: raw.description,
    featured: raw.featured ?? false,
    readingTime: `${Math.ceil(rt.minutes)} min read`,
    readingTimeMinutes: Math.ceil(rt.minutes),
    html: raw.html,
    components: (raw.components ?? []) as Post['components'],
    toc: raw.toc ?? [],
    type: raw.type ?? 'article',
    episode: raw.episode,
    mainTheme: raw.mainTheme,
    relatedArticles: raw.relatedArticles,
    chapterCount: raw.chapterCount,
  }
}

// type 判定ヘルパー: type 未指定は 'article' 扱い
function isStory(p: RawPost): boolean {
  return p.type === 'story'
}

export function getPostBySlug(slug: string): Post | null {
  const raw = postsData.find((p) => p.slug === slug)
  if (!raw) return null
  if (!raw.published && process.env.NODE_ENV === 'production') return null
  return rawToPost(raw)
}

export function getPostBySlugAndZone(slug: string, zone: PostZone): Post | null {
  const raw = postsData.find((p) => p.slug === slug && p.zone === zone)
  if (!raw) return null
  if (!raw.published && process.env.NODE_ENV === 'production') return null
  return rawToPost(raw)
}

export function getAllPostsMeta(): PostMeta[] {
  return postsData
    .filter((p) => p.published || process.env.NODE_ENV !== 'production')
    .map((raw) => {
      const { content: _, ...meta } = rawToPost(raw)
      return meta as PostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostsByZone(zone: PostZone): PostMeta[] {
  // 記事のみ（小説は除外）。type 未指定は記事扱い。
  return getAllPostsMeta().filter((p) => p.zone === zone && p.type !== 'story')
}

export function getPostSlugsByZone(zone: PostZone): { slug: string }[] {
  return postsData
    .filter((p) => p.zone === zone && p.type !== 'story')
    .map((p) => ({ slug: p.slug }))
}

export function getAllPostSlugs(): { slug: string }[] {
  return postsData.map((p) => ({ slug: p.slug }))
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPostsMeta().filter((p) => p.category === category)
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostsMeta().filter((p) => p.tags.includes(tag))
}

export function getFeaturedPosts(limit = 3): PostMeta[] {
  return getAllPostsMeta().filter((p) => p.featured).slice(0, limit)
}

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

// ============================================================
// 連載小説（story）専用の取得関数
// ============================================================

// zone 内の story を episode 昇順で返す
export function getStoriesByZone(zone: PostZone): PostMeta[] {
  return postsData
    .filter((p) => p.zone === zone && isStory(p))
    .filter((p) => p.published || process.env.NODE_ENV !== 'production')
    .map((raw) => {
      const { content: _content, ...meta } = rawToPost(raw)
      return meta as PostMeta
    })
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
}

export function getStoryBySlugAndZone(slug: string, zone: PostZone): Post | null {
  const raw = postsData.find((p) => p.slug === slug && p.zone === zone && isStory(p))
  if (!raw) return null
  if (!raw.published && process.env.NODE_ENV === 'production') return null
  return rawToPost(raw)
}

export function getStorySlugsByZone(zone: PostZone): { slug: string }[] {
  return postsData
    .filter((p) => p.zone === zone && isStory(p))
    .map((p) => ({ slug: p.slug }))
}
