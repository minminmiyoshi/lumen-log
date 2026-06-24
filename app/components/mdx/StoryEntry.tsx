'use client'

import Link from 'next/link'
import postsData from '@/data/posts.json'

interface Props {
  episode: number
}

type PostLike = {
  slug: string
  title?: string
  type?: string
  episode?: number
  mainTheme?: string
}

export function StoryEntry({ episode }: Props) {
  const posts = postsData as PostLike[]
  const story = posts.find(
    (p) => p.type === 'story' && Number(p.episode) === Number(episode)
  )
  if (!story) return null

  return (
    <Link
      href={`/health/stories/${story.slug}`}
      className="story-entry"
      style={{
        display: 'block',
        margin: '8px 0 40px 0',
        padding: '20px 24px',
        border: '1px solid var(--border, #D8D2C5)',
        background: 'rgba(216, 210, 197, 0.10)',
        borderRadius: '4px',
        textDecoration: 'none',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'var(--muted, #6E665B)',
          marginBottom: '10px',
        }}
      >
        この記事のテーマを物語で読む
      </div>
      <div
        style={{
          fontFamily: "'Shippori Mincho B1', serif",
          fontSize: '1rem',
          lineHeight: 1.5,
          color: 'var(--ink, #1B1B19)',
          marginBottom: story.mainTheme ? '8px' : 0,
        }}
      >
        {story.title}
      </div>
      {story.mainTheme && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: 'var(--muted, #6E665B)',
          }}
        >
          {story.mainTheme} →
        </div>
      )}
    </Link>
  )
}
