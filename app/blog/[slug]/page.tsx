import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getAllPostSlugs } from '@/lib/mdx'
import { MDX_OPTIONS } from '@/lib/mdx-options'
import { MDX_COMPONENTS } from '@/app/components/mdx/MdxComponents'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllPostSlugs()
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px' }}>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px', fontFamily: 'sans-serif' }}>
        {post.date} · {post.readingTime}
      </p>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '12px', lineHeight: 1.4 }}>
        {post.title}
      </h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '48px' }}>
        {post.tags.map((tag) => (
          <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'sans-serif' }}>
            #{tag}
          </span>
        ))}
      </div>
      <article style={{ lineHeight: 1.9, fontSize: '1rem' }}>
        <MDXRemote
          source={post.content}
          options={MDX_OPTIONS}
          components={MDX_COMPONENTS}
        />
      </article>
      <div style={{ marginTop: '64px' }}>
        <Link href="/blog" style={{ fontSize: '0.875rem', color: 'var(--muted)', fontFamily: 'sans-serif' }}>
          ← ブログ一覧へ
        </Link>
      </div>
    </main>
  )
}