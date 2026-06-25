// components/RelatedPosts.tsx
// 同zone内から、タグ・カテゴリの一致度でスコアリングして関連記事を出す。
// サーバーコンポーネント（"use client"不要）。記事ページから呼ぶ。

import Link from "next/link";
import type { PostMeta } from "@/types/post";

interface RelatedPostsProps {
  current: PostMeta;       // 現在の記事
  candidates: PostMeta[];  // 同zoneの全記事（呼び出し側で getPostsByZone を渡す）
  limit?: number;
}

function scoreRelatedness(current: PostMeta, other: PostMeta): number {
  if (other.slug === current.slug) return -1; // 自分自身は除外
  let score = 0;
  // カテゴリ一致は重め
  if (other.category === current.category) score += 3;
  // タグ一致は1つにつき+2
  const currentTags = new Set(current.tags);
  for (const tag of other.tags) {
    if (currentTags.has(tag)) score += 2;
  }
  return score;
}

export default function RelatedPosts({ current, candidates, limit = 3 }: RelatedPostsProps) {
  const ranked = candidates
    .map((post) => ({ post, score: scoreRelatedness(current, post) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      // スコア優先、同点なら新しい順
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    })
    .slice(0, limit)
    .map((x) => x.post);

  if (ranked.length === 0) return null;

  return (
    <section style={{ marginTop: "56px", paddingTop: "32px", borderTop: "1px solid var(--border, #D8D2C5)" }}>
      <p style={{
        fontSize: "0.7rem",
        fontFamily: "sans-serif",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: "20px",
      }}>
        関連記事
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ranked.map((post) => (
          <li key={post.slug} style={{ marginBottom: "20px" }}>
            <Link href={`/${post.zone}/blog/${post.slug}`} style={{ color: "var(--foreground)", textDecoration: "none" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "4px", fontFamily: "sans-serif" }}>
                {post.date} · {post.readingTime}
              </p>
              <p style={{ fontSize: "0.9rem", fontFamily: "Palatino, serif", lineHeight: 1.5 }}>
                {post.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
