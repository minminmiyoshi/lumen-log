import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      {/* 日付・タグ */}
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--muted)",
          marginBottom: "8px",
          fontFamily: "sans-serif",
        }}
      >
        {post.date}
      </p>

      {/* タイトル */}
      <h1
        style={{
          fontSize: "1.8rem",
          marginBottom: "12px",
          lineHeight: 1.4,
        }}
      >
        {post.title}
      </h1>

      {/* タグ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px" }}>
        {post.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              fontFamily: "sans-serif",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 本文 */}
      <article
        style={{
          lineHeight: 1.9,
          fontSize: "1rem",
        }}
      >
        <MDXRemote source={post.content} />
      </article>

      {/* 戻るリンク */}
      <div style={{ marginTop: "64px" }}>
        <a href="/blog" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← ブログ一覧へ
        </a>
      </div>
    </main>
  );
}