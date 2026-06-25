// app/tags/[tag]/page.tsx
// /tags/夜勤 のようなURLで、そのタグを含む全記事をzone横断で一覧する。

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostsByTag, getAllTags } from "@/lib/mdx";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} の記事`,
    description: `「${decoded}」タグの記事一覧`,
    alternates: { canonical: `https://lumen-log.com/tags/${encodeURIComponent(decoded)}` },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded).filter((p) => p.type !== "story");

  if (posts.length === 0) notFound();

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "sans-serif", marginBottom: "4px" }}>
        TAG
      </p>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px", fontFamily: "Palatino, serif" }}>
        #{decoded}
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "48px" }}>
        {posts.length}件の記事
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={`${post.zone}-${post.slug}`} style={{ borderBottom: "1px solid #E8E4DF", padding: "24px 0" }}>
            <Link href={`/${post.zone}/blog/${post.slug}`} style={{ color: "var(--foreground)" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "6px", fontFamily: "sans-serif" }}>
                {post.date} · {post.readingTime} · {post.zone}
              </p>
              <p style={{ fontSize: "1.1rem", fontFamily: "Palatino, serif", marginBottom: "8px" }}>
                {post.title}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {post.tags.map((t) => (
                  <span key={t} style={{
                    fontSize: "0.75rem",
                    color: t === decoded ? "var(--foreground)" : "var(--muted)",
                    fontFamily: "sans-serif",
                    fontWeight: t === decoded ? 600 : 400,
                  }}>
                    #{t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "48px" }}>
        <Link href="/tags" style={{ fontSize: "0.875rem", color: "var(--muted)", fontFamily: "sans-serif" }}>
          ← 全タグ一覧へ
        </Link>
      </div>
    </main>
  );
}
