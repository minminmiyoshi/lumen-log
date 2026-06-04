// lib/mdx.ts
import readingTime from 'reading-time'
import type { Post, PostMeta, PostCategory } from '@/types/post'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const postsData = require('../data/posts.json') as RawPost[]

interface RawPost {
  slug: string
  content: string
  title: string
  date: string
  tags: string[]
  category: PostCategory
  published: boolean
  description?: string
  featured?: boolean
  html?: string
}

function rawToPost(raw: RawPost): Post {
  const rt = readingTime(raw.content)
  return {
    slug: raw.slug,
    content: raw.content,
    title: raw.title,
    date: raw.date,
    tags: raw.tags ?? [],
    category: raw.category ?? '',
    published: raw.published ?? true,
    description: raw.description,
    featured: raw.featured ?? false,
    readingTime: `${Math.ceil(rt.minutes)} min read`,
    readingTimeMinutes: Math.ceil(rt.minutes),
    html: raw.html,
  }
}

export function getPostBySlug(slug: string): Post | null {
  const raw = postsData.find((p) => p.slug === slug)
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