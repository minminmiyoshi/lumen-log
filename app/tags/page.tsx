// app/tags/page.tsx
// 全タグを件数つきで一覧。タグクラウド。

import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/mdx";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "lumen-log の全タグ一覧",
  alternates: { canonical: "https://lumen-log.com/tags" },
};

export default function TagsIndexPage() {
  const tags = getAllTags(); // [{ tag, count }] 件数降順

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px", fontFamily: "Palatino, serif" }}>
        Tags
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "48px" }}>
        タグから記事を探す
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            style={{
              fontSize: "0.85rem",
              fontFamily: "sans-serif",
              color: "var(--foreground)",
              padding: "6px 14px",
              border: "1px solid #E8E4DF",
              borderRadius: "9999px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            #{tag}
            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{count}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
