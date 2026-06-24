'use client'

import Link from 'next/link'
import postsData from '@/data/posts.json'

interface Props {
  slug: string
}

type PostLike = {
  slug: string
  title?: string
  content?: string
}

// 日本語の概算読了時間（400字/分）。content から推定する。
function estimateReadingMinutes(content?: string): number {
  if (!content) return 0
  const chars = content.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 400))
}

export function StoryToArticle({ slug }: Props) {
  const posts = postsData as PostLike[]
  const article = posts.find((p) => p.slug === slug)
  if (!article) return null

  const minutes = estimateReadingMinutes(article.content)

  return (
    <Link
      href={`/health/blog/${slug}`}
      className="story-to-article"
      style={{
        display: 'block',
        margin: '64px 0 16px 0',
        padding: '24px 28px',
        borderLeft: '2px solid var(--accent, #8B3A2C)',
        background: 'rgba(216, 210, 197, 0.14)',
        borderRadius: '0 4px 4px 0',
        textDecoration: 'none',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent, #8B3A2C)',
          marginBottom: '12px',
        }}
      >
        この物語の科学的背景
      </div>
      <div
        style={{
          fontFamily: "'Shippori Mincho B1', serif",
          fontSize: '1.05rem',
          lineHeight: 1.5,
          color: 'var(--ink, #1B1B19)',
          marginBottom: minutes ? '12px' : 0,
        }}
      >
        {article.title}
      </div>
      {minutes > 0 && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: 'var(--muted, #6E665B)',
          }}
        >
          {minutes} min read →
        </div>
      )}
    </Link>
  )
}
